'use strict';

// El núcleo que Casa Firme consume, resuelto desde la copia vendorizada del proyecto.
//
// Esa copia está fijada al corte 0.1.5 (commit ed559e83c976dd6e6a379a5510db776206f670b4)
// y sus bytes están declarados, módulo por módulo, en el `SOURCE.md` que viaja con ella.
// El proyecto se sirve desde ahí y de ningún otro lado: el árbol de desarrollo del kernel
// vive en otra máquina y avanza, y una copia instalada por un plugin en el HOME de cada
// host tampoco es reproducible en un clon limpio. `test/kernel.test.js` exige que los
// módulos que el kit declara calcen byte a byte con esa tabla y que los encabezados
// declaren el mismo commit, así que el núcleo no puede moverse sin que la prueba se ponga
// roja a propósito.

const fs = require('node:fs');
const path = require('node:path');

const NECESARIO = 'operation.js';

// La única raíz que este proyecto resuelve. Un clon limpio tiene exactamente una copia del
// núcleo, y es esta.
const RAIZES = [
  { host: 'vendor', dir: path.join(__dirname, '..', 'vendor', 'vespi-kernel') },
];

// La versión no se escribe aquí: se lee de la cabecera del `SOURCE.md` que acompaña a la
// copia. Una constante escrita al lado sería una segunda fuente de verdad que se puede
// desincronizar en silencio, que es el modo de falla que la prueba de procedencia existe
// para tapar.
function versionDe(dir) {
  try {
    const texto = fs.readFileSync(path.join(dir, 'SOURCE.md'), 'utf8');
    const encontrado = texto.match(/kernel\s+\*\*(\d+\.\d+\.\d+)\*\*/);
    return encontrado ? encontrado[1] : 'desconocida';
  } catch {
    return 'desconocida';
  }
}

function resolver() {
  const encontradas = [];
  for (const raiz of RAIZES) {
    if (!fs.existsSync(path.join(raiz.dir, NECESARIO))) continue;
    encontradas.push({ host: raiz.host, version: versionDe(raiz.dir), dir: raiz.dir });
  }
  if (encontradas.length === 0) {
    throw new Error(`Casa Firme no encuentra la copia vendorizada del núcleo de Vespi en ${RAIZES[0].dir}. Sin núcleo no hay proyecto: la autoridad, el recibo y la continuidad son suyos.`);
  }
  return encontradas;
}

const ENCONTRADAS = resolver();
const ELEGIDA = ENCONTRADAS[0];

const DIR = ELEGIDA.dir;
const CARGADO = {
  host: ELEGIDA.host,
  version: ELEGIDA.version,
  dir: DIR,
  tambien: ENCONTRADAS.map((e) => `${e.host}@${e.version}`).join(', '),
};

module.exports = {
  ...CARGADO,
  DIR,
  CARGADO,
  COPIAS: ENCONTRADAS,
  ...require(path.join(DIR, 'authority.js')),
  ...require(path.join(DIR, 'operation.js')),
  ...require(path.join(DIR, 'receipt.js')),
  ...require(path.join(DIR, 'continuity.js')),
};