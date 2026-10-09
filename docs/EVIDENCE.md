# Evidence / Evidencia

## English

This page separates recorded observations from what they establish. The public repository contains this report, not the application code or the full working transcript, so its tests cannot be rerun from this checkout.

## Current suite

The supplied run of 2026-10-09 reports **24 tests, 24 passing, none otherwise, none skipped, none todo, none cancelled, on Node v24.15.0**. It ran in a clean clone with empty HOME and no network, with command `node --test test/*.test.js`. The consumed kernel is Vespi 0.1.5, commit `ed559e83c976dd6e6a379a5510db776206f670b4`, copied in `vendor/vespi-kernel` and checked against its SOURCE.md (per-module digests and commit). The reference capture is `docs/suite-2026-10-09.txt`; every name below comes from that file.

### Kernel identity

| Check | Result |
|---|---|
| la copia vendorizada existe y trae cada módulo que el kit declara | Pass |
| cada módulo calza con el digest que el kit declara | Pass |
| los encabezados de procedencia declaran el commit del corte | Pass |
| la copia se carga desde vendor, no desde el árbol de desarrollo ni del HOME | Pass |

### Assembly and donation rules

| Check | Result |
|---|---|
| ROJO 1 — un acta sin quorum no otorga: la postulación no avanza | Pass |
| ROJO 2 — un miembro no puede autorizar más allá de lo que la asamblea otorgó | Pass |
| ROJO 3 — la familia puede firmar, pero su firma no es la de la asamblea | Pass |
| ROJO 4 — una donación sin aportante no se puede usar: el dinero no llega a ninguna parte | Pass |
| ROJO 5 — registrar dos veces la misma donación no la duplica: devuelve el mismo recibo | Pass |
| ROJO 6 — nadie construye sin el acta que lo autoriza | Pass |
| CONTROL — una postulación que DEBE poder aprobarse se aprueba | Pass |

### Permission limits

| Check | Result |
|---|---|
| el presupuesto del permiso se gasta y se acumula entre usos | Pass |
| pasada la fecha del reloj, el permiso no revive solo | Pass |
| un permiso no viaja a otra vivienda | Pass |

### Family data, receipts and the journey

| Check | Result |
|---|---|
| el dato de una familia no se puede escribir: el esquema lo rechaza | Pass |
| la auditoría de la cadena no encuentra dato de familia, y se demuestra que no está vacía | Pass |
| lo que se publicaría no trae dato de familia, y la pantalla lo dice | Pass |
| reescribir una línea vieja rompe la cadena y la auditoría lo ve | Pass |
| el recibo va sellado y uno editado a mano no verifica | Pass |
| un verificador que solo cree al ejecutor no puede producir un verde en la auditoría | Pass |
| el donante recorre su dinero desde la postulación hasta el uso, sin intermediarios | Pass |
| nada del recorrido nombra a una organización real | Pass |
| el recorrido completo corre de punta a punta y su registro se puede leer sin Casa Firme | Pass |
| la línea de comandos hace lo que dice y devuelve el código que corresponde | Pass |

## Why the earlier capture was red

The 2026-10-03 capture was red while the project was pinned to the old 0.1.3 kernel cut. That pin has since been updated to 0.1.5 with its vendored copy and digest checks, and the 2026-10-09 capture is green.

## What the checks cover

The 24 checks cover four areas:

- **Kernel identity:** vendored copy presence, declared module digests, provenance commit headers and loading from the vendor copy.
- **Assembly and donation rules:** no grant without quorum; one member or an applicant family cannot stand in for assembly authority; a donation without a contributor cannot be used; repeating a donation does not duplicate it; construction needs its authorizing minutes; and a valid control application can be approved.
- **Permission limits:** budget accumulates across uses, expiry does not revive a grant, and a permission cannot move to another home.
- **Family data, receipts and the journey:** undeclared family fields are rejected; the audit checks that the chain is nonempty and contains no family data; the publishable view is checked; edited lines and receipts do not verify; verification recomputes rather than trusting the executor; the donor journey, local end-to-end run, and command-line behavior are checked.

The names of the adversarial cases include quorum, member authority, family signature, unattributed donation, duplicate donation and construction without minutes. Other checks attempt to widen a grant, exceed a budget, act after expiry, move the destination, add family fields and alter an old receipt-chain line. The suite also includes a positive control, so it checks that a valid application can proceed.

Passing checks establish only that the supplied local code and inputs met those assertions in that run. They do not establish outcomes outside that test boundary.

## The supplied journey

The recorded walkthrough exercises both rejected and accepted steps. It reports a one-of-two approval assembly as waiting for a decision, with zero permissions; then records an assembly with two named members and separate grants for volunteers, a foundation and the municipality. A proposed increase from four to nine material units is rejected. The run then records construction, a ten-unit fictional donation, a three-unit use, an unchanged receipt when that use is repeated, and a delivery step.

The walkthrough reports 36 linked JSONL lines and a matching chain. It deliberately appends a fabricated line containing undeclared family fields and reports that the audit catches the fields, broken predecessor link and mismatched fingerprint. Its publishable-payload check reports no network destination and no family identity field. The donor journey lists the application, minutes, construction and use receipts; a separate continuity step reports a complete journey reconstructed from receipts alone.

Those lines are outputs from the supplied local run, not outputs recreated for this documentation. The run itself labels the family proof simulated and the receipt anchor `pending`.

## Adversarial phase before code

The phase record says seven requested red cases, one positive control and eight additional project checks were written before implementation. The recorded pre-code run stopped while importing the application because its module did not exist yet. That is evidence of the code-free RED stage and of its import stop. It is not evidence that every planned assertion ran and produced its own red result before code.

## Reproducing a run

The project manifest defines `npm test` as `node --test "test/*.test.js"`, `npm run recorrido` for the recorded journey and `npm run cli -- <comando>` for the command line. Those commands require the application source and its expected vendored kernel copy, neither of which is supplied in this public repository. If the code becomes available under its review terms, a new run must report the same 24-test green count on Node v24.15.0, and `docs/suite-2026-10-09.txt` stays the reference for names and counts; record any new run separately with its environment and kernel commit rather than silently replacing this report.

## Limits of this evidence

The inputs are synthetic. Tests do not establish actual family eligibility, legal compliance, privacy under deployment, real construction or transfers, institutional participation, third-party verification outside the recorded local run, a live blockchain anchor or production readiness. The zero-knowledge proof is simulated, and the receipt anchor remains pending.

## Español

Esta página separa las observaciones registradas de lo que permiten concluir. El repositorio público contiene este informe, no el código de la aplicación ni la transcripción íntegra de trabajo, por lo que desde este checkout no se pueden repetir las pruebas.

## Suite actual

La corrida suministrada del 2026-10-09 informa **24 pruebas, 24 aprobadas, ninguna con otro resultado, ninguna omitida, ninguna todo, ninguna cancelada, en Node v24.15.0**. Corrió en un clon limpio con HOME vacío y sin red, con el comando `node --test test/*.test.js`. El núcleo consumido es Vespi 0.1.5, commit `ed559e83c976dd6e6a379a5510db776206f670b4`, copiado en `vendor/vespi-kernel` y comprobado contra su SOURCE.md (digests por módulo y commit). La captura de referencia es `docs/suite-2026-10-09.txt`; cada nombre siguiente viene de ese archivo.

### Identidad del núcleo

| Comprobación | Resultado |
|---|---|
| la copia vendorizada existe y trae cada módulo que el kit declara | Pass |
| cada módulo calza con el digest que el kit declara | Pass |
| los encabezados de procedencia declaran el commit del corte | Pass |
| la copia se carga desde vendor, no desde el árbol de desarrollo ni del HOME | Pass |

### Reglas de asamblea y donación

| Comprobación | Resultado |
|---|---|
| ROJO 1 — un acta sin quorum no otorga: la postulación no avanza | Pass |
| ROJO 2 — un miembro no puede autorizar más allá de lo que la asamblea otorgó | Pass |
| ROJO 3 — la familia puede firmar, pero su firma no es la de la asamblea | Pass |
| ROJO 4 — una donación sin aportante no se puede usar: el dinero no llega a ninguna parte | Pass |
| ROJO 5 — registrar dos veces la misma donación no la duplica: devuelve el mismo recibo | Pass |
| ROJO 6 — nadie construye sin el acta que lo autoriza | Pass |
| CONTROL — una postulación que DEBE poder aprobarse se aprueba | Pass |

### Límites de permisos

| Comprobación | Resultado |
|---|---|
| el presupuesto del permiso se gasta y se acumula entre usos | Pass |
| pasada la fecha del reloj, el permiso no revive solo | Pass |
| un permiso no viaja a otra vivienda | Pass |

### Datos familiares, recibos y recorrido

| Comprobación | Resultado |
|---|---|
| el dato de una familia no se puede escribir: el esquema lo rechaza | Pass |
| la auditoría de la cadena no encuentra dato de familia, y se demuestra que no está vacía | Pass |
| lo que se publicaría no trae dato de familia, y la pantalla lo dice | Pass |
| reescribir una línea vieja rompe la cadena y la auditoría lo ve | Pass |
| el recibo va sellado y uno editado a mano no verifica | Pass |
| un verificador que solo cree al ejecutor no puede producir un verde en la auditoría | Pass |
| el donante recorre su dinero desde la postulación hasta el uso, sin intermediarios | Pass |
| nada del recorrido nombra a una organización real | Pass |
| el recorrido completo corre de punta a punta y su registro se puede leer sin Casa Firme | Pass |
| la línea de comandos hace lo que dice y devuelve el código que corresponde | Pass |

## Por qué la captura anterior quedó en rojo

La captura del 2026-10-03 quedó en rojo cuando el proyecto estaba fijado al corte viejo 0.1.3 del núcleo. Ese pin ya se actualizó a 0.1.5 con su copia vendorizada y sus comprobaciones de digest, y la captura del 2026-10-09 está en verde.

## Qué cubren las comprobaciones

Las 24 comprobaciones cubren cuatro áreas:

- **Identidad del núcleo:** presencia de la copia vendorizada, digests de módulos declarados, encabezados con el commit de procedencia y carga desde la copia vendor.
- **Reglas de asamblea y donación:** no se otorga sin quorum; un miembro o la familia postulante no reemplazan la autoridad de la asamblea; no se puede usar una donación sin aportante; repetir una donación no la duplica; la construcción requiere el acta autorizante; y una postulación válida puede aprobarse como control positivo.
- **Límites de permisos:** el presupuesto se acumula entre usos, el vencimiento no reactiva un permiso y el permiso no puede trasladarse a otra vivienda.
- **Datos familiares, recibos y recorrido:** se rechazan campos familiares no declarados; la auditoría comprueba que la cadena no esté vacía ni contenga datos de familia; se revisa la vista publicable; líneas y recibos editados no verifican; la verificación recalcula en vez de creer al ejecutor; se comprueban el recorrido del donante, la corrida local de principio a fin y la línea de comandos.

Los casos adversariales incluyen quorum, autoridad de un miembro, firma familiar, donación sin aportante, donación duplicada y construcción sin acta. Otras pruebas intentan ampliar un permiso, exceder el presupuesto, actuar después del vencimiento, cambiar el destino, agregar campos de familia y alterar una línea anterior de la cadena de recibos. La suite también tiene un control positivo para comprobar que una postulación válida pueda avanzar.

Las pruebas aprobadas solo establecen que el código y las entradas locales suministradas cumplieron esas aserciones en esa corrida. No establecen resultados fuera de ese límite de prueba.

## El recorrido suministrado

La corrida registrada ejercita pasos rechazados y aceptados. Informa que una asamblea con una aprobación de dos queda a la espera de una decisión y con cero permisos; luego registra una asamblea con dos integrantes identificados y permisos separados para voluntarios, una fundación y la municipalidad. Rechaza un aumento propuesto de cuatro a nueve unidades de material. Después registra construcción, una donación ficticia de diez unidades, un uso de tres unidades, el mismo recibo al repetir el uso y un paso de entrega.

El recorrido informa 36 líneas JSONL enlazadas y una cadena que calza. Agrega deliberadamente una línea fabricada con campos familiares no declarados y dice que la auditoría detecta los campos, el enlace anterior roto y una huella que no coincide. La comprobación del contenido publicable informa que no hay destino de red ni campo de identidad familiar. La vista del donante enumera los recibos de postulación, acta, construcción y uso; un paso separado de continuidad informa que se reconstruyó el recorrido completo usando solo los recibos.

Esas líneas son salidas de la corrida local suministrada, no salidas recreadas para esta documentación. La propia corrida etiqueta la prueba de la familia como simulada y el anclaje del recibo como `pending`.

## Fase adversarial antes del código

El registro de fases dice que antes de implementar se escribieron siete casos rojos solicitados, un control positivo y ocho comprobaciones adicionales del proyecto. La corrida previa al código se detuvo al importar la aplicación porque su módulo todavía no existía. Eso documenta la fase RED sin código y su detención en la importación. No demuestra que cada aserción prevista se haya ejecutado y producido su propio resultado rojo antes de escribir el código.

## Cómo reproducir una corrida

El manifiesto del proyecto define `npm test` como `node --test "test/*.test.js"`, `npm run recorrido` para el recorrido registrado y `npm run cli -- <comando>` para la línea de comandos. Esos comandos requieren el código fuente de la aplicación y la copia vendorizada esperada del núcleo, que no se entregan en este repositorio público. Si el código queda disponible bajo sus condiciones de revisión, la nueva corrida debe informar el mismo conteo verde de 24 pruebas en Node v24.15.0, y `docs/suite-2026-10-09.txt` sigue como referencia de nombres y conteos; registra cualquier nueva corrida por separado con su entorno y commit del núcleo en vez de reemplazar este informe sin anotación.

## Límites de esta evidencia

Las entradas son sintéticas. Las pruebas no establecen elegibilidad familiar real, cumplimiento legal, privacidad en un despliegue, construcción o transferencias reales, participación institucional, verificación de una tercera parte fuera del recorrido local registrado, anclaje activo en blockchain ni preparación para producción. La prueba de conocimiento cero está simulada y el anclaje del recibo sigue en `pending`.
