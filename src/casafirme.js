'use strict';

// Casa Firme — proyecto 3 de los diez de Vespi: los campamentos.
//
// Este archivo es la carrocería; el núcleo ejecutable es el kernel de Vespi, que este
// proyecto consume sin modificar. La puerta de varias firmas, el predicado de suficiencia
// con presupuesto, destino y reloj, el recibo sellado y la reconstrucción por recibos son
// del núcleo. Lo que el núcleo no expresa y este proyecto agrega son cinco cosas:
//
//   1. el acta de asamblea como origen único de la autoridad, y el quorum que la vuelve
//      válida;
//   2. la derivación de permisos, que solo puede reducir;
//   3. el recorrido del dinero del donante, que se puede reponer con los recibos solos;
//   4. la cadena del registro, que delata una reescritura;
//   5. el manifiesto de campos cerrados, que hace imposible escribir el dato de una familia
//      en vez de prometer que no se escribe.
//
// Los datos son de ejemplo, el efecto es local y reversible, y nada sale del proyecto.

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const {
  sufficient,
  createOperation,
  runOperation,
  STATES,
  verifyReceipt,
  resumeFromReceipts,
} = require('./kernel-instalado.js');

const REGISTRO = 'registro.jsonl';

// El campo de la familia que este proyecto no puede escribir. No es una lista de datos que
// el proyecto se promete no guardar: es el conjunto de claves que **no existen** en el
// esquema de ninguna línea. No hay promesa; hay una puerta que no está.
const CAMPOS_DE_FAMILIA = [
  'nombre', 'nombres', 'apellido', 'apellidos', 'rut', 'dni',
  'domicilio', 'direccion', 'telefono', 'email', 'fecha_nacimiento', 'ficha', 'razon_social',
];

// El esquema cerrado. Cada tipo de línea declara sus campos y `escribir` rechaza lo que no
// esté aquí. `anterior` y `en` los agrega el propio registro.
const ESQUEMA = {
  catastro: ['tipo', 'id', 'vigente', 'ejemplo', 'en'],
  actor: ['tipo', 'id', 'rol', 'en'],
  postulacion: ['tipo', 'clave', 'alias', 'huella_catastro', 'catastro', 'prueba', 'en'],
  acta: ['tipo', 'id', 'quorum_requerido', 'firmantes_permitidos', 'firmas_contadas', 'firmas_descartadas', 'otorgada', 'otorgados', 'fecha', 'en'],
  permiso: ['tipo', 'id', 'acta', 'actor', 'paso', 'alcance', 'presupuesto', 'destino', 'reloj', 'pausers', 'transferida_de', 'en'],
  donacion: ['tipo', 'id', 'aportante', 'unidades', 'en'],
  construccion: ['tipo', 'clave', 'permiso', 'acta', 'actor', 'paso', 'unidades', 'destino', 'en'],
  entrega: ['tipo', 'clave', 'permiso', 'acta', 'actor', 'paso', 'en'],
  uso: ['tipo', 'clave', 'donacion', 'aportante', 'concepto', 'unidades', 'destinos', 'en'],
  operacion: ['tipo', 'id', 'accion', 'estado', 'operacion', 'en'],
  recibo: ['tipo', 'clave', 'paso', 'recibo', 'en'],
};

// Lo que una llamada acepta. Igual de cerrado que el esquema: una entrada no declarada se
// rechaza, en vez de ignorarse en silencio.
const ENTRADA = {
  registrarCatastro: ['id', 'vigente', 'ejemplo'],
  registrarActor: ['id', 'rol'],
  probarCatastro: ['huellaCatastro'],
  postular: ['alias', 'huellaCatastro', 'clave', 'catastro'],
  abrirActa: ['id', 'quórumRequerido', 'firmantesPermitidos', 'firmas', 'permisos', 'pausers', 'fecha'],
  delegar: ['id', 'hereda', 'actor', 'paso', 'alcance', 'presupuesto', 'destino', 'reloj', 'pausers', 'delegado_por'],
  construir: ['permiso', 'unidades', 'clave', 'acta', 'destino', 'now'],
  entregar: ['permiso', 'clave', 'acta', 'now'],
  registrarDonacion: ['id', 'aportante', 'unidades', 'clave'],
  usarDonacion: ['donacion', 'concepto', 'unidades', 'clave', 'verificador', 'now'],
};

const CAMPOS_DE_PERMISO = ['id', 'actor', 'paso', 'alcance', 'presupuesto', 'destino', 'reloj'];

// Lo que el verificador tiene que recomputar desde el registro para que un recibo valga en
// la auditoría. Un verificador que no produce este conjunto no verificó nada, y la
// auditoría lo dice en vez de mostrar un verde.
const COMPROBACIONES = ['fuente-autorizada', 'trazable-al-origen', 'ejecutado-una-vez', 'registro-intacto'];

// El orden del acuerdo tal como el donante lo conoce: postulación, acta, construcción y
// uso. La entrega es el cierre del comité y no es un paso que el recorrido del dinero
// espere; quien quiera el recorrido completo usa PASOS_CON_ENTREGA.
const PASOS_DEL_ACUERDO = [
  { paso: 'postulacion', accion: 'casafirme:postular' },
  { paso: 'acta', accion: 'casafirme:acta' },
  { paso: 'construccion', accion: 'casafirme:construir' },
  { paso: 'uso', accion: 'casafirme:uso' },
];

const PASOS_CON_ENTREGA = [...PASOS_DEL_ACUERDO, { paso: 'entrega', accion: 'casafirme:entregar' }];

// Una sal de ejemplo, escrita aquí a mano. Con ella el alias de una familia es un
// pseudónimo y no un identificador que se pueda volver a obtener probando una lista corta.
const SAL = 'casafirme-ejemplo-2026-09-29';

function texto(valor) {
  return typeof valor === 'string' && valor.length > 0;
}

function entero(valor) {
  if (typeof valor === 'bigint') return valor >= 0n ? valor : null;
  if (typeof valor === 'number') return Number.isSafeInteger(valor) && valor >= 0 ? BigInt(valor) : null;
  return typeof valor === 'string' && /^\d+$/.test(valor) ? BigInt(valor) : null;
}

function canonico(valor) {
  if (Array.isArray(valor)) return valor.map(canonico);
  if (valor !== null && typeof valor === 'object') {
    const fuera = {};
    for (const clave of Object.keys(valor).sort()) fuera[clave] = canonico(valor[clave]);
    return fuera;
  }
  return valor;
}

function huellaDe(valor) {
  return createHash('sha256').update(JSON.stringify(canonico(valor)), 'utf8').digest('hex');
}

// La huella de una línea se calcula sobre su cuerpo **sin** el campo `huella`. Recalcularla
// sobre la línea entera incluiría la propia huella en el material y nunca calzaría: es el
// error que hace que un `registro-intacto` salga rojo sin que nadie haya tocado nada.
function huellaDeLinea(linea) {
  const { huella, ...cuerpo } = linea;
  return huellaDe(cuerpo);
}

function iso(ahora) {
  if (ahora === undefined || ahora === null) return new Date().toISOString();
  const ms = Date.parse(ahora);
  return Number.isNaN(ms) ? new Date().toISOString() : new Date(ms).toISOString();
}

// La puerta de entrada de toda escritura. Se ejecuta **sincrónicamente**, antes de que la
// operación empiece: por eso `postular({ nombre: 'X' })` lanza, en vez de devolver una
// promesa rechazada que nadie llega a ver.
function entradasDeclaradas(operacion, spec, tipo) {
  const permitidas = ENTRADA[operacion] || [];
  for (const clave of Object.keys(spec || {})) {
    if (permitidas.includes(clave)) continue;
    const familia = CAMPOS_DE_FAMILIA.includes(clave) ? ' Es exactamente el dato de una familia, y aquí no existe.' : '';
    throw new Error(`«${clave}» es un campo no declarado en la entrada de «${operacion}» (línea «${tipo}»): fuera del esquema cerrado.${familia}`);
  }
}

function lineaValida(tipo, cuerpo) {
  const permitidos = ESQUEMA[tipo];
  if (!permitidos) throw new Error(`no hay esquema declarado para una línea de tipo «${tipo}»`);
  for (const clave of Object.keys(cuerpo)) {
    if (CAMPOS_DE_FAMILIA.includes(clave)) {
      throw new Error(`«${clave}» es un campo no declarado en el esquema de «${tipo}»: fuera del esquema cerrado. Es el dato de una familia, y aquí no existe.`);
    }
    if (!permitidos.includes(clave)) {
      throw new Error(`«${clave}» es un campo no declarado en el esquema de «${tipo}»: fuera del esquema cerrado.`);
    }
  }
  return cuerpo;
}

class CasaFirme {
  constructor({ dir } = {}) {
    if (!texto(dir)) throw new Error('Casa Firme necesita una carpeta donde dejar el registro');
    this.dir = dir;
    this.ruta = path.join(dir, REGISTRO);
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.ruta)) fs.writeFileSync(this.ruta, '', 'utf8');
  }

  // --- El registro: un archivo que cualquiera abre con cualquier editor ---

  leer() {
    return fs.readFileSync(this.ruta, 'utf8').split('\n').filter((l) => l.trim().length > 0).map((l) => JSON.parse(l));
  }

  lineas(tipo) {
    return this.leer().filter((l) => l.tipo === tipo);
  }

  // Cada línea se encadena con la anterior. Reescribir una línea vieja no rompe esa línea:
  // rompe todas las que van después, y `auditarCadena` lo ve.
  escribir(cuerpo) {
    const valida = lineaValida(cuerpo.tipo, cuerpo);
    const existentes = this.leer();
    const anterior = existentes.length > 0 ? existentes[existentes.length - 1].huella : null;
    const encadenada = { ...valida, anterior, en: valida.en || iso() };
    const completa = { ...encadenada, huella: huellaDe(encadenada) };
    fs.appendFileSync(this.ruta, `${JSON.stringify(completa)}\n`, 'utf8');
    return completa;
  }

  // --- Lo que existe antes de que haya autoridad ---

  registrarCatastro(spec) {
    entradasDeclaradas('registrarCatastro', spec, 'catastro');
    if (!texto(spec.id)) throw new Error('un catastro necesita id');
    const previa = this.lineas('catastro').find((c) => c.id === spec.id);
    if (previa) return previa;
    return this.escribir({ tipo: 'catastro', id: spec.id, vigente: spec.vigente || 'junio de 2024', ejemplo: spec.ejemplo !== false });
  }

  registrarActor(spec) {
    entradasDeclaradas('registrarActor', spec, 'actor');
    if (!texto(spec.id)) throw new Error('un actor necesita id');
    const previo = this.lineas('actor').find((a) => a.id === spec.id);
    if (previo) return previo;
    return this.escribir({ tipo: 'actor', id: spec.id, rol: spec.rol || 'sin rol declarado' });
  }

  // El alias de la familia: un pseudónimo derivado de la huella del catastro, con sal. La
  // familia **no tiene línea**: tiene un alias y una huella, y nada más.
  probarCatastro(spec) {
    entradasDeclaradas('probarCatastro', spec, 'postulacion');
    if (!texto(spec.huellaCatastro)) throw new Error('una prueba de catastro necesita la huella del catastro');
    return {
      simulado: true,
      declara: 'El kernel 0.1.5 incluye un verificador de conocimiento cero, pero Casa Firme no lo integra: lo que corre aquí es SIMULADO, y cada pantalla lo dice.',
      afirma: 'que esta familia está en el catastro vigente',
      prueba: 'la simulación no prueba nada de eso: deriva un alias y lo deja anotado',
      huellaCatastro: spec.huellaCatastro,
      alias: `fam-${createHash('sha256').update(`${SAL}:${spec.huellaCatastro}`, 'utf8').digest('hex').slice(0, 12)}`,
    };
  }

  // --- La postulación: la familia entra por la puerta y no por el nombre ---

  // Aplica el predicado de suficiencia del núcleo antes de abrir la operación, para que el
  // bloqueo diga por qué en la lengua de quien está mirando y no solo en la del núcleo.
  suficiente(spec, now) {
    return sufficient(
      spec.requisito.multiple ? spec.requisito.multiple : [spec.requisito],
      spec.autoridad,
      { now },
    );
  }

  // El mensaje del núcleo no sabe de actas ni de familias. Esto le pone el sujeto encima
  // sin borrar lo que el núcleo dijo: la razón es del núcleo, la traducción es del proyecto.
  enriquecer(motivo, spec) {
    const permiso = spec.permiso ? this.permisos().find((p) => p.id === spec.permiso) : null;
    if (!permiso) return motivo;
    if (/no grant for asset .* to vivienda:/.test(motivo)) {
      return `el permiso ${permiso.id} sirve en ${permiso.destino} y este paso pide ${String(spec.destino)}: una autorización no viaja (${motivo})`;
    }
    if (/consume/.test(motivo)) {
      return `el permiso ${permiso.id} alcanzaba ${this.restanteDe(permiso)} unidades y este paso pide ${String(spec.unidades)} (${motivo})`;
    }
    return motivo;
  }

  restanteDe(permiso) {
    const libre = entero(permiso.presupuesto) - this.gastadoDe(permiso.id);
    return String(libre < 0n ? 0n : libre);
  }

  // La postulación no es un paso que otro paso autoriza: es la entrada. Su predicado lo
  // decide el núcleo igual, y su razón no necesita traducción.
  postular(spec) {
    entradasDeclaradas('postular', spec, 'postulacion');
    if (!texto(spec.alias) || !texto(spec.huellaCatastro) || !texto(spec.clave)) {
      throw new Error('una postulación necesita su alias, la huella del catastro y una clave');
    }
    return this.correr({
      accion: 'casafirme:postular',
      paso: 'postulacion',
      clave: spec.clave,
      goal: 'la familia del catastro postula a la vivienda de Casa Firme',
      agente: 'familia-del-catastro',
      salida: 'vuelve a la familia y al comité: sin postulación no hay nada que decidir',
      autoridad: { spend: [{ asset: 'paso:postulacion', maxAmount: '1', to: `catastro:${spec.catastro || 'catastro-minvu-2024-06'}` }], pausers: ['comite-1', 'donante-1'] },
      requisito: { asset: 'paso:postulacion', amount: '1', to: `catastro:${spec.catastro || 'catastro-minvu-2024-06'}` },
      cuerpo: () => ({
        tipo: 'postulacion',
        clave: spec.clave,
        alias: spec.alias,
        huella_catastro: spec.huellaCatastro,
        catastro: spec.catastro || 'catastro-minvu-2024-06',
        prueba: 'simulada: Casa Firme no integra el verificador de conocimiento cero del kernel 0.1.5',
        en: iso(),
      }),
      checks: () => {
        const lineas = this.postulaciones().filter((p) => p.clave === spec.clave);
        const una = lineas[0];
        return {
          'fuente-autorizada': this.lineas('catastro').some((c) => c.id === una.catastro),
          'trazable-al-origen': una.huella_catastro === spec.huellaCatastro && una.alias === spec.alias,
          'ejecutado-una-vez': lineas.length === 1,
          'registro-intacto': huellaDeLinea(una) === una.huella,
        };
      },
    });
  }

  // --- El acta: la única fuente de autoridad ---

  // Quien no está en la lista de firmantes no firma. La familia puede intentarlo: la puerta
  // cuenta lo que sí cuenta y nombra lo que descartó, y el recuento no se mueve.
  async abrirActa(spec) {
    entradasDeclaradas('abrirActa', spec, 'acta');
    if (spec.id === undefined) throw new Error('el acta necesita id');
    if (!Array.isArray(spec.permisos) || spec.permisos.length === 0) {
      throw new Error('un acta sin permisos no otorga nada, y no se levanta una asamblea para eso');
    }
    for (const p of spec.permisos) {
      for (const campo of CAMPOS_DE_PERMISO) {
        if (p[campo] === undefined) throw new Error(`un permiso necesita ${campo}: no hay permiso sin él`);
      }
      if (entero(p.presupuesto) === null) throw new Error('el presupuesto de un permiso es un número entero de unidades');
      if (Number.isNaN(Date.parse(p.reloj))) throw new Error('el reloj de un permiso es una hora');
    }
    const repetido = spec.permisos.find((p) => this.permisos().some((x) => x.id === p.id));
    if (repetido) {
      return this.bloqueado(`el permiso ${repetido.id} ya existe en el registro: un permiso se otorga una vez, y cambiarlo pide otra acta y otro id`, 'vuelve al comité: redacta el acta nueva con identificadores propios');
    }

    const permitidos = Array.isArray(spec.firmantesPermitidos) ? spec.firmantesPermitidos : [];
    const requeridos = entero(spec.quórumRequerido) ?? 1n;
    const firmas = Array.isArray(spec.firmas) ? spec.firmas : [];
    const contadas = firmas.filter((f) => permitidos.includes(f));
    const descartadas = firmas
      .filter((f) => !permitidos.includes(f))
      .map((f) => ({ quien: f, motivo: `${f} no es firmante de esta asamblea: la autoridad nace del acta del comité de vivienda, y una familia afectada no es un firmante` }));

    return this.correr({
      accion: 'casafirme:acta',
      paso: 'acta',
      clave: String(spec.id),
      goal: `la asamblea del comité otorga ${String(spec.permisos.length)} permisos para la vivienda`,
      agente: 'comite-1',
      salida: 'vuelve al comité de vivienda: convoca una asamblea nueva con quorum',
      autoridad: {
        spend: spec.permisos.map((p) => ({ asset: `permiso:${p.id}`, maxAmount: '1', to: `paso:${p.paso}` })),
        signers: { required: Number(requeridos), allowed: permitidos },
        pausers: spec.pausers || ['comite-1'],
      },
      requisito: { multiple: spec.permisos.map((p) => ({ asset: `permiso:${p.id}`, amount: '1', to: `paso:${p.paso}` })) },
      firmaGate: contadas,
      cuerpo: () => ({
        tipo: 'acta',
        id: String(spec.id),
        quorum_requerido: Number(requeridos),
        firmantes_permitidos: permitidos,
        firmas_contadas: contadas.length,
        firmas_descartadas: descartadas,
        otorgada: true,
        otorgados: spec.permisos.map((p) => p.id),
        fecha: iso(spec.fecha),
        en: iso(),
      }),
      // Los permisos se escriben como parte del efecto, antes de verificar: el verificador
      // tiene que poder mirarlos para recalcular, y un efecto que ocurre después de
      // verificar es un efecto que nadie comprobó.
      trasEfecto: () => {
        for (const p of spec.permisos) {
          this.escribir({
            tipo: 'permiso',
            id: p.id,
            acta: String(spec.id),
            actor: p.actor,
            paso: p.paso,
            alcance: p.alcance,
            presupuesto: String(entero(p.presupuesto)),
            destino: p.destino,
            reloj: iso(p.reloj),
            pausers: spec.pausers || ['comite-1'],
            transferida_de: null,
            en: iso(),
          });
        }
      },
      checks: () => {
        const actas = this.actas().filter((a) => a.id === String(spec.id));
        const una = actas[0];
        const otorgados = una ? una.otorgados : [];
        return {
          'fuente-autorizada': una !== undefined && una.firmas_contadas >= Number(requeridos) && una.firmas_contadas === contadas.length,
          'trazable-al-origen': otorgados.length === spec.permisos.length && spec.permisos.every((p) => this.permisos().some((x) => x.id === p.id && x.acta === String(spec.id))),
          'ejecutado-una-vez': actas.length === 1,
          'registro-intacto': una !== undefined && huellaDeLinea(una) === una.huella,
        };
      },
      extra: { firmasContadas: contadas.length, firmasDescartadas: descartadas },
    });
  }

  // Delegar reduce: el permiso hijo es un subconjunto del de origen, y el nombre del padre
  // viaja porque el hijo tiene id propio.
  delegar(spec) {
    entradasDeclaradas('delegar', spec, 'permiso');
    const padre = this.permisos().find((p) => p.id === spec.hereda);
    if (!padre) throw new Error(`no hay permiso ${String(spec.hereda)} del que derivar`);
    for (const [que, campo] of [['alcance', 'alcance'], ['paso', 'paso'], ['destino', 'destino']]) {
      const valor = spec[campo] === undefined ? padre[campo] : spec[campo];
      if (valor !== padre[campo]) {
        throw new Error(`una derivación que cambia el ${que} amplifica el permiso: ${String(padre[campo])} → ${String(valor)}`);
      }
    }
    const pedido = entero(spec.presupuesto === undefined ? padre.presupuesto : String(spec.presupuesto));
    const original = entero(padre.presupuesto);
    if (pedido === null || original === null || pedido > original) {
      throw new Error(`una derivación que agranda el presupuesto amplifica el permiso: ${String(padre.presupuesto)} → ${String(spec.presupuesto)}`);
    }
    const reloj = spec.reloj === undefined ? padre.reloj : iso(spec.reloj);
    if (Date.parse(reloj) > Date.parse(padre.reloj)) {
      throw new Error(`una derivación que agranda el reloj amplifica el permiso: ${String(padre.reloj)} → ${reloj}`);
    }
    if (this.permisos().some((p) => p.id === spec.id)) throw new Error(`ya existe el permiso ${String(spec.id)}`);
    return this.escribir({
      tipo: 'permiso',
      id: spec.id,
      acta: padre.acta,
      actor: spec.actor || padre.actor,
      paso: padre.paso,
      alcance: padre.alcance,
      presupuesto: String(pedido),
      destino: padre.destino,
      reloj,
      pausers: spec.pausers || padre.pausers,
      transferida_de: padre.id,
      en: iso(),
    });
  }

  // --- Los pasos que ocurren dentro de lo otorgado ---

  construir(spec) {
    entradasDeclaradas('construir', spec, 'construccion');
    return this.pasoPermitido({ ...spec, tipo: 'construccion', accion: 'casafirme:construir', paso: 'construccion', conUnidades: true });
  }

  entregar(spec) {
    entradasDeclaradas('entregar', spec, 'entrega');
    return this.pasoPermitido({ ...spec, tipo: 'entrega', accion: 'casafirme:entregar', paso: 'entrega', conUnidades: false });
  }

  // El camino que comparten construcción y entrega: el permiso tiene que existir, tiene que
  // ser de un acta, y el paso tiene que caber en lo que ese permiso autoriza.
  async pasoPermitido(spec) {
    const permiso = this.permisos().find((p) => p.id === spec.permiso);
    if (!permiso) {
      return this.bloqueado(`no hay permiso ${String(spec.permiso)} en el registro: nadie construye ni entrega sin el acta que lo autoriza`, 'vuelve al comité de vivienda: abre una asamblea que lo otorgue');
    }
    if (spec.acta === undefined || spec.acta !== permiso.acta) {
      const cual = spec.acta ? `, no ${String(spec.acta)}` : '';
      return this.bloqueado(`el permiso ${permiso.id} lo autoriza el acta ${permiso.acta}${cual}: nadie construye sin el acta que lo autoriza`, `vuelve al comité de vivienda: el permiso ${permiso.id} pertenece a otra acta`);
    }
    const destino = spec.destino === undefined ? permiso.destino : spec.destino;
    const unidades = spec.conUnidades ? String(entero(spec.unidades)) : '1';
    const base = {
      accion: spec.accion,
      paso: spec.paso,
      clave: spec.clave,
      permiso: permiso.id,
      destino,
      unidades,
      now: spec.now,
      goal: `${permiso.actor} ejecuta ${spec.paso} en ${destino} bajo el permiso ${permiso.id}`,
      agente: permiso.actor,
      salida: `vuelve al comité de vivienda: el permiso ${permiso.id} no alcanza para esto`,
      autoridad: {
        spend: [{ asset: `paso:${spec.paso}`, maxAmount: this.restanteDe(permiso), to: `vivienda:${permiso.destino}`, expiresAt: permiso.reloj }],
        pausers: permiso.pausers,
      },
      requisito: { asset: `paso:${spec.paso}`, amount: unidades, to: `vivienda:${destino}` },
    };
    const chequeo = this.suficiente(base, spec.now);
    if (!chequeo.ok) {
      if (/expired/.test(chequeo.reason)) {
        return this.bloqueado(`el permiso ${permiso.id} venció el ${permiso.reloj} y un permiso que murió con su reloj no revive solo (${chequeo.reason})`, 'vuelve al comité: otorga un permiso nuevo, con otro id');
      }
      return this.bloqueado(this.enriquecer(chequeo.reason, base), base.salida);
    }
    return this.correr({
      ...base,
      cuerpo: () => (spec.tipo === 'entrega'
        ? { tipo: 'entrega', clave: spec.clave, permiso: permiso.id, acta: permiso.acta, actor: permiso.actor, paso: spec.paso, en: iso() }
        : { tipo: 'construccion', clave: spec.clave, permiso: permiso.id, acta: permiso.acta, actor: permiso.actor, paso: spec.paso, unidades, destino, en: iso() }),
      checks: () => {
        const lineas = this.lineas(spec.tipo).filter((l) => l.clave === spec.clave);
        const una = lineas[0];
        return {
          'fuente-autorizada': una !== undefined && una.acta === permiso.acta && una.permiso === permiso.id,
          'trazable-al-origen': una !== undefined && this.permisos().some((p) => p.id === una.permiso && p.acta === una.acta),
          'ejecutado-una-vez': lineas.length === 1,
          'registro-intacto': una !== undefined && huellaDeLinea(una) === una.huella,
        };
      },
    });
  }

  // --- El dinero del donante ---

  registrarDonacion(spec) {
    entradasDeclaradas('registrarDonacion', spec, 'donacion');
    if (!texto(spec.id) || entero(spec.unidades) === null) throw new Error('una donación necesita id y unidades');
    const previa = this.lineas('donacion').find((d) => d.id === spec.id);
    if (previa) return previa;
    // `aportante` puede venir vacío a propósito: una donación sin dueño se puede registrar y
    // después no se puede usar. El rojo 4 vive exactamente ahí.
    return this.escribir({ tipo: 'donacion', id: spec.id, aportante: texto(spec.aportante) ? spec.aportante : null, unidades: String(entero(spec.unidades)), en: iso() });
  }

  async usarDonacion(spec) {
    entradasDeclaradas('usarDonacion', spec, 'uso');
    const donacion = this.lineas('donacion').find((d) => d.id === spec.donacion);
    if (!donacion) {
      return this.bloqueado(`no hay donación ${String(spec.donacion)} en el registro`, 'vuelve al donante: registra la donación con su aportante antes de usarla');
    }
    if (!texto(donacion.aportante)) {
      return this.bloqueado(`la donación ${donacion.id} no tiene aportante: sin él el dinero no se puede seguir hasta la vivienda, y una donación que no se puede seguir no se usa`, 'vuelve al donante: identifica la donación y vuelve a registrarla');
    }
    if (this.actas().filter((a) => a.otorgada).length === 0) {
      return this.bloqueado('no hay ninguna asamblea que haya otorgado: una donación se usa dentro de una vivienda que el comité autorizó', 'vuelve al comité de vivienda: abre la asamblea primero');
    }
    const previo = this.usos().find((u) => u.clave === spec.clave);
    if (previo) {
      const conRecibo = this.recibos().find((r) => r.clave === spec.clave);
      return { estado: 'repetido', detalle: `el uso ${String(spec.clave)} ya ocurrió: una donación registrada dos veces no queda registrada dos veces`, salida: 'nada que hacer', recibo: conRecibo ? conRecibo.recibo : null };
    }
    const unidades = String(entero(spec.unidades));
    const gastado = this.usos().filter((u) => u.donacion === donacion.id).reduce((s, u) => s + entero(u.unidades), 0n);
    const libre = entero(donacion.unidades) - gastado;
    return this.correr({
      accion: 'casafirme:uso',
      paso: 'uso',
      clave: spec.clave,
      goal: `${donacion.aportante} aporta ${unidades} unidades a ${String(spec.concepto)}`,
      agente: donacion.aportante,
      salida: 'vuelve al donante: la donación no alcanza para este uso',
      autoridad: { spend: [{ asset: `donacion:${donacion.id}`, maxAmount: String(libre < 0n ? 0n : libre), to: 'paso:uso' }], pausers: ['comite-1', donacion.aportante] },
      requisito: { asset: `donacion:${donacion.id}`, amount: unidades, to: 'paso:uso' },
      verificador: spec.verificador,
      cuerpo: () => ({
        tipo: 'uso',
        clave: spec.clave,
        donacion: donacion.id,
        aportante: donacion.aportante,
        concepto: String(spec.concepto),
        unidades,
        destinos: [...new Set(this.permisos().map((p) => p.destino))],
        en: iso(),
      }),
      checks: () => {
        const usos = this.usos().filter((u) => u.clave === spec.clave);
        const una = usos[0];
        const fuente = una ? this.lineas('donacion').find((d) => d.id === una.donacion) : null;
        return {
          'fuente-autorizada': this.actas().filter((a) => a.otorgada).length > 0,
          'trazable-al-origen': Boolean(fuente) && texto(fuente.aportante) && una.aportante === fuente.aportante,
          'ejecutado-una-vez': usos.length === 1,
          'registro-intacto': una !== undefined && huellaDeLinea(una) === una.huella,
        };
      },
    });
  }

  // --- Lecturas ---

  postulaciones() { return this.lineas('postulacion'); }
  actas() { return this.lineas('acta'); }
  permisos() {
    const porId = new Map();
    for (const p of this.lineas('permiso')) porId.set(p.id, p);
    return [...porId.values()];
  }
  permiso(id) { return this.permisos().find((p) => p.id === id) || null; }
  construcciones() { return this.lineas('construccion'); }
  entregas() { return this.lineas('entrega'); }
  usos() { return this.lineas('uso'); }
  donaciones() { return this.lineas('donacion'); }
  recibos() { return this.lineas('recibo'); }

  gastadoDe(permisoId) {
    return this.construcciones().filter((c) => c.permiso === permisoId).reduce((s, c) => s + entero(c.unidades), 0n)
      + this.entregas().filter((e) => e.permiso === permisoId).reduce((s) => s + 1n, 0n);
  }

  // El recibo de un paso es el de la ocurrencia que **sucedió**, no el del primer intento.
  // Un acta que se abrió dos veces —una sin quorum y otra con— deja dos recibos con la
  // misma clave, y el recorrido del donante tiene que llevar el segundo: llevar el primero
  // haría que un paso exitoso pareciera bloqueado.
  reciboDe(clave) {
    const conClave = this.recibos().filter((r) => r.clave === clave);
    const exitosos = conClave.filter((r) => r.recibo && r.recibo.status === 'verified');
    const elegido = (exitosos.length > 0 ? exitosos : conClave).pop();
    return elegido ? elegido.recibo : null;
  }

  // El recorrido del donante: de la postulación al uso, con el recibo de cada paso y sin
  // nombrar a la familia en ningún punto.
  recorrerDinero(aportante) {
    const donaciones = this.donaciones().filter((d) => d.aportante === aportante);
    if (donaciones.length === 0) {
      return { aportante, pasos: [], recibos: [], motivo: `no hay ninguna donación de ${String(aportante)} en el registro` };
    }
    const uso = this.usos().find((u) => donaciones.some((d) => d.id === u.donacion));
    const construccion = this.construcciones()[0];
    const acta = this.actas().find((a) => a.otorgada);
    const postulacion = this.postulaciones()[0];
    const brutos = [
      postulacion ? { paso: 'postulacion', clave: postulacion.clave, quien: 'la familia del catastro' } : null,
      acta ? { paso: 'acta', clave: acta.id, quien: 'comite-1' } : null,
      construccion ? { paso: 'construccion', clave: construccion.clave, quien: construccion.actor } : null,
      uso ? { paso: 'uso', clave: uso.clave, quien: uso.aportante } : null,
    ].filter(Boolean);
    const pasos = brutos.map((p) => ({ ...p, recibo: this.reciboDe(p.clave) }));
    return {
      aportante,
      pasos,
      recibos: pasos.map((p) => p.recibo).filter(Boolean),
      unidades: donaciones.reduce((s, d) => s + entero(d.unidades), 0n).toString(),
      recurso: {
        verificable_sin_casa_firme: 'los recibos: una tercera parte los verifica con receipt.js y repone el recorrido con continuity.js, sin Casa Firme y sin este archivo',
        el_donante_no_ve: 'el alias de la familia no aparece en el recorrido, y el recorrido no necesita verlo',
      },
    };
  }

  // Reponer el recorrido desde los recibos solos: el plan es el del acuerdo, no el informe
  // de Casa Firme. Es la prueba de que el recorrido no depende de que el ejecutor lo cuente
  // bien. Un paso con recibo verificado que no está en el plan devuelve `vuelve a la
  // persona`: eso no es un defecto del recorrido, es la regla.
  reponerDesdeRecibos(recibos, plan = PASOS_DEL_ACUERDO) {
    // El núcleo lee el campo `action` del plan aprobado; el plan de Casa Firme lo llama
    // `accion` porque en español «acción» y «action» son dos palabras. La traducción va
    // acá y en ningún otro lado.
    const aprobado = plan.map((p) => ({ action: p.accion, paso: p.paso }));
    const salida = resumeFromReceipts(recibos, { approved: aprobado, workingMode: 'ordenado' });
    const hechos = [];
    for (const paso of plan) {
      if (recibos.some((r) => r && r.action === paso.accion && r.status === 'verified' && verifyReceipt(r).ok)) {
        hechos.push(paso.paso);
      }
    }
    return {
      completitud: salida.nextAction === null && salida.needsPerson !== true ? 'completo' : (salida.needsPerson ? 'vuelve a la persona' : 'incompleto'),
      completado: hechos,
      siguiente: salida.nextAction ? salida.nextAction.paso : null,
      necesita_persona: salida.needsPerson === true,
      descartados: salida.discarded,
      motivo: salida.reason,
    };
  }

  // --- Verificación ---

  // El verificador por defecto recalcula desde el registro. El que le pase el ejecutor
  // puede mentir, y la auditoría de abajo lo delata.
  verificadorDe(verificador) {
    if (verificador && typeof verificador.verificar === 'function') return (evidencia) => verificador.verificar(evidencia);
    if (typeof verificador === 'function') return verificador;
    return null;
  }

  // La tercera parte. No cree a quien ejecutó: relee el registro, recalcula y compara con lo
  // que el recibo dice que cubrió.
  auditar(recibo) {
    const sello = verifyReceipt(recibo);
    if (!sello.ok) return { ok: false, motivo: `el recibo no verifica: ${sello.reason}` };
    const clave = recibo && recibo.evidence && recibo.evidence.operationId;
    const produccion = this.leer().filter((l) => ['postulacion', 'acta', 'construccion', 'entrega', 'uso'].includes(l.tipo) && (l.clave === clave || l.id === clave));
    if (produccion.length === 0) return { ok: false, motivo: `el recibo dice que hubo un paso y el registro no lo tiene: ${String(clave)}` };
    if (produccion.length > 1) return { ok: false, motivo: `el paso ${String(clave)} aparece ${produccion.length} veces en el registro` };
    if (huellaDeLinea(produccion[0]) !== produccion[0].huella) {
      return { ok: false, motivo: 'el paso fue editado después de escrito: su huella ya no calza' };
    }
    const cubiertos = (recibo.coverage || []).filter((c) => COMPROBACIONES.includes(c));
    const faltan = COMPROBACIONES.filter((c) => !cubiertos.includes(c));
    if (faltan.length > 0) {
      return { ok: false, motivo: `el verificador creyó al ejecutor: no recomputó ${faltan.join(', ')} desde el registro, y una verificación independiente no puede dar por bueno lo que no midió`, checks: cubiertos };
    }
    const cadena = this.auditarCadena();
    if (!cadena.ok) return { ok: false, motivo: `el paso verifica y la cadena del registro no: ${cadena.hallazgos[0].motivo}`, checks: cubiertos };
    return { ok: true, motivo: 'el registro, el permiso y el recibo dicen lo mismo', checks: cubiertos };
  }

  // Lo que se puede comprobar sobre lo escrito. La tercera —la cadena— es la que hace que
  // el registro sea un registro y no una transcripción.
  auditarCadena({ ademas = [] } = {}) {
    const hallazgos = [];
    const lineas = [...this.leer(), ...ademas];
    let anterior = null;
    for (const [indice, linea] of lineas.entries()) {
      const { huella, ...cuerpo } = linea;
      const permitidos = ESQUEMA[linea.tipo];
      const donde = linea.clave || linea.id || null;
      if (!permitidos) {
        hallazgos.push({ tipo: linea.tipo, clave: donde, campo: null, motivo: `línea ${indice + 1}: no hay esquema declarado para el tipo «${String(linea.tipo)}»` });
      } else {
        for (const clave of Object.keys(cuerpo)) {
          if (CAMPOS_DE_FAMILIA.includes(clave)) {
            hallazgos.push({ tipo: linea.tipo, clave: donde, campo: clave, motivo: `línea ${indice + 1}: el campo «${clave}» es dato de familia y no está en el esquema de «${String(linea.tipo)}»` });
          } else if (clave !== 'anterior' && !permitidos.includes(clave)) {
            hallazgos.push({ tipo: linea.tipo, clave: donde, campo: clave, motivo: `línea ${indice + 1}: el campo «${clave}» no está declarado en el esquema de «${String(linea.tipo)}»` });
          }
        }
      }
      if (cuerpo.anterior !== anterior) {
        hallazgos.push({ tipo: linea.tipo, clave: donde, campo: 'anterior', motivo: `línea ${indice + 1}: la línea no encadena con la anterior: la cadena del registro está rota` });
      }
      if (huellaDe(cuerpo) !== huella) {
        hallazgos.push({ tipo: linea.tipo, clave: donde, campo: 'huella', motivo: `línea ${indice + 1}: la huella no calza con el contenido: la cadena del registro se rompió en esta línea` });
      }
      anterior = huella;
    }
    return { ok: hallazgos.length === 0, hallazgos, lineas: lineas.length };
  }

  // Lo que se publicaría. No es una cadena: es un archivo local, y no sale. Y no es todo el
  // registro: las operaciones internas no se publican, así que lo que sale es una
  // proyección, y la proyección es lo que hay que poder leer sin dato de nadie.
  publicarCadena() {
    return {
      red: 'ninguna: este payload no fue a ninguna parte y no hay hash que buscar en un explorador',
      lineas: this.leer().filter((l) => l.tipo !== 'operacion'),
      visibilidad: {
        dato_de_familia: 'ninguno',
        por_que: 'El esquema de cada línea no declara ningún campo de identidad, y por lo tanto no hay campo declarado para escribirlo. Lo que se publica del catastro es un alias derivado con sal, no la persona.',
        anclaje: 'pendiente: sin blockchain, sin hash y sin explorador',
      },
    };
  }

  // --- La maquinaria que el núcleo ejecuta ---

  bloqueado(motivo, salida) {
    return { estado: 'bloqueado', detalle: motivo, salida, recibo: null, firmasContadas: 0, firmasDescartadas: [] };
  }

  async correr(spec) {
    const op = createOperation({
      goal: spec.goal,
      action: spec.accion,
      agent: spec.agente,
      exit: spec.salida,
      authority: spec.autoridad,
    });

    const self = this;
    const cap = {
      id: spec.accion,
      required: () => ({ spend: spec.requisito.multiple ? spec.requisito.multiple : [spec.requisito] }),
      perform: async () => {
        const linea = self.escribir(spec.cuerpo());
        if (spec.trasEfecto) spec.trasEfecto(linea);
        return { ok: true, evidence: { operationId: spec.clave, type: spec.paso, code: linea.huella, status: 'escrito' } };
      },
    };
    const ajeno = this.verificadorDe(spec.verificador);
    const io = {
      verify: async (evidencia) => (ajeno ? ajeno(evidencia) : { verified: Object.values(spec.checks()).every((v) => v === true), checks: spec.checks(), reason: 'recomputado desde el registro' }),
      ask: async () => ({ approvals: (spec.firmaGate || []).map((f) => ({ by: f })) }),
      // El reloj que el núcleo usa para decidir es el mismo que el proyecto ya usó para
      // evaluar el permiso, y no el reloj de la máquina. Sin esto la puerta de arriba y la
      // de abajo marcaban distinta hora: la primera decía «alcanza» y la segunda «venció»,
      // y cuál de las dos se cumplía dependía del día en que se corriera la suite. El
      // contrato del núcleo es síncrono a propósito —un reloj asíncrono no puede autorizar
      // un efecto—, así que esto devuelve una hora ISO leída de una vez.
      now: () => iso(spec.now),
    };
    const resultado = await runOperation(op, cap, io);
    const recibo = resultado.receipt;
    if (recibo) this.escribir({ tipo: 'recibo', clave: String(spec.clave), paso: spec.paso, recibo, en: iso() });
    this.escribir({ tipo: 'operacion', id: op.id, accion: spec.accion, estado: resultado.status, operacion: op, en: iso() });
    const extra = spec.extra || {};
    return { ...this.traducir(resultado, op), recibo, firmasContadas: extra.firmasContadas || 0, firmasDescartadas: extra.firmasDescartadas || [] };
  }

  traducir(resultado, op) {
    if (resultado.status === STATES.SUCCEEDED) {
      return { estado: 'verificado', detalle: 'ocurrió dentro de lo otorgado y el verificador lo recomputó desde el registro', salida: null };
    }
    if (resultado.status === STATES.PAUSED) return { estado: 'pausado', detalle: 'pausado por quien tiene el permiso para pausarlo', salida: 'reanuda o cancela' };
    const recibo = resultado.receipt;
    return {
      estado: resultado.status === STATES.NEEDS_DECISION ? 'necesita_decision' : 'bloqueado',
      detalle: (recibo && (recibo.detail || recibo.reason)) || 'no se pudo abrir',
      salida: (op && op.exit) || (recibo && recibo.exit) || 'vuelve a quien otorga',
    };
  }
}

module.exports = { CasaFirme, CAMPOS_DE_FAMILIA, ESQUEMA, COMPROBACIONES, PASOS_DEL_ACUERDO, PASOS_CON_ENTREGA };
