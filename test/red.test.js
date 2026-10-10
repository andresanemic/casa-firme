'use strict';

// RED de Casa Firme. Escrito ANTES del código, el 2026-09-29.
//
// Los siete rojos que nombra la consigna del proyecto 3 de los diez, más el caso de
// control —una postulación que DEBE poder aprobarse, porque una puerta que solo sabe
// decir «no» no es una puerta— y las pruebas que el propio proyecto necesita para no
// prometer lo que no demuestra.
//
//   1. acta de asamblea sin quorum
//   2. un miembro del comité autoriza más allá de lo que la asamblea otorgó
//   3. un padre o madre de familia intenta firmar en lugar de la asamblea
//   4. donación cuyo uso no puede rastrearse hasta su aportante
//   5. doble registro de la misma donación (idempotente)
//   6. construcción registrada sin el acta que la autoriza
//   7. CONTROL: una postulación que debe poder aprobarse
//
// Abajo, las que no vinieron en la consigna y el proyecto necesita igual: la prueba de
// conocimiento cero se declara simulada, el dato de una familia no se puede escribir ni
// publicar, la cadena del registro detecta una reescritura, el recorrido del donante se
// puede reponer desde los recibos solos, y ninguna línea de la salida nombra a TECHO ni a
// ninguna organización real.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { CasaFirme, CAMPOS_DE_FAMILIA } = require('../src/casafirme.js');
const { verifyReceipt } = require('../src/kernel-instalado.js');
const T0 = '2026-09-29T12:00:00.000Z';
const T1 = '2026-09-29T18:00:00.000Z';
const T2 = '2026-12-01T12:00:00.000Z';

const COMITE = ['miembro-a', 'miembro-b', 'miembro-c'];
const QUORUM = 2;

// El permisos que la asamblea otorga a los tres cuerpos. Cada uno con sus cuatro cosas:
// alcance (qué paso), presupuesto (cuánto), destino (dónde) y reloj (hasta cuándo).
const PERMISOS = [
  { id: 'permiso-voluntarios', actor: 'voluntario-1', paso: 'construccion', alcance: 'montar la vivienda', presupuesto: '4', destino: 'vivienda-1', reloj: T2 },
  { id: 'permiso-fundacion', actor: 'fundacion-1', paso: 'construccion', alcance: 'aportar material', presupuesto: '2', destino: 'vivienda-1', reloj: T2 },
  { id: 'permiso-municipio', actor: 'municipio-1', paso: 'entrega', alcance: 'recibir la vivienda', presupuesto: '1', destino: 'vivienda-1', reloj: T2 },
];

function temporal() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'casafirme-'));
}

// Una casa con el catastro, la familia postulada y la asamblea réunir. Lo que falta para
// tener permiso es lo que cada prueba va a mover.
function casa(dir = temporal()) {
  const c = new CasaFirme({ dir });
  c.registrarCatastro({ id: 'catastro-minvu-2024-06', vigente: 'junio de 2024', ejemplo: true });
  for (const [id, rol] of [
    ['comite-1', 'comité de vivienda'],
    ['miembro-a', 'miembro del comité'],
    ['miembro-b', 'miembro del comité'],
    ['miembro-c', 'miembro del comité'],
    ['voluntario-1', 'voluntario'],
    ['fundacion-1', 'fundación'],
    ['municipio-1', 'municipio'],
    ['donante-1', 'donante'],
  ]) c.registrarActor({ id, rol });
  return c;
}

async function conPostulacion(c) {
  const prueba = c.probarCatastro({ huellaCatastro: 'cat-minvu-2024-06-fam-0001' });
  await c.postular({ alias: prueba.alias, huellaCatastro: 'cat-minvu-2024-06-fam-0001', clave: 'sol-1' });
  return prueba;
}

function abrirActaBuena(c, firmas = COMITE.slice(0, QUORUM)) {
  return c.abrirActa({
    id: 'acta-1',
    quórumRequerido: QUORUM,
    firmantesPermitidos: COMITE,
    firmas,
    permisos: PERMISOS,
    pausers: ['comite-1', 'donante-1'],
    fecha: T0,
  });
}

// ---------------------------------------------------------------------------------------
// Los siete rojos de la consigna
// ---------------------------------------------------------------------------------------

test('ROJO 1 — un acta sin quorum no otorga: la postulación no avanza', async () => {
  const c = casa();
  await conPostulacion(c);
  const acta = await abrirActaBuena(c, ['miembro-a']); // 1 de 3, quorum 2
  assert.equal(acta.estado, 'necesita_decision');
  assert.match(acta.detalle, /missing 1 approval/);
  assert.equal(acta.recibo.status, 'needs_human_decision');
  assert.equal(c.permisos().length, 0, 'sin quorum no hay ni un permiso en el registro');
  assert.match(acta.salida, /asamblea|comité/i);
});

test('ROJO 2 — un miembro no puede autorizar más allá de lo que la asamblea otorgó', async () => {
  const c = casa();
  await conPostulacion(c);
  const acta = await abrirActaBuena(c);
  assert.equal(acta.estado, 'verificado');
  // El comité se lleva un permiso más grande del que está en el acta.
  assert.throws(
    () => c.delegar({
      id: 'permiso-voluntario-2',
      hereda: 'permiso-voluntarios',
      actor: 'voluntario-1',
      presupuesto: '9',
      delegado_por: 'miembro-a',
    }),
    (err) => {
      assert.match(err.message, /amplifica|no cabe/i);
      return true;
    },
  );
  // Y en el paso: pedir 9 unidades cuando el acta otorgó 4 tampoco entra.
  const mucho = await c.construir({ permiso: 'permiso-voluntarios', unidades: '9', clave: 'ob-1', acta: 'acta-1', now: T1 });
  assert.equal(mucho.estado, 'bloqueado');
  assert.match(mucho.detalle, /consume 9 against grant max 4/);
  assert.equal(c.construcciones().length, 0, 'nada se construyó con el permiso ampliado');
});

test('ROJO 3 — la familia puede firmar, pero su firma no es la de la asamblea', async () => {
  const c = casa();
  const prueba = await conPostulacion(c);
  // El padre y la madre, con la familia como única firma. Firman, y no cuenta.
  const acta = await c.abrirActa({
    id: 'acta-1',
    quórumRequerido: QUORUM,
    firmantesPermitidos: COMITE,
    firmas: [prueba.alias, `${prueba.alias}-2`],
    permisos: PERMISOS,
    pausers: ['comite-1', 'donante-1'],
    fecha: T0,
  });
  assert.equal(acta.estado, 'necesita_decision');
  assert.equal(acta.firmasContadas, 0);
  assert.equal(acta.firmasDescartadas.length, 2);
  assert.match(acta.firmasDescartadas[0].motivo, /no es firmante de esta asamblea/);
  assert.match(acta.detalle, /missing 2 approvals/);
  assert.equal(c.permisos().length, 0);
});

test('ROJO 4 — una donación sin aportante no se puede usar: el dinero no llega a ninguna parte', async () => {
  const c = casa();
  await conPostulacion(c);
  await abrirActaBuena(c);
  c.registrarDonacion({ id: 'dona-1', aportante: 'donante-1', unidades: '10', clave: 'dona-1' });
  c.registrarDonacion({ id: 'dona-2', aportante: null, unidades: '4', clave: 'dona-2' });
  const sinDueño = await c.usarDonacion({ donacion: 'dona-2', concepto: 'material', unidades: '4', clave: 'uso-1' });
  assert.equal(sinDueño.estado, 'bloqueado');
  assert.match(sinDueño.detalle, /aportante/);
  assert.match(sinDueño.salida, /donante/);
  const conDueño = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material', unidades: '3', clave: 'uso-2', now: T1 });
  assert.equal(conDueño.estado, 'verificado');
});

test('ROJO 5 — registrar dos veces la misma donación no la duplica: devuelve el mismo recibo', async () => {
  const c = casa();
  await conPostulacion(c);
  await abrirActaBuena(c);
  c.registrarDonacion({ id: 'dona-1', aportante: 'donante-1', unidades: '10', clave: 'dona-1' });
  const uno = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material', unidades: '2', clave: 'uso-1' });
  const dos = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material', unidades: '2', clave: 'uso-1' });
  assert.equal(uno.estado, 'verificado');
  assert.equal(dos.estado, 'repetido');
  assert.equal(dos.recibo.digest, uno.recibo.digest);
  assert.equal(c.usos().length, 1, 'el registro tiene un uso, no dos');
  // Y con la misma clave pero otras unidades tampoco: la clave manda, no el contenido.
  const tres = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material', unidades: '5', clave: 'uso-1' });
  assert.equal(tres.estado, 'repetido');
  assert.equal(c.usos().length, 1);
});

test('ROJO 6 — nadie construye sin el acta que lo autoriza', async () => {
  const c = casa();
  await conPostulacion(c);
  const sinActa = await c.construir({ permiso: 'permiso-voluntarios', unidades: '2', clave: 'ob-1' });
  assert.equal(sinActa.estado, 'bloqueado');
  assert.match(sinActa.detalle, /acta/i);
  assert.equal(c.construcciones().length, 0);
  // Y con un acta que no es la del permiso, tampoco: el permiso tiene que existir y tener
  // que ser de un acta.
  await abrirActaBuena(c);
  const conPermisoAjeno = await c.construir({
    permiso: 'permiso-voluntarios', unidades: '2', clave: 'ob-2', acta: 'acta-que-no-existe',
  });
  assert.equal(conPermisoAjeno.estado, 'bloqueado');
  assert.match(conPermisoAjeno.detalle, /acta-que-no-existe|no autoriza este permiso/);
  // Y un permiso que nadie otorgó tampoco, aunque el acta exista.
  const sinPermiso = await c.construir({ permiso: 'permiso-que-no-existe', unidades: '1', clave: 'ob-3', acta: 'acta-1' });
  assert.equal(sinPermiso.estado, 'bloqueado');
  assert.match(sinPermiso.detalle, /nadie construye ni entrega sin el acta que lo autoriza/);
  assert.equal(c.construcciones().length, 0);
});

test('CONTROL — una postulación que DEBE poder aprobarse se aprueba', async () => {
  const c = casa();
  const prueba = c.probarCatastro({ huellaCatastro: 'cat-minvu-2024-06-fam-0001' });
  assert.equal(prueba.simulado, true, 'la prueba de conocimiento cero se declara simulada');
  assert.match(prueba.declara, /simulad/i);
  assert.equal(prueba.alias, c.probarCatastro({ huellaCatastro: 'cat-minvu-2024-06-fam-0001' }).alias, 'el alias es estable para la misma huella');
  assert.notEqual(prueba.alias, c.probarCatastro({ huellaCatastro: 'cat-minvu-2024-06-fam-0002' }).alias, 'y distinto para otra huella');

  const postulacion = await c.postular({ alias: prueba.alias, huellaCatastro: 'cat-minvu-2024-06-fam-0001', clave: 'sol-1' });
  assert.equal(postulacion.estado, 'verificado');
  assert.equal(postulacion.recibo.status, 'verified');
  assert.match(postulacion.recibo.coverage.join(','), /fuente-autorizada/);
  assert.deepEqual(postulacion.recibo.notCovered.filter((n) => n !== 'external anchor'), [], 'una postulacion verificada no deja nada sin cubrir salvo el anclaje');
  assert.equal(verifyReceipt(postulacion.recibo).ok, true);

  const acta = await abrirActaBuena(c);
  assert.equal(acta.estado, 'verificado', 'con quorum el acta otorga');
  assert.equal(c.permisos().length, PERMISOS.length);
  assert.deepEqual(acta.firmasDescartadas, []);

  c.registrarDonacion({ id: 'dona-1', aportante: 'donante-1', unidades: '10', clave: 'dona-1' });
  const obra = await c.construir({ permiso: 'permiso-voluntarios', unidades: '3', clave: 'ob-1', acta: 'acta-1', now: T1 });
  assert.equal(obra.estado, 'verificado');
  const uso = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material de la vivienda', unidades: '3', clave: 'uso-1', now: T1 });
  assert.equal(uso.estado, 'verificado');
  const entrega = await c.entregar({ permiso: 'permiso-municipio', clave: 'ent-1', acta: 'acta-1', now: T1 });
  assert.equal(entrega.estado, 'verificado');
});

// ---------------------------------------------------------------------------------------
// Lo que el proyecto necesita para no prometer lo que no demuestra
// ---------------------------------------------------------------------------------------

test('el presupuesto del permiso se gasta y se acumula entre usos', async () => {
  const c = casa();
  await conPostulacion(c);
  await abrirActaBuena(c);
  const uno = await c.construir({ permiso: 'permiso-voluntarios', unidades: '3', clave: 'ob-1', acta: 'acta-1', now: T1 });
  assert.equal(uno.estado, 'verificado');
  const mucho = await c.construir({ permiso: 'permiso-voluntarios', unidades: '2', clave: 'ob-2', acta: 'acta-1', now: T1 });
  assert.equal(mucho.estado, 'bloqueado', 'el permiso era de 4 y ya gastó 3');
  assert.match(mucho.detalle, /consume 2 against grant max 1/);
  // La fundación tiene su propio permiso, con su propio presupuesto: no es el del otro.
  const deOtro = await c.construir({ permiso: 'permiso-fundacion', unidades: '2', clave: 'ob-3', acta: 'acta-1', now: T1 });
  assert.equal(deOtro.estado, 'verificado');
});

test('pasada la fecha del reloj, el permiso no revive solo', async () => {
  const c = casa();
  await conPostulacion(c);
  await abrirActaBuena(c);
  const vencido = await c.construir({ permiso: 'permiso-voluntarios', unidades: '1', clave: 'ob-1', acta: 'acta-1', now: T2 });
  assert.equal(vencido.estado, 'bloqueado');
  assert.match(vencido.detalle, /2026-12-01/);
});

test('un permiso no viaja a otra vivienda', async () => {
  const c = casa();
  await conPostulacion(c);
  await c.abrirActa({
    id: 'acta-1', quórumRequerido: QUORUM, firmantesPermitidos: COMITE, firmas: COMITE.slice(0, QUORUM),
    permisos: PERMISOS, pausers: ['comite-1'], fecha: T0,
  });
  const otra = await c.construir({ permiso: 'permiso-voluntarios', unidades: '1', clave: 'ob-1', acta: 'acta-1', destino: 'vivienda-2', now: T1 });
  assert.equal(otra.estado, 'bloqueado');
  assert.match(otra.detalle, /vivienda-1/);
  assert.match(otra.detalle, /vivienda-2/);
});

test('el dato de una familia no se puede escribir: el esquema lo rechaza', () => {
  const c = casa();
  const prueba = c.probarCatastro({ huellaCatastro: 'cat-minvu-2024-06-fam-0001' });
  for (const campo of CAMPOS_DE_FAMILIA) {
    assert.throws(
      () => c.postular({ alias: prueba.alias, huellaCatastro: 'x', clave: 'sol-1', [campo]: 'valor' }),
      (err) => { assert.match(err.message, /fuera del esquema|campo no declarado/i); return true; },
      `el campo «${campo}» debería estar fuera del esquema`,
    );
  }
  assert.equal(c.postulaciones().length, 0);
});

test('la auditoría de la cadena no encuentra dato de familia, y se demuestra que no está vacía', async () => {
  const c = casa();
  await conPostulacion(c);
  const limpio = c.auditarCadena();
  assert.equal(limpio.ok, true, JSON.stringify(limpio.hallazgos));
  // Falsación: la misma auditoría, con una línea fabricada a mano que sí trae un nombre.
  // Si pasara, la auditoría de arriba no estaría comprobando nada.
  const sucia = c.auditarCadena({ ademas: [{ tipo: 'postulacion', clave: 'sol-x', alias: 'fam-abc', nombre: 'Nombre Real Apellido', rut: '12345678-9' }] });
  assert.equal(sucia.ok, false);
  assert.ok(sucia.hallazgos.some((h) => /nombre/.test(h.campo)), 'tiene que nombrar el campo que encontró');
  assert.ok(sucia.hallazgos.some((h) => /rut/.test(h.campo)), 'y el segundo, no solo el primero');
});

test('lo que se publicaría no trae dato de familia, y la pantalla lo dice', async () => {
  const c = casa();
  const prueba = await conPostulacion(c);
  const publicado = c.publicarCadena();
  const crudo = JSON.stringify(publicado);
  assert.ok(!/nombre|rut|domicilio|telefono|fecha_nacimiento/i.test(crudo), 'el payload publicado no puede traer esos campos');
  assert.ok(crudo.includes(prueba.alias), 'pero sí el alias: es lo que se puede publicar');
  assert.equal(publicado.visibilidad.dato_de_familia, 'ninguno');
  assert.match(publicado.visibilidad.por_que, /no hay campo declarado para escribirlo/i);
});

test('reescribir una línea vieja rompe la cadena y la auditoría lo ve', async () => {
  const dir = temporal();
  const c = casa(dir);
  await conPostulacion(c);
  await abrirActaBuena(c);
  assert.equal(c.auditarCadena().ok, true);
  // Alguien edita el registro a mano, como se puede hacer: es un archivo.
  const ruta = path.join(dir, 'registro.jsonl');
  const crudo = fs.readFileSync(ruta, 'utf8').split('\n').filter((x) => x.trim());
  crudo[0] = crudo[0].replace('catastro-minvu-2024-06', 'catastro-falso');
  fs.writeFileSync(ruta, `${crudo.join('\n')}\n`, 'utf8');
  const despues = new CasaFirme({ dir }).auditarCadena();
  assert.equal(despues.ok, false);
  assert.ok(despues.hallazgos.some((h) => /cadena/i.test(h.motivo)), 'tiene que decir que la cadena no calza');
});

test('el recibo va sellado y uno editado a mano no verifica', async () => {
  const c = casa();
  const postulacion = await c.postular({ alias: 'fam-x', huellaCatastro: 'cat-minvu-2024-06-fam-0001', clave: 'sol-1' });
  assert.equal(verifyReceipt(postulacion.recibo).ok, true);
  assert.equal(verifyReceipt({ ...postulacion.recibo, detail: 'todo bien' }).ok, false);
  assert.equal(postulacion.recibo.anchor.status, 'pending', 'no hay red: el anclaje queda pendiente y no se finge');
});

test('un verificador que solo cree al ejecutor no puede producir un verde en la auditoría', async () => {
  const c = casa();
  await conPostulacion(c);
  await abrirActaBuena(c);
  c.registrarDonacion({ id: 'dona-1', aportante: 'donante-1', unidades: '10', clave: 'dona-1' });
  const creyente = { id: 'verificador-creyente', verificar: async () => ({ verified: true, checks: { me_lo_creo: true }, reason: 'me lo creo' }) };
  const uso = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material', unidades: '1', clave: 'uso-1', verificador: creyente, now: T1 });
  assert.equal(uso.estado, 'verificado', 'el núcleo acepta lo que le digan');
  const auditoria = c.auditar(uso.recibo);
  assert.equal(auditoria.ok, false);
  assert.match(auditoria.motivo, /creyó al ejecutor/);
  const buena = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material', unidades: '1', clave: 'uso-2', now: T1 });
  assert.equal(c.auditar(buena.recibo).ok, true);
});

test('el donante recorre su dinero desde la postulación hasta el uso, sin intermediarios', async () => {
  const c = casa();
  await conPostulacion(c);
  await abrirActaBuena(c);
  c.registrarDonacion({ id: 'dona-1', aportante: 'donante-1', unidades: '10', clave: 'dona-1' });
  await c.construir({ permiso: 'permiso-voluntarios', unidades: '3', clave: 'ob-1', acta: 'acta-1', now: T1 });
  await c.usarDonacion({ donacion: 'dona-1', concepto: 'material de la vivienda', unidades: '3', clave: 'uso-1', now: T1 });

  const dinero = c.recorrerDinero('donante-1');
  assert.equal(dinero.aportante, 'donante-1');
  const pasos = dinero.pasos.map((p) => p.paso);
  assert.deepEqual(pasos, ['postulacion', 'acta', 'construccion', 'uso'], 'el recorrido va en orden y no se salta nada');
  for (const p of dinero.pasos) assert.equal(verifyReceipt(p.recibo).ok, true, `el recibo de ${p.paso} no verifica`);
  assert.ok(!/nombre|rut/.test(JSON.stringify(dinero)), 'el recorrido del donante no nombra a la familia');
  assert.match(dinero.recurso.verificable_sin_casa_firme, /recibos/i);

  // Y una tercera parte repone el recorrido con los recibos solos, sin Casa Firme.
  const repuesto = c.reponerDesdeRecibos(dinero.recibos);
  // 0.1.5: con solo los recibos, el núcleo ya no da por terminado un paso que dice 'verified' sin prueba
  // de que el efecto ocurrió (continuity.js pide verifyLocal o ancla verificada). Reponer desde recibos
  // vuelve a la persona: es el resultado honesto.
  assert.equal(repuesto.necesita_persona, true);
  assert.equal(repuesto.completitud, 'vuelve a la persona');
  assert.equal(repuesto.descartados, 0);
});

test('nada del recorrido nombra a una organización real', async () => {
  const c = casa();
  await conPostulacion(c);
  await abrirActaBuena(c);
  const crudo = JSON.stringify(c.leer());
  assert.ok(!/TECHO|Un Techo/i.test(crudo), 'el registro no nombra ni una vez a TECHO');
  const { main } = require('../src/recorrido.js');
  const dir = temporal();
  const salida = await main(dir, { escribe: false });
  assert.ok(!/TECHO|Un Techo|Laboratorio Blockchain/i.test(salida), 'la salida del recorrido tampoco');
  assert.ok(/NO demuestra|no demuestra/i.test(salida), 'y termina diciendo lo que no demuestra');
  assert.ok(/simulad/i.test(salida), 'y que la prueba de conocimiento cero es simulada');
});

test('el recorrido completo corre de punta a punta y su registro se puede leer sin Casa Firme', async () => {
  const dir = temporal();
  const { main } = require('../src/recorrido.js');
  const salida = await main(dir, { escribe: false });
  assert.ok(salida.length > 0);
  const crudo = fs.readFileSync(path.join(dir, 'registro.jsonl'), 'utf8').trim().split('\n').map((x) => JSON.parse(x));
  const tipos = new Set(crudo.map((x) => x.tipo));
  for (const t of ['catastro', 'actor', 'postulacion', 'acta', 'permiso', 'donacion', 'uso', 'construccion']) {
    assert.ok(tipos.has(t), `falta la línea de tipo ${t} en el registro`);
  }
  for (const linea of crudo) assert.ok(linea.huella, 'toda línea va encadenada');
});

// La vara de «100 % funcional» de la decisión 10 pide un comando y las pruebas a la vista.
// La línea de comandos es parte del entregable, así que tiene su propia prueba: que el
// comando de auditoría devuelva 0 sobre un registro íntegro y 1 sobre uno roto, y que
// `dinero <donante> <dir>` no abra por error un registro con el nombre del donante.
test('la línea de comandos hace lo que dice y devuelve el código que corresponde', async () => {
  const { main: recorrido } = require('../src/recorrido.js');
  const { main: cli } = require('../src/cli.js');
  const dir = temporal();
  await recorrido(dir, { escribe: false });

  const partes = [];
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = (t) => { partes.push(String(t)); return true; };
  try {
    assert.equal(await cli(['auditar', dir]), 0, 'un registro íntegro sale con 0');
    assert.equal(await cli(['dinero', 'donante-1', dir]), 0, 'el recorrido del dinero de donante-1 sale con 0');
    assert.equal(await cli(['dinero', 'donante-que-no-existe', dir]), 1, 'un donante sin dinero sale con 1');
  } finally {
    process.stdout.write = original;
  }
  const salida = partes.join('');
  assert.ok(/cadena íntegra/.test(salida), 'la auditoría dice que la cadena está íntegra');
  assert.ok(/repuesto desde los recibos: vuelve a la persona/.test(salida), '0.1.5: y que el recorrido repuesto solo con recibos vuelve a la persona');
  assert.ok(!/no hay ninguna donación de donante-1/.test(salida), 'y no contesta que el donante no tiene nada cuando sí tiene');

  // Y sobre un registro roto, el comando dice que hay un hallazgo y sale con 1.
  const roto = temporal();
  await recorrido(roto, { escribe: false });
  const ruta = path.join(roto, 'registro.jsonl');
  const lineas = fs.readFileSync(ruta, 'utf8').split('\n').filter((x) => x.trim());
  // Se edita la línea que el recorrido declara por su clave, no una posición a ciega: una
  // línea mal elegida no cambia nada, el registro sigue íntegro y la prueba pasa sin probar.
  // La línea del permiso, no la del acta: el acta menciona el permiso en su lista de
  // otorgados y ahí no hay presupuesto que editar.
  const objetivo = lineas.findIndex((x) => x.startsWith('{"tipo":"permiso"') && x.includes('"permiso-voluntarios"'));
  assert.ok(objetivo >= 0, 'el recorrido tiene que dejar un permiso de voluntarios en el registro');
  const antes = lineas[objetivo];
  lineas[objetivo] = antes.replace('"presupuesto":"4"', '"presupuesto":"400"');
  assert.notEqual(lineas[objetivo], antes, 'la edición tiene que cambiar algo: si no cambia, la prueba pasa sin probar');
  fs.writeFileSync(ruta, `${lineas.join('\n')}\n`, 'utf8');
  process.stdout.write = (t) => { partes.push(String(t)); return true; };
  try {
    assert.equal(await cli(['auditar', roto]), 1, 'un registro roto sale con 1');
  } finally {
    process.stdout.write = original;
  }
});
