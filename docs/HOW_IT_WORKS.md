# How it works / Cómo funciona

## English

Casa Firme is a local, fictional vertical journey from a housing application to the recorded use of a donation. The unit is the application and the donation's path to that use. The committee assembly is the source of authority in the model; every other actor acts only within a permission the assembly grants.

## One journey

A family applies under an alias and fingerprint. The first assembly is short of its declared quorum, so its receipt asks for a human decision and the application does not advance. A later assembly records the required named approvals and issues different permissions to volunteers, a foundation and the municipality. The volunteers and foundation record construction under their own scopes, while the municipality has a separate delivery step.

The donor contributes ten fictional material units. A use of three units for housing materials is recorded against that contribution. A second attempt to record the same use returns the existing receipt, leaving one use in the record. The donor's view follows the application, assembly, construction and use receipts without displaying the family's alias. A verifier can recompute the record, and a third party can resume the journey from receipts alone.

This account describes the supplied fictional run. It does not say that a real assembly made a decision, that a home was built or that money changed hands.

## Actors, rights and limits

| Actor | Right in the model | Limit |
|---|---|---|
| Applicant family | Submit an application | Has no authority to grant permission; represented by an alias and fingerprint |
| Housing committee assembly | Evaluate the application and grant permissions in its minutes | Below its declared quorum, it cannot grant |
| Committee members | Sign as named members of the assembly | A member cannot grant alone or exceed the minutes |
| Volunteers | Record authorized construction | Bound by action, material-unit budget, destination and expiry |
| Foundation | Contribute material and execute its own authorized work | Its size gives it no authority beyond its permission |
| Municipality | Record its authorized delivery step | Acts only within its own permission |
| Donor | Contribute and follow the receipt trail | Sees the recorded trail, not the family |
| Verifier | Recompute what the supplied record supports | Checks that record; does not establish real-world truth |

## Permission rules

Each permission names an action, a ceiling in material units, a destination and an expiry. It also records the required signers and who may pause the work. The agreement treats those limits as part of the authority, not as optional notes.

Delegation can narrow a grant but cannot widen its action, budget or time. A grant cannot move to another home or revive after expiry. An attempt to use more than the remaining budget, act for another destination, proceed without the authorizing minutes or work past expiry returns blocked with a reason and an exit. The family cannot sign in place of the assembly.

A donation must have a recorded contributor before its use can be followed. Repeating the same donation or use returns the same receipt rather than creating a duplicate. The family record has a closed field schema; fields outside it are rejected. A receipt auditor checks the recorded content and the chain of fingerprints, while an independent verifier recalculates from the record instead of relying on the executor's summary.

## The local record

Each step adds a sealed receipt to a JSONL file. Every line carries the fingerprint of the preceding line, so changing an earlier line breaks the chain. The supplied walkthrough can be read with an ordinary text editor, and the recorded journey says the receipts can be used to resume it without Casa Firme.

```text
Application (alias)
        |
        v
Committee assembly minutes and quorum
        |
        +--> scoped permission --> volunteers --> construction receipt
        +--> scoped permission --> foundation --> construction receipt
        +--> scoped permission --> municipality --> delivery receipt
        |
        v
Donation receipt --> recorded use --> local receipt chain --> donor view
                                                           |
                                      independent recomputation and continuity
```

The record is local and synthetic. The journey uses no network, payment or participating third-party service. Its receipt anchor is `pending`; receipt verification and continuity are demonstrated against the local record, and the zero-knowledge proof is simulated.

<a id="que-aporta-el-nucleo"></a>

## What the kernel contributes

Casa Firme uses the Vespi kernel's bounded authority, named human approval gate, operation receipts, verification and continuity from receipts. The project adds the domain model that the kernel does not define: assembly minutes as authority, quorum and member rules, the housing and donation steps, the closed family schema and the local linked record. The consumed kernel copy is pinned to a commit and checked against declared module digests; this project does not change it.

The project agreement describes its installed kernel cut as commit `54c20c7`, candidate `0.1.3`. This journey does not implement emergency access, skill provenance or live x402 payments. Lore Plugin supplies project context and host routing; it is not the source of housing authority or the donation rules. This public repository documents these relationships but does not contain the application source for readers to execute.

## What the journey demonstrates

The supplied suite names checks for quorum, member authority, permission bounds, cumulative budget use, expiry, destination, duplicate donations, construction authorization, closed family fields, receipt integrity, chain tampering, independent recomputation and a complete local journey. The full scope and current failures are recorded in [Evidence](EVIDENCE.md).

These checks are bounded observations about synthetic inputs and a local run. They do not establish family eligibility, real-world authority, legal compliance, privacy in a deployment, an actual donation or build, institutional participation, external anchoring or production readiness. No claim in this walkthrough substitutes for those checks.

## Español

Casa Firme es un recorrido vertical, local y ficticio desde una postulación de vivienda hasta el uso registrado de una donación. La unidad es la postulación y el trayecto de la donación hasta ese uso. En el modelo, la asamblea del comité es el origen de la autoridad; los demás actores actúan solo dentro de un permiso que ella otorga.

## Un recorrido

Una familia postula con un alias y una huella. La primera asamblea no alcanza el quorum declarado, por lo que su recibo pide una decisión humana y la postulación no avanza. Una asamblea posterior registra las aprobaciones identificadas que se requieren y emite permisos distintos para voluntarios, una fundación y la municipalidad. Voluntarios y fundación registran la construcción dentro de sus propios alcances, mientras que la municipalidad tiene un paso de entrega separado.

El donante aporta diez unidades ficticias de material. Se registra un uso de tres unidades para materiales de vivienda contra ese aporte. Un segundo intento de registrar el mismo uso devuelve el recibo existente y deja un solo uso en el registro. La vista del donante sigue los recibos de postulación, asamblea, construcción y uso sin mostrar el alias de la familia. Un verificador puede recalcular el registro y una tercera parte puede reponer el recorrido usando solo los recibos.

Este relato describe la corrida ficticia suministrada. No afirma que una asamblea real haya tomado una decisión, que se haya construido una vivienda ni que haya cambiado de manos dinero alguno.

## Actores, derechos y límites

| Actor | Derecho en el modelo | Límite |
|---|---|---|
| Familia postulante | Presentar una postulación | No tiene autoridad para otorgar permisos; se representa con un alias y una huella |
| Asamblea del comité de vivienda | Evaluar la postulación y otorgar permisos en su acta | Bajo el quorum declarado no puede otorgar |
| Miembros del comité | Firmar como integrantes identificados de la asamblea | Un miembro no puede otorgar por sí solo ni exceder el acta |
| Voluntarios | Registrar construcción autorizada | Se limitan a la acción, el presupuesto en unidades de material, el destino y el vencimiento |
| Fundación | Aportar material y ejecutar su trabajo autorizado | Su tamaño no le da autoridad más allá del permiso |
| Municipalidad | Registrar su paso de entrega autorizado | Actúa solo dentro de su propio permiso |
| Donante | Aportar y seguir el recorrido de recibos | Ve el recorrido registrado, no a la familia |
| Verificador | Recalcular lo que respalda el registro suministrado | Comprueba ese registro; no establece la verdad del mundo real |

## Reglas de permisos

Cada permiso identifica una acción, un tope en unidades de material, un destino y un vencimiento. También registra las firmas requeridas y quién puede pausar el trabajo. El acuerdo trata esos límites como parte de la autoridad, no como notas opcionales.

Delegar puede reducir un permiso, pero no ampliar su acción, presupuesto ni plazo. El permiso no puede trasladarse a otra vivienda ni reactivarse después del vencimiento. Un intento de exceder el presupuesto restante, actuar en otro destino, avanzar sin el acta autorizante o trabajar después del vencimiento vuelve bloqueado, con una razón y una salida. La familia no puede firmar en lugar de la asamblea.

Una donación debe tener aportante registrado para poder seguir su uso. Repetir la misma donación o el mismo uso devuelve el recibo existente en vez de crear un duplicado. El registro familiar tiene un esquema de campos cerrado; rechaza los campos que no están declarados. Una auditoría de recibos revisa el contenido y la cadena de huellas, mientras un verificador independiente recalcula desde el registro sin depender del resumen de quien ejecutó.

## El registro local

Cada paso agrega un recibo sellado a un archivo JSONL. Cada línea lleva la huella de la línea anterior, así que cambiar una línea previa rompe la cadena. El recorrido suministrado se puede leer con cualquier editor de texto y dice que los recibos permiten reponerlo sin Casa Firme.

```text
Postulación (alias)
        |
        v
Acta y quorum de la asamblea del comité
        |
        +--> permiso acotado --> voluntarios --> recibo de construcción
        +--> permiso acotado --> fundación --> recibo de construcción
        +--> permiso acotado --> municipalidad --> recibo de entrega
        |
        v
Recibo de donación --> uso registrado --> cadena local --> vista del donante
                                                        |
                                 recálculo independiente y continuidad
```

El registro es local y sintético. El recorrido no usa red, pagos ni un servicio de terceros participante. El anclaje del recibo está en `pending`; la verificación y continuidad de los recibos se muestran sobre el registro local, y la prueba de conocimiento cero está simulada.

## Qué aporta el núcleo

Casa Firme usa del núcleo de Vespi la autoridad acotada, la compuerta de aprobación humana identificada, los recibos de operación, la verificación y la continuidad desde recibos. El proyecto aporta el modelo de dominio que el núcleo no define: el acta como origen de autoridad, las reglas de quorum y membresía, los pasos de vivienda y donación, el esquema cerrado de la familia y el registro local encadenado. La copia consumida del núcleo está fijada a un commit y se comprueba con los digests declarados de sus módulos; este proyecto no la modifica.

El acuerdo del proyecto identifica el corte instalado del núcleo como commit `54c20c7`, candidato `0.1.3`. Este recorrido no implementa acceso de emergencia, procedencia de skills ni pagos x402 en vivo. Lore Plugin aporta contexto del proyecto y enrutamiento para los hosts; no es el origen de la autoridad de vivienda ni de las reglas de donación. Este repositorio público documenta esas relaciones, pero no contiene el código fuente de la aplicación para que el lector la ejecute.

## Qué demuestra el recorrido

Los nombres de pruebas suministrados comprueban quorum, autoridad de miembros, límites de permisos, consumo acumulado de presupuesto, vencimiento, destino, donaciones duplicadas, autorización de construcción, campos familiares cerrados, integridad de recibos, alteración de la cadena, recálculo independiente y un recorrido local completo. [Evidencia](EVIDENCE.md) registra el alcance íntegro y los fallos actuales.

Estas comprobaciones son observaciones acotadas sobre datos sintéticos y una corrida local. No establecen elegibilidad familiar, autoridad en el mundo real, cumplimiento legal, privacidad en un despliegue, una donación o construcción efectivas, participación institucional, anclaje externo ni preparación para producción. Este recorrido no reemplaza esas comprobaciones.
