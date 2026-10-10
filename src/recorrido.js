'use strict';

// El recorrido de Casa Firme, de punta a punta y a la vista. Cada línea sale de una
// ejecución real contra el registro del proyecto; la única línea que no sale de una
// ejecución es la última, que dice lo que este recorrido NO demuestra.
//
// Familia, comité, fundación, municipio y donante son de EJEMPLO. No hay red, no hay
// cadena, no hay pagos, no hay anclaje, y este proyecto no reclama afiliación con ninguna
// organización real.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { CasaFirme, PASOS_CON_ENTREGA } = require('./casafirme.js');
const { verifyReceipt, CARGADO } = require('./kernel-instalado.js');

const T0 = '2026-09-29T12:00:00.000Z';
const T1 = '2026-09-29T18:00:00.000Z';
const T2 = '2026-12-01T12:00:00.000Z';

const COMITE = ['miembro-a', 'miembro-b', 'miembro-c'];
const QUORUM = 2;

const PERMISOS = [
  { id: 'permiso-voluntarios', actor: 'voluntario-1', paso: 'construccion', alcance: 'montar la vivienda', presupuesto: '4', destino: 'vivienda-1', reloj: T2 },
  { id: 'permiso-fundacion', actor: 'fundacion-1', paso: 'construccion', alcance: 'aportar material', presupuesto: '2', destino: 'vivienda-1', reloj: T2 },
  { id: 'permiso-municipio', actor: 'municipio-1', paso: 'entrega', alcance: 'recibir la vivienda', presupuesto: '1', destino: 'vivienda-1', reloj: T2 },
];

async function main(dir, { escribe = true } = {}) {
  const destino = dir || fs.mkdtempSync(path.join(os.tmpdir(), 'casafirme-recorrido-'));
  const lineas = [];
  const linea = (t = '') => { lineas.push(t); if (escribe) process.stdout.write(`${t}\n`); };
  const titulo = (t) => linea(`\n── ${t}`);

  const c = new CasaFirme({ dir: destino });
  linea(`Casa Firme — recorrido completo. Registro en: ${path.join(destino, 'registro.jsonl')}`);
  linea(`Núcleo de Vespi ${CARGADO.version}, cargado desde la copia instalada en ${CARGADO.tambien}. Se consume, no se modifica.`);
  linea('Todos los actores y todos los datos son de EJEMPLO. Sin red, sin cadena, sin pagos, sin un tercero.');

  titulo('1. El catastro y los que van a estar en la historia');
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
  linea('  catastro-minvu-2024-06, vigente a junio de 2024. ES UN DATO DE EJEMPLO: aquí no hay catastro real detrás.');
  linea('  La familia del catastro NO tiene línea. Tiene un alias y una huella, y nada más.');

  titulo('2. La familia postula');
  const prueba = c.probarCatastro({ huellaCatastro: 'catastro-minvu-2024-06-fam-0001' });
  linea(`  alias: ${prueba.alias}   (derivado con sal de la huella del catastro)`);
  linea(`  prueba de conocimiento cero: SIMULADA — ${prueba.declara}`);
  const postulacion = await c.postular({ alias: prueba.alias, huellaCatastro: 'catastro-minvu-2024-06-fam-0001', clave: 'sol-1' });
  linea(`  estado: ${postulacion.estado} · recibo ${postulacion.recibo.status} · sello ${String(postulacion.recibo.digest).slice(0, 16)}…`);
  linea(`  anclaje: ${postulacion.recibo.anchor.status} en ${postulacion.recibo.anchor.network} — nada llegó a una red; esto NO está verificado afuera`);

  titulo('3. Una asamblea sin quorum: el acta no otorga');
  const sinQuorum = await c.abrirActa({
    id: 'acta-1', quórumRequerido: QUORUM, firmantesPermitidos: COMITE, firmas: ['miembro-a'],
    permisos: PERMISOS, pausers: ['comite-1', 'donante-1'], fecha: T0,
  });
  linea(`  estado: ${sinQuorum.estado} · ${sinQuorum.detalle}`);
  linea(`  salida: ${sinQuorum.salida}`);
  linea(`  permisos en el registro ahora: ${c.permisos().length}. Sin quorum no hay ni uno.`);

  titulo('4. La familia intenta firmar en lugar de la asamblea');
  const conLaFamilia = await c.abrirActa({
    id: 'acta-1', quórumRequerido: QUORUM, firmantesPermitidos: COMITE,
    firmas: [prueba.alias, `${prueba.alias}-2`],
    permisos: PERMISOS, pausers: ['comite-1', 'donante-1'], fecha: T0,
  });
  linea(`  estado: ${conLaFamilia.estado} · firmas que contaron: ${conLaFamilia.firmasContadas} · ${conLaFamilia.detalle}`);
  for (const d of conLaFamilia.firmasDescartadas) linea(`    ${d.quien}: ${d.motivo}`);
  linea(`  salida: ${conLaFamilia.salida}`);

  titulo('5. La asamblea con quorum otorga');
  const acta = await c.abrirActa({
    id: 'acta-1', quórumRequerido: QUORUM, firmantesPermitidos: COMITE, firmas: ['miembro-a', 'miembro-b'],
    permisos: PERMISOS, pausers: ['comite-1', 'donante-1'], fecha: T0,
  });
  linea(`  estado: ${acta.estado} · recibo ${acta.recibo.status} · decidido por: ${String(acta.recibo.decidedBy)}`);
  linea(`  ${acta.recibo.authority.approval} — la puerta contó identidades, no una aprobación sin nombre`);
  for (const p of c.permisos()) linea(`  ${p.id}  ${p.actor}  ${p.paso}  «${p.alcance}»  ${p.presupuesto} unidades  ${p.destino}  hasta ${p.reloj}`);

  titulo('6. Un miembro del comité autoriza más allá de lo otorgado');
  try {
    c.delegar({ id: 'permiso-voluntario-2', hereda: 'permiso-voluntarios', actor: 'voluntario-1', presupuesto: '9', delegado_por: 'miembro-c' });
    linea('  NO DEBERÍA LLEGAR AQUÍ: la derivación amplificada pasó.');
  } catch (err) {
    linea(`  rechazado: ${err.message}`);
  }
  const mucho = await c.construir({ permiso: 'permiso-voluntarios', unidades: '9', clave: 'ob-x', acta: 'acta-1', now: T1 });
  linea(`  y el paso tampoco: ${mucho.estado} — ${mucho.detalle}`);

  titulo('7. Nadie construye sin el acta que lo autoriza');
  const sinActa = await c.construir({ permiso: 'permiso-voluntarios', unidades: '1', clave: 'ob-y' });
  linea(`  estado: ${sinActa.estado} — ${sinActa.detalle}`);
  linea(`  salida: ${sinActa.salida}`);

  titulo('8. La construcción, dentro de lo otorgado');
  const obra = await c.construir({ permiso: 'permiso-voluntarios', unidades: '3', clave: 'ob-1', acta: 'acta-1', now: T1 });
  linea(`  estado: ${obra.estado} · recibo ${obra.recibo.status} · sello ${String(obra.recibo.digest).slice(0, 16)}…`);
  const delMaterial = await c.construir({ permiso: 'permiso-fundacion', unidades: '2', clave: 'ob-2', acta: 'acta-1', now: T1 });
  linea(`  el permiso de la fundación va aparte: ${delMaterial.estado} (2 de 2 unidades propias)`);
  const seAcabo = await c.construir({ permiso: 'permiso-voluntarios', unidades: '2', clave: 'ob-3', acta: 'acta-1', now: T1 });
  linea(`  y el de los voluntarios ya se acabo: ${seAcabo.estado} — ${seAcabo.detalle}`);

  titulo('9. Pasó la fecha del reloj');
  const vencido = await c.construir({ permiso: 'permiso-voluntarios', unidades: '1', clave: 'ob-4', acta: 'acta-1', now: T2 });
  linea(`  estado: ${vencido.estado} — ${vencido.detalle}`);

  titulo('10. El dinero: una donación que se puede seguir y otra que no');
  c.registrarDonacion({ id: 'dona-1', aportante: 'donante-1', unidades: '10', clave: 'dona-1' });
  c.registrarDonacion({ id: 'dona-2', aportante: null, unidades: '4', clave: 'dona-2' });
  linea('  dona-1 tiene aportante; dona-2 se registró sin dueño, y se puede registrar: la puerta no lo impide.');
  const sinDueño = await c.usarDonacion({ donacion: 'dona-2', concepto: 'material de la vivienda', unidades: '4', clave: 'uso-x' });
  linea(`  usar dona-2: ${sinDueño.estado} — ${sinDueño.detalle}`);
  linea(`  salida: ${sinDueño.salida}`);

  titulo('11. El uso, y el mismo uso dos veces');
  const uso = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material de la vivienda', unidades: '3', clave: 'uso-1', now: T1 });
  linea(`  estado: ${uso.estado} · recibo ${uso.recibo.status} · sello ${String(uso.recibo.digest).slice(0, 16)}…`);
  const repetido = await c.usarDonacion({ donacion: 'dona-1', concepto: 'material de la vivienda', unidades: '3', clave: 'uso-1', now: T1 });
  linea(`  el mismo uso otra vez: ${repetido.estado} — mismo sello ${String(repetido.recibo.digest).slice(0, 16)}…, y el registro tiene ${c.usos().length} uso.`);

  titulo('12. El municipio recibe la vivienda');
  const entrega = await c.entregar({ permiso: 'permiso-municipio', clave: 'ent-1', acta: 'acta-1', now: T1 });
  linea(`  estado: ${entrega.estado} · recibo ${entrega.recibo.status}`);

  titulo('13. El donante recorre su dinero');
  const dinero = c.recorrerDinero('donante-1');
  for (const paso of dinero.pasos) {
    linea(`  ${paso.paso.padEnd(13)} ${paso.quien.padEnd(22)} sello ${String(paso.recibo.digest).slice(0, 16)}…  estado ${String(paso.recibo.status)}  sello íntegro: ${verifyReceipt(paso.recibo).ok}`);
  }
  linea(`  ${dinero.recurso.el_donante_no_ve}`);
  linea(`  ${dinero.recurso.verificable_sin_casa_firme}`);

  titulo('14. Una tercera parte repone el recorrido con los recibos solos');
  const repuesto = c.reponerDesdeRecibos(dinero.recibos.concat([c.reciboDe('ent-1')].filter(Boolean)), PASOS_CON_ENTREGA);
  linea(`  completitud: ${repuesto.completitud} · completados: ${repuesto.completado.join(', ')} · descartados: ${repuesto.descartados}`);
  linea(`  motivo: ${repuesto.motivo}`);

  titulo('15. La auditoría de la cadena del registro');
  const cadena = c.auditarCadena();
  linea(`  ${cadena.lineas} líneas encadenadas · ${cadena.ok ? 'la cadena calza' : `HAY ${cadena.hallazgos.length} HALLAZGOS`}`);
  const sucia = c.auditarCadena({ ademas: [{ tipo: 'postulacion', clave: 'sol-x', alias: 'fam-abc', anterior: null, nombre: 'Nombre De Ejemplo', rut: '12345678-9' }] });
  linea(`  falsación de la propia auditoría (una línea fabricada a mano con un nombre): ${sucia.ok ? 'PASÓ, y eso la deja vacía' : 'la encontró'}`);
  for (const h of sucia.hallazgos) linea(`    campo «${String(h.campo)}» — ${h.motivo}`);

  titulo('16. Lo que se publicaría');
  const publicado = c.publicarCadena();
  linea(`  red: ${publicado.red}`);
  linea(`  dato de familia: ${publicado.visibilidad.dato_de_familia} — ${publicado.visibilidad.por_que}`);
  linea(`  anclaje: ${publicado.visibilidad.anclaje}`);

  titulo('17. Lo que este recorrido NO demuestra');
  linea('  - NO demuestra pertenencia al catastro. La prueba de conocimiento cero está SIMULADA: el kernel 0.1.5 incluye un verificador, pero Casa Firme no lo integra.');
  linea('  - NO cumple ninguna norma. No hay ancla normativa: el texto primario no se leyó en esta tanda, así que aquí no se nombra ninguna.');
  linea('  - NO hay hash en testnet, ni recibo en explorador, ni blockchain. El anclaje quedó en `pending` a propósito y esto no está verificado afuera.');
  linea('  - NO hay afiliación con ninguna fundación, municipalidad, laboratorio u organización real. Todos los actores son de ejemplo.');
  linea('  - NO hay dinero real, ni pagos, ni banco, ni custodia de nada.');
  linea('  - NO demuestra que la autoridad sea así en la vida real. Demuestra que este recorrido no deja pasar lo que no está otorgado, y nada más.');
  linea('');
  return lineas.join('\n');
}

if (require.main === module) {
  const destino = process.argv[2] || path.join(__dirname, '..', 'datos', `recorrido-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  main(destino).then(() => { process.stdout.write(`registro: ${path.join(destino, 'registro.jsonl')}\n`); });
}

module.exports = { main };
