'use strict';

// La línea de comandos de Casa Firme. Mundana a propósito: el recorrido completo se lee
// con `npm run recorrido`, y esto es para repetir un paso suelto o auditar sin recorrer.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { CasaFirme } = require('./casafirme.js');
const { CARGADO } = require('./kernel-instalado.js');

const AYUDA = `Casa Firme — proyecto 3 de los diez de Vespi. Datos de ejemplo, sin red.

  casafirme recorrido [dir]        el recorrido completo, de punta a punta
  casafirme auditar  [dir]         la cadena del registro y los recibos que sellan
  casafirme dinero   <donante> [dir]   el recorrido del dinero de un donante
  casafirme permisos [dir]         los permisos que el registro tiene
  casafirme nucleo                qué núcleo está cargado y de dónde

  Sin dir, usa una carpeta temporal nueva. Salida 0 = todo pasa; 1 = hay un hallazgo.
`;

function escribe(t) { process.stdout.write(`${t}\n`); }

async function main(argv) {
  const [comando, ...resto] = argv;
  if (!comando || comando === 'ayuda' || comando === '--help') { escribe(AYUDA); return 0; }
  if (comando === 'nucleo') {
    escribe(`versión: ${CARGADO.version}`);
    escribe(`cargado desde: ${CARGADO.dir}`);
    escribe(`copias que coinciden: ${CARGADO.tambien}`);
    return 0;
  }
  if (comando === 'recorrido') {
    const { main: recorrido } = require('./recorrido.js');
    const destino = resto[0] || fs.mkdtempSync(path.join(os.tmpdir(), 'casafirme-'));
    await recorrido(destino);
    return 0;
  }

  // Cada comando sabe cuál de sus argumentos es la carpeta. Mezclarlos hacía que
  // `dinero donante-1 <dir>` abriera un registro nuevo con el nombre del donante y
  // contestara que no hay ninguna donación, y que `auditar <dir>` auditara una carpeta
  // vacía. Una posición fija por comando, declarada aquí y no inferida.
  const args = [...resto].filter((a) => !String(a).startsWith('--'));
  const posicion = { dinero: 1, auditar: 0, permisos: 0 }[comando] ?? 0;
  const c = new CasaFirme({ dir: args[posicion] || fs.mkdtempSync(path.join(os.tmpdir(), 'casafirme-')) });
  if (comando === 'auditar') {
    const cadena = c.auditarCadena();
    escribe(`${cadena.lineas} líneas · ${cadena.ok ? 'cadena íntegra' : `${cadena.hallazgos.length} hallazgos`}`);
    for (const h of cadena.hallazgos) escribe(`  ${h.motivo}`);
    // El número de fallos va en la línea de encabezado y el código de salida es 0 o 1: un
    // shell decide con el código, y un código que cuenta hallazgos deja de ser legible.
    let fallos = cadena.ok ? 0 : cadena.hallazgos.length;
    for (const r of c.recibos()) {
      if (r.recibo.status !== 'verified') {
        // Un recibo de un paso que no ocurrió no tiene efecto que auditar: auditarlo sería
        // medir algo que no pasó, y el número de «fallos» dejaría de significar lo que dice.
        escribe(`  ${r.paso}/${r.clave}: estado ${String(r.recibo.status)} · el paso no ocurrió, no hay efecto que auditar`);
        continue;
      }
      const veredicto = c.auditar(r.recibo);
      if (!veredicto.ok) fallos += 1;
      escribe(`  ${r.paso}/${r.clave}: sello ${String(r.recibo.digest).slice(0, 12)}… auditoría ${veredicto.ok ? 'pasa' : 'NO pasa'} — ${veredicto.motivo}`);
    }
    return fallos > 0 ? 1 : 0;
  }
  if (comando === 'dinero') {
    const donante = args[0];
    if (!donante) { escribe('hace falta el id del donante'); return 2; }
    const dinero = c.recorrerDinero(donante);
    if (dinero.pasos.length === 0) { escribe(dinero.motivo); return 1; }
    for (const p of dinero.pasos) escribe(`${p.paso.padEnd(13)} ${p.quien.padEnd(22)} ${String(p.recibo.digest).slice(0, 16)}… ${String(p.recibo.status)}`);
    const repuesto = c.reponerDesdeRecibos(dinero.recibos);
    escribe(`repuesto desde los recibos: ${repuesto.completitud} (${repuesto.motivo})`);
    return 0;
  }
  if (comando === 'permisos') {
    for (const p of c.permisos()) escribe(`${p.id}  ${p.actor}  ${p.paso}  ${p.presupuesto}u  ${p.destino}  hasta ${p.reloj}  (acta ${p.acta})`);
    return 0;
  }
  escribe(`comando desconocido: ${comando}`);
  escribe(AYUDA);
  return 2;
}

if (require.main === module) {
  main(process.argv.slice(2)).then((codigo) => { process.exitCode = codigo; });
}

module.exports = { main };
