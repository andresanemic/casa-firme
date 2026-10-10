'use strict';

// El corte del núcleo, verificado por bytes.
//
// Casa Firme consume la copia vendorizada del kernel **0.1.5** que vive en
// `vendor/vespi-kernel/`, no el árbol de desarrollo: esa copia está fijada al corte
// ed559e83c976dd6e6a379a5510db776206f670b4 y sus bytes están declarados, módulo por
// módulo, en el `SOURCE.md` que viaja con ella. Aquí se hacen las comprobaciones que el
// comentario solo no paga:
//
//   1. los módulos que el kit declara existen en la copia, y no hay módulos sin declarar;
//   2. cada cuerpo calza con el digest que el kit declara, sobre los bytes que quedan
//      después de las tres líneas de encabezado de cada módulo;
//   3. los encabezados de procedencia declaran el mismo commit, y ese commit es el que
//      este proyecto está fijado a.
//
// La lista sale de la tabla del propio `SOURCE.md`, no de una constante escrita aquí: si el
// kit declara diez módulos, se comprueban diez, y si mañana declara once, la prueba sigue
// comprehensiva sin que nadie la edite.
//
// La copia instalada en cada host no se comprueba aquí a propósito: eso depende del HOME
// de una máquina y un clon limpio no la tiene. Lo que se comprueba es la copia que el
// proyecto sí puede llevar consigo, contra la tabla que ella misma declara.
//
// Si el kernel se repina, esta suite se pone roja a propósito, con el mensaje de repinar.
// Reevaluar la huella es decisión de Andrés, no un ajuste mecánico.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

// La copia vendorizada: la única que este clon lleva consigo y la única que puede
// comprobarse sin el HOME de otra máquina.
const DIR = path.join(__dirname, '..', 'vendor', 'vespi-kernel');

// El commit del corte. Vive aquí porque es la afirmación que esta suite hace: que la copia
// es este corte y no otro.
const COMMIT = 'ed559e83c976dd6e6a379a5510db776206f670b4';

// Lo que el kit declara. Se lee de `SOURCE.md` de la propia copia, no de una constante
// escrita aquí: una constante sería una segunda fuente de verdad que se puede desincronizar
// en silencio, que es exactamente el modo de falla que esta prueba existe para tapar.
function declarados(dir) {
  const texto = fs.readFileSync(path.join(dir, 'SOURCE.md'), 'utf8');
  const salida = {};
  for (const linea of texto.split('\n')) {
    const m = linea.match(/^\|\s*`([a-z0-9-]+\.js)`\s*\|\s*`([0-9a-f]{64})`/);
    if (m) salida[m[1]] = m[2];
  }
  return salida;
}

// Cada archivo del núcleo es tres líneas de encabezado y, debajo, los bytes exactos de la
// fuente. El digest que importa es el del cuerpo.
function cuerpoSinEncabezado(ruta) {
  const crudo = fs.readFileSync(ruta, 'utf8');
  let pos = -1;
  for (let i = 0; i < 3; i += 1) pos = crudo.indexOf('\n', pos + 1);
  assert.ok(pos > 0, `${ruta}: no tiene el encabezado de tres líneas`);
  return crudo.slice(pos + 1);
}

test('la copia vendorizada existe y trae cada módulo que el kit declara', () => {
  assert.ok(fs.existsSync(path.join(DIR, 'SOURCE.md')), `no está la copia vendorizada del núcleo en ${DIR}`);
  const declaracion = declarados(DIR);
  assert.ok(Object.keys(declaracion).length > 0, 'el SOURCE.md de la copia no declara ningún módulo');
  for (const modulo of Object.keys(declaracion)) {
    assert.ok(fs.existsSync(path.join(DIR, modulo)), `${modulo}: el kit lo declara y la copia no lo tiene`);
  }
  // Y al revés: un módulo en la copia que el kit no declara es un módulo que nadie fijó.
  for (const nombre of fs.readdirSync(DIR)) {
    if (!nombre.endsWith('.js')) continue;
    assert.ok(declaracion[nombre], `${nombre}: está en la copia y el kit no declara su digest`);
  }
});

test('cada módulo calza con el digest que el kit declara', () => {
  const esperado = declarados(DIR);
  for (const modulo of Object.keys(esperado)) {
    const real = createHash('sha256').update(cuerpoSinEncabezado(path.join(DIR, modulo)), 'utf8').digest('hex');
    assert.equal(real, esperado[modulo], `${modulo}: el núcleo se movió; repínalo a mano y vuelve a correr la suite`);
  }
});

test('los encabezados de procedencia declaran el commit del corte', () => {
  const declaracion = declarados(DIR);
  const commits = new Set();
  for (const modulo of Object.keys(declaracion)) {
    const lineas = fs.readFileSync(path.join(DIR, modulo), 'utf8').split('\n').slice(0, 3).join(' ');
    const encontrado = lineas.match(/commit ([0-9a-f]{7,40})/);
    assert.ok(encontrado, `${modulo}: el encabezado no declara un commit`);
    commits.add(encontrado[1]);
  }
  assert.equal(commits.size, 1, `los módulos no apuntan al mismo commit: ${[...commits].join(', ')}`);
  assert.ok(COMMIT.startsWith([...commits][0]), `el encabezado dice ${[...commits][0]} y este proyecto está fijado a ${COMMIT}`);
});

test('la copia se carga desde vendor, no desde el árbol de desarrollo ni del HOME', () => {
  // No es una prohibición de que el árbol exista: es la comprobación de que este proyecto
  // no se está sirviendo a sí mismo desde ahí. Si alguien lo arregla leyendo el
  // `require` de `src/kernel-instalado.js`, esta prueba lo delata.
  const fuente = fs.readFileSync(path.join(__dirname, '..', 'src', 'kernel-instalado.js'), 'utf8');
  assert.ok(!fuente.includes('plugins/proyectos/lore-plugin'), 'no se carga el núcleo desde el árbol de desarrollo');
  assert.ok(!/os\.homedir\(\)|process\.env\.USERPROFILE/.test(fuente), 'no se busca el núcleo en el HOME de la máquina');
  assert.ok(fuente.includes("'vendor'"), 'la copia se busca en vendor/vespi-kernel');
  // Y lo que dice la fuente es lo que el módulo Exportó: la prueba no mira comentarios.
  const { DIR: CARGADO_DIR } = require('../src/kernel-instalado.js');
  assert.equal(path.resolve(CARGADO_DIR), path.resolve(DIR), 'el núcleo cargado no es la copia vendorizada');
});
