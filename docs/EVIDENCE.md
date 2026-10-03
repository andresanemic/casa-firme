# Evidence

## English

This page reproduces the current test counts and failure messages from the supplied project run record, and summarizes the agreement and phase records. Those working records and the source code are excluded from this public repository, so this page is a scoped report rather than a raw test transcript. Readers cannot rerun the checks from this repository today.

## Current suite result

The supplied current run reports **21 passing tests out of 24, with 3 failures**. The three failing test names and observed results are:

| Test | What the transcript reports |
|---|---|
| `las tres copias del núcleo que instalan los hosts existen y son idénticas` | The expected vendored kernel copy was not present at the reported Claude host path |
| `el donante recorre su dinero desde la postulación hasta el uso, sin intermediarios` | The assertion at `test/red.test.js:365` failed |
| `la línea de comandos hace lo que dice y devuelve el código que corresponde` | The assertion expecting the phrase `y que el recorrido se repone completo` failed |

The project's records say its kernel copy is pinned to commit `54c20c7`, identified there as candidate `0.1.3`, and that the kernel is checked against fixed digests. The project suite was green at its 2026-09-29 build cut. As described in the supplied project context, the nine coded projects were built against that cut and intentionally fail their kernel pin check when the installed kernel moves; they need to be pinned again against the current kernel. This shared explanation accounts for kernel-related failures, while the transcript does not independently attribute the two named journey and CLI assertions to that movement. The suite must not be described as fully green today.

## What the checks cover

The real test names in the supplied transcript, grouped by what they check, are:

- **Kernel source and identity:** `las tres copias del núcleo que instalan los hosts existen y son idénticas`; `los cinco módulos calzan con los cinco digest que el kit declara`; `los cinco encabezados de procedencia declaran el mismo commit`; `la copia se carga desde los hosts, no desde el árbol de desarrollo`.
- **Assembly authority and donation rules:** `ROJO 1 — un acta sin quorum no otorga: la postulación no avanza`; `ROJO 2 — un miembro no puede autorizar más allá de lo que la asamblea otorgó`; `ROJO 3 — la familia puede firmar, pero su firma no es la de la asamblea`; `ROJO 4 — una donación sin aportante no se puede usar: el dinero no llega a ninguna parte`; `ROJO 5 — registrar dos veces la misma donación no la duplica: devuelve el mismo recibo`; `ROJO 6 — nadie construye sin el acta que lo autoriza`; `CONTROL — una postulación que DEBE poder aprobarse se aprueba`.
- **Permission boundaries:** `el presupuesto del permiso se gasta y se acumula entre usos`; `pasada la fecha del reloj, el permiso no revive solo`; `un permiso no viaja a otra vivienda`.
- **Family data and receipts:** `el dato de una familia no se puede escribir: el esquema lo rechaza`; `la auditoría de la cadena no encuentra dato de familia, y se demuestra que no está vacía`; `lo que se publicaría no trae dato de familia, y la pantalla lo dice`; `reescribir una línea vieja rompe la cadena y la auditoría lo ve`; `el recibo va sellado y uno editado a mano no verifica`; `un verificador que solo cree al ejecutor no puede producir un verde en la auditoría`.
- **Donation journey and interface:** `el donante recorre su dinero desde la postulación hasta el uso, sin intermediarios`; `nada del recorrido nombra a una organización real`; `el recorrido completo corre de punta a punta y su registro se puede leer sin Casa Firme`; `la línea de comandos hace lo que dice y devuelve el código que corresponde`.

The transcript shows 21 passing and 3 failing tests in those areas. Passing tests are bounded checks of the current local inputs, not proof of real-world outcomes.

## Adversarial phase before code

The project phase record says the RED phase was written before implementation: the seven red tests from the project brief plus a control case, with eight additional project tests. The recorded pre-code output shows the tests stopping at import because `../src/casafirme.js` did not yet exist. That run documents the code-free RED stage, but it did not exercise each adversarial assertion individually. The agreement and phase records identify the cases those tests were designed to address: an assembly without quorum, a member expanding authority, a family signature standing in for assembly authority, an unattributed or duplicated donation, construction without authorization, a permission that exceeds scope, and attempts to write family fields or tamper with the receipt chain. The later 2026-09-29 suite transcript reports 24/24 passing at the build cut; the current transcript displays six named `ROJO` tests and the `CONTROL` with today's overall suite result of 21/24.

## Kernel pin and readiness

Each project fixes the kernel it consumes by digest and is designed to fail when that kernel moves. The code projects were built on 2026-09-29 against `54c20c7`, and their build records reported green there. Against the installed kernel identified in the project brief as `0.1.3`, part of each suite now fails until the pin is updated. That re-pin is pending. The project demonstrates a working path in its recorded build; it has not thereby been established as ready for use.

Casa Firme's transcript additionally shows the three failures listed above. The sources confirm the test observations, but do not give a verified root cause for the donation continuity assertion or the CLI phrase assertion beyond their observed failure. We preserve that uncertainty here.

## How to rerun when code opens

When source code is opened for the judging period, review the [review-only license](../LICENSE), clone the repository, inspect its prerequisites, and run `npm test` from the project root. The supplied project manifest defines that command as `node --test "test/*.test.js"`. Compare the full output with this recorded result, check the pinned kernel commit and digests, and record any new run separately with its kernel version and environment. The project also defines `npm run recorrido` and `npm run cli -- <comando>` for the recorded journey and CLI. No testnet check is applicable: the agreement says the project has no network, blockchain, payments or Stellar testnet anchor.

## Limits of this evidence

The data are synthetic and there are no real family details. Tests do not establish legal compliance, privacy under deployment, factual eligibility, an actual donation or construction, use by an institution, a third-party verification, or production readiness. The zero-knowledge proof is simulated, and the receipt anchor remains `pending`.

## Español

Esta página reproduce los recuentos y mensajes de fallo de la corrida suministrada, y resume el acuerdo y los registros de fase. Esos registros de trabajo y el código fuente están excluidos del repositorio público, así que esta página es un informe acotado, no la transcripción íntegra de las pruebas. Hoy todavía no se pueden repetir las comprobaciones desde este repositorio.

## Resultado actual de la suite

La corrida actual suministrada informa **21 pruebas aprobadas de 24 y 3 fallidas**. Los nombres de las tres pruebas fallidas y los resultados observados son:

| Prueba | Qué informa la transcripción |
|---|---|
| `las tres copias del núcleo que instalan los hosts existen y son idénticas` | La copia vendorizada esperada del núcleo no estaba en la ruta informada del host Claude |
| `el donante recorre su dinero desde la postulación hasta el uso, sin intermediarios` | Falló la aserción en `test/red.test.js:365` |
| `la línea de comandos hace lo que dice y devuelve el código que corresponde` | Falló la aserción que esperaba la frase `y que el recorrido se repone completo` |

Los registros del proyecto dicen que la copia del núcleo está fijada al commit `54c20c7`, identificado allí como candidato `0.1.3`, y que el núcleo se comprueba mediante digests fijos. La suite del proyecto estaba verde en el corte de construcción del 2026-09-29. Según el contexto suministrado, los nueve proyectos con código se construyeron contra ese corte y fallan intencionalmente la comprobación del pin cuando cambia el núcleo instalado; hay que volver a fijarlos al núcleo actual. Esa explicación común da cuenta de los fallos relacionados con el núcleo, pero la transcripción no atribuye de manera independiente a ese cambio las otras dos aserciones fallidas, sobre el recorrido del donante y la CLI. No se debe describir la suite como completamente verde hoy.

## Qué cubren las comprobaciones

Los nombres reales de pruebas de la transcripción, agrupados por lo que comprueban, son:

- **Fuente e identidad del núcleo:** `las tres copias del núcleo que instalan los hosts existen y son idénticas`; `los cinco módulos calzan con los cinco digest que el kit declara`; `los cinco encabezados de procedencia declaran el mismo commit`; `la copia se carga desde los hosts, no desde el árbol de desarrollo`.
- **Autoridad de asamblea y reglas de donación:** `ROJO 1 — un acta sin quorum no otorga: la postulación no avanza`; `ROJO 2 — un miembro no puede autorizar más allá de lo que la asamblea otorgó`; `ROJO 3 — la familia puede firmar, pero su firma no es la de la asamblea`; `ROJO 4 — una donación sin aportante no se puede usar: el dinero no llega a ninguna parte`; `ROJO 5 — registrar dos veces la misma donación no la duplica: devuelve el mismo recibo`; `ROJO 6 — nadie construye sin el acta que lo autoriza`; `CONTROL — una postulación que DEBE poder aprobarse se aprueba`.
- **Límites de permisos:** `el presupuesto del permiso se gasta y se acumula entre usos`; `pasada la fecha del reloj, el permiso no revive solo`; `un permiso no viaja a otra vivienda`.
- **Datos familiares y recibos:** `el dato de una familia no se puede escribir: el esquema lo rechaza`; `la auditoría de la cadena no encuentra dato de familia, y se demuestra que no está vacía`; `lo que se publicaría no trae dato de familia, y la pantalla lo dice`; `reescribir una línea vieja rompe la cadena y la auditoría lo ve`; `el recibo va sellado y uno editado a mano no verifica`; `un verificador que solo cree al ejecutor no puede producir un verde en la auditoría`.
- **Recorrido de la donación e interfaz:** `el donante recorre su dinero desde la postulación hasta el uso, sin intermediarios`; `nada del recorrido nombra a una organización real`; `el recorrido completo corre de punta a punta y su registro se puede leer sin Casa Firme`; `la línea de comandos hace lo que dice y devuelve el código que corresponde`.

La transcripción muestra 21 pruebas aprobadas y 3 fallidas en esas áreas. Las pruebas aprobadas son comprobaciones acotadas de las entradas locales actuales, no pruebas de resultados en el mundo real.

## Fase adversarial antes del código

El registro de fases del proyecto dice que la fase RED se escribió antes de la implementación: las siete pruebas rojas de la consigna más un control, y ocho pruebas adicionales propias. La salida previa al código muestra que las pruebas se detuvieron al importar porque todavía no existía `../src/casafirme.js`. Esa corrida documenta la etapa RED sin código, pero no llegó a ejecutar cada aserción adversarial por separado. El acuerdo y los registros de fase identifican los casos para los que se diseñaron esas pruebas: asamblea sin quorum, miembro que amplía su autoridad, firma familiar usada como si fuera autoridad de la asamblea, donación sin aportante o duplicada, construcción sin autorización, permiso que excede el alcance e intentos de escribir campos familiares o alterar la cadena de recibos. La transcripción posterior de la suite del 2026-09-29 informa 24/24 aprobadas en el corte de construcción; la transcripción actual muestra seis pruebas `ROJO` con nombre y el `CONTROL`, y un resultado general de hoy de 21/24.

## Fijación del núcleo y preparación

Cada proyecto fija por digest el núcleo que consume y está diseñado para fallar cuando el núcleo cambia. Los proyectos con código se construyeron el 2026-09-29 contra `54c20c7`, y sus registros de construcción informaron que estaban verdes ahí. Contra el núcleo instalado que el encargo identifica como `0.1.3`, parte de cada suite falla hasta que se actualice la fijación. Esa refijación sigue pendiente. El proyecto muestra un recorrido que funcionó en su corrida registrada; eso no demuestra que esté listo para uso.

La transcripción de Casa Firme también muestra los tres fallos indicados arriba. Las fuentes confirman las observaciones de las pruebas, pero no entregan una causa raíz verificada para la aserción de continuidad de la donación ni para la frase esperada por la CLI. Conservamos esa incertidumbre.

## Cómo volver a ejecutarlas cuando se abra el código

Cuando el código fuente se abra durante el periodo de los jueces, revisa la [licencia de solo revisión](../LICENSE), clona el repositorio, consulta los prerrequisitos documentados y ejecuta `npm test` desde la raíz del proyecto. El `package.json` suministrado define ese comando como `node --test "test/*.test.js"`. Compara toda la salida con este resultado registrado, revisa el commit y los digests fijados y registra cada corrida nueva por separado junto con la versión del núcleo y el entorno. Las fuentes también indican `npm run recorrido` y `npm run cli -- <comando>` para el recorrido y la CLI registrados. No corresponde probar en testnet: el acuerdo dice que el proyecto no usa red, blockchain, pagos ni anclaje en Stellar testnet.

## Límites de esta evidencia

Los datos son sintéticos y no hay detalles de familias reales. Las pruebas no establecen cumplimiento legal, privacidad en un despliegue, elegibilidad factual, una donación o construcción reales, uso por una institución, verificación de una tercera parte ni preparación para producción. La prueba de conocimiento cero está simulada y el anclaje del recibo sigue en `pending`.
