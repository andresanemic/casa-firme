# Evidence / Evidencia

## English

This page separates recorded observations from what they establish. The public repository contains this report, not the application code or the full working transcript, so its tests cannot be rerun from this checkout.

## Current suite

The supplied current run reports **21 passing tests out of 24, with 3 failures**. The three observed failures are:

| Check | Recorded observation |
|---|---|
| The installed kernel copies exist and are identical | The test reports that the expected vendored kernel copy is absent at the Claude host path it checked |
| The donor follows the contribution from application to use | An assertion fails at `test/red.test.js:365`; the transcript does not establish why |
| The command line does what it says and returns the expected code | The expected phrase `y que el recorrido se repone completo` is absent; the transcript does not establish why |

The first observation is tied to the project's kernel pin check. The build record identifies the consumed kernel as commit `54c20c7`, candidate `0.1.3`; its test checks that the installed copies exist, match one another, carry the same provenance commit and match five declared module digests. A missing copy is a failed pin check. The transcript identifies the absent copy and path it checked, but it does not establish the cause of that absence. It does not connect the other two failures to the kernel pin, so this report leaves their causes open.

The project records report a green 24 of 24 run at the 2026-09-29 build cut. That is a historical result, not today's supplied result. The current suite is not fully green.

## What the checks cover

The 24 checks cover four areas:

- **Kernel identity:** installed copies, five declared module digests, provenance commit headers and loading from the host copy.
- **Assembly and donation rules:** no grant without quorum; one member or an applicant family cannot stand in for assembly authority; a donation without a contributor cannot be used; repeating a donation does not duplicate it; construction needs its authorizing minutes; and a valid control application can be approved.
- **Permission limits:** budget accumulates across uses, expiry does not revive a grant, and a permission cannot move to another home.
- **Family data, receipts and the journey:** undeclared family fields are rejected; the audit checks that the chain is nonempty and contains no family data; the publishable view is checked; edited lines and receipts fail integrity checks; verification recomputes rather than trusting the executor; the donor journey, local end-to-end run, and command-line behavior are checked.

The names of the adversarial cases include quorum, member authority, family signature, unattributed donation, duplicate donation and construction without minutes. Other checks attempt to widen a grant, exceed a budget, act after expiry, move the destination, add family fields and alter an old receipt-chain line. The suite also includes a positive control, so it checks that a valid application can proceed.

Passing checks establish only that the supplied local code and inputs met those assertions in that run. They do not establish outcomes outside that test boundary.

## The supplied journey

The recorded walkthrough exercises both rejected and accepted steps. It reports a one-of-two approval assembly as waiting for a decision, with zero permissions; then records an assembly with two named members and separate grants for volunteers, a foundation and the municipality. A proposed increase from four to nine material units is rejected. The run then records construction, a ten-unit fictional donation, a three-unit use, an unchanged receipt when that use is repeated, and a delivery step.

The walkthrough reports 36 linked JSONL lines and a matching chain. It deliberately appends a fabricated line containing undeclared family fields and reports that the audit catches the fields, broken predecessor link and mismatched fingerprint. Its publishable-payload check reports no network destination and no family identity field. The donor journey lists the application, minutes, construction and use receipts; a separate continuity step reports a complete journey reconstructed from receipts alone.

Those lines are outputs from the supplied local run, not outputs recreated for this documentation. The run itself labels the family proof simulated and the receipt anchor `pending`.

## Adversarial phase before code

The phase record says seven requested red cases, one positive control and eight additional project checks were written before implementation. The recorded pre-code run stopped while importing the application because its module did not exist yet. That is evidence of the code-free RED stage and of its import failure. It is not evidence that every planned assertion ran and failed individually before code.

## Reproducing a run

The project manifest defines `npm test` as `node --test "test/*.test.js"`, `npm run recorrido` for the recorded journey and `npm run cli -- <comando>` for the command line. Those commands require the application source and its expected host kernel copies, neither of which is supplied in this public repository. If the code becomes available under its review terms, a new run should be recorded separately with its environment and kernel commit, then compared with this report rather than silently replacing it.

## Limits of this evidence

The inputs are synthetic. Tests do not establish actual family eligibility, legal compliance, privacy under deployment, real construction or transfers, institutional participation, third-party verification outside the recorded local run, a live blockchain anchor or production readiness. The zero-knowledge proof is simulated, and the receipt anchor remains pending.

## Español

Esta página separa las observaciones registradas de lo que permiten concluir. El repositorio público contiene este informe, no el código de la aplicación ni la transcripción íntegra de trabajo, por lo que desde este checkout no se pueden repetir las pruebas.

## Suite actual

La corrida actual suministrada informa **21 pruebas aprobadas de 24 y 3 fallidas**. Estas son las tres fallas observadas:

| Comprobación | Observación registrada |
|---|---|
| Las copias instaladas del núcleo existen y son idénticas | La prueba informa que falta la copia vendorizada esperada en la ruta del host Claude que revisó |
| El donante sigue el aporte desde la postulación hasta el uso | Falla una aserción en `test/red.test.js:365`; la transcripción no establece por qué |
| La línea de comandos cumple lo que anuncia y devuelve el código esperado | Falta la frase esperada `y que el recorrido se repone completo`; la transcripción no establece por qué |

La primera observación corresponde a la comprobación del pin del núcleo. El registro de construcción identifica el núcleo consumido con el commit `54c20c7`, candidato `0.1.3`; la prueba comprueba que las copias instaladas existan, coincidan entre sí, tengan el mismo commit de procedencia y calcen con cinco digests de módulos declarados. Una copia ausente hace fallar la comprobación del pin. La transcripción identifica la copia y la ruta revisada, pero no establece por qué faltaba. Tampoco relaciona los otros dos fallos con el pin, así que este informe deja abiertas sus causas.

Los registros del proyecto informan una corrida histórica verde de 24/24 en el corte de construcción del 2026-09-29. Ese resultado no es el de hoy. La suite actual no está completamente verde.

## Qué cubren las comprobaciones

Las 24 comprobaciones cubren cuatro áreas:

- **Identidad del núcleo:** copias instaladas, cinco digests de módulos declarados, encabezados con el commit de procedencia y carga desde la copia del host.
- **Reglas de asamblea y donación:** no se otorga sin quorum; un miembro o la familia postulante no reemplazan la autoridad de la asamblea; no se puede usar una donación sin aportante; repetir una donación no la duplica; la construcción requiere el acta autorizante; y una postulación válida puede aprobarse como control positivo.
- **Límites de permisos:** el presupuesto se acumula entre usos, el vencimiento no reactiva un permiso y el permiso no puede trasladarse a otra vivienda.
- **Datos familiares, recibos y recorrido:** se rechazan campos familiares no declarados; la auditoría comprueba que la cadena no esté vacía ni contenga datos de familia; se revisa la vista publicable; líneas y recibos editados fallan la integridad; la verificación recalcula en vez de creer al ejecutor; se comprueban el recorrido del donante, la corrida local de principio a fin y la línea de comandos.

Los casos adversariales incluyen quorum, autoridad de un miembro, firma familiar, donación sin aportante, donación duplicada y construcción sin acta. Otras pruebas intentan ampliar un permiso, exceder el presupuesto, actuar después del vencimiento, cambiar el destino, agregar campos de familia y alterar una línea anterior de la cadena de recibos. La suite también tiene un control positivo para comprobar que una postulación válida pueda avanzar.

Las pruebas aprobadas solo establecen que el código y las entradas locales suministradas cumplieron esas aserciones en esa corrida. No establecen resultados fuera de ese límite de prueba.

## El recorrido suministrado

La corrida registrada ejercita pasos rechazados y aceptados. Informa que una asamblea con una aprobación de dos queda a la espera de una decisión y con cero permisos; luego registra una asamblea con dos integrantes identificados y permisos separados para voluntarios, una fundación y la municipalidad. Rechaza un aumento propuesto de cuatro a nueve unidades de material. Después registra construcción, una donación ficticia de diez unidades, un uso de tres unidades, el mismo recibo al repetir el uso y un paso de entrega.

El recorrido informa 36 líneas JSONL enlazadas y una cadena que calza. Agrega deliberadamente una línea fabricada con campos familiares no declarados y dice que la auditoría detecta los campos, el enlace anterior roto y una huella que no coincide. La comprobación del contenido publicable informa que no hay destino de red ni campo de identidad familiar. La vista del donante enumera los recibos de postulación, acta, construcción y uso; un paso separado de continuidad informa que se reconstruyó el recorrido completo usando solo los recibos.

Esas líneas son salidas de la corrida local suministrada, no salidas recreadas para esta documentación. La propia corrida etiqueta la prueba de la familia como simulada y el anclaje del recibo como `pending`.

## Fase adversarial antes del código

El registro de fases dice que antes de implementar se escribieron siete casos rojos solicitados, un control positivo y ocho comprobaciones adicionales del proyecto. La corrida previa al código se detuvo al importar la aplicación porque su módulo todavía no existía. Eso documenta la fase RED sin código y su fallo de importación. No demuestra que cada aserción prevista se haya ejecutado y fallado individualmente antes de escribir el código.

## Cómo reproducir una corrida

El manifiesto del proyecto define `npm test` como `node --test "test/*.test.js"`, `npm run recorrido` para el recorrido registrado y `npm run cli -- <comando>` para la línea de comandos. Esos comandos requieren el código fuente de la aplicación y las copias del núcleo esperadas en los hosts, que no se entregan en este repositorio público. Si el código queda disponible bajo sus condiciones de revisión, registra una nueva corrida por separado con su entorno y commit del núcleo, y compárala con este informe en vez de reemplazarlo sin anotación.

## Límites de esta evidencia

Las entradas son sintéticas. Las pruebas no establecen elegibilidad familiar real, cumplimiento legal, privacidad en un despliegue, construcción o transferencias reales, participación institucional, verificación de una tercera parte fuera del recorrido local registrado, anclaje activo en blockchain ni preparación para producción. La prueba de conocimiento cero está simulada y el anclaje del recibo sigue pendiente.
