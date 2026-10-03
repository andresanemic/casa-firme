# How Casa Firme works

## English

Casa Firme describes a local, fictional journey from a housing application to the recorded use of a donation. The assembly of the housing committee is the source of authority. Every other actor can act only within the permission that assembly grants.

## Actors, rights and limits

| Actor | What they may do in the model | Limit |
|---|---|---|
| Applicant family | Submit an application | Has no authority to grant permissions and is represented only by an alias and a fingerprint |
| Housing committee assembly | Evaluate the application and grant permissions through its minutes | An assembly below its declared quorum cannot grant |
| Committee members | Sign as members of the assembly | A member cannot grant alone or exceed the minutes |
| Volunteers | Build within an authorized scope | Bound by scope, material-unit budget, destination and time limit |
| Foundation | Contribute and execute authorized work | Its size gives it no authority beyond its permission |
| Municipality | Authorize its part of the work | Acts only within its own permission |
| Donor | Contribute and follow the donation through receipts | Sees the receipt trail, not the family |
| Verifier | Recompute what the record supports | Checks the supplied record; does not establish real-world truth |

## One journey

In the supplied fictional record, a family applies using an alias. The first assembly receipt waits for a human decision because one of two required approvals is missing; a later receipt records the act as verified. That act grants separate permissions to volunteers, a foundation and the municipality. The sample then records construction by volunteers and the foundation, a donor contribution of 10 material units, a recorded use of 3 units for housing materials, and a municipal delivery step.

Each permission says what step it covers, how many material units it can use, which home it applies to and when it expires. A delegated permission must fit inside its parent permission. If it tries to expand the scope, budget or time, it is rejected. A permission cannot move to another home or revive after expiry.

The volunteers record construction under the authorization. A donor's contribution is recorded with its contributor so it can be followed through the application and the recorded use. Registering the same donation twice returns the same receipt instead of duplicating it. Each step adds a sealed receipt to a local JSONL record. A verifier recalculates from that record rather than trusting the executor's summary. The donor reads the receipt trail without seeing the family's identity.

```
Application (alias)
        |
        v
Committee assembly minutes and quorum
        |
        +--> scoped permission --> volunteers --> construction record
        +--> scoped permission --> foundation / municipality actions
        |
        v
Donation receipt --> recorded use --> local receipt chain --> donor view
                                                        |
                                                        +--> independent recomputation
```

## Rules the agreement asks the project to enforce

- Authority starts with the assembly minutes, not a person's title.
- No quorum means no grant, and the applicant family does not sign for the assembly.
- A permission must state its scope, material-unit budget, destination and time limit. It also records the required signers and who can pause the work.
- Delegation can narrow a permission but cannot enlarge its scope, budget or time. Construction without the authorizing minutes is rejected.
- A donation without a recorded contributor cannot be used. Repeating the same donation returns the same receipt.
- The record has a closed field schema that rejects undeclared fields. It represents a family only with an alias and fingerprint.
- The verifier recomputes from the record. A report from the executor alone is not enough.
- A step outside its grant returns blocked with a reason and the person who can resolve it.
- Simulated or pending actions must be identified as such. The anchor stays pending; the zero-knowledge proof is simulated.

## What the journey demonstrates

The supplied test output reports checks for quorum, member authority, permission bounds, budget use, expiry, destination, duplicate donations, construction authorization, closed family fields, receipt integrity, record-chain tampering, independent recomputation and a complete local journey. The source run also reports that the JSONL can be read without Casa Firme.

These checks demonstrate behavior of a synthetic local run and its supplied inputs. They do not establish real family eligibility, the truth of an application, privacy in a deployed service, legal compliance, actual construction, actual donation transfer, institutional participation, blockchain anchoring or a production-ready system. The zero-knowledge proof is simulated. No network, payments, testnet or third party are part of this journey. Current suite status and its limits are in [Evidence](EVIDENCE.md).

## Español

Casa Firme describe un recorrido local y ficticio desde una postulación de vivienda hasta el registro del uso de una donación. La asamblea del comité de vivienda es el origen de la autoridad. Los demás actores solo pueden actuar dentro del permiso que la asamblea otorga.

## Actores, derechos y límites

| Actor | Qué puede hacer en el modelo | Límite |
|---|---|---|
| Familia postulante | Presentar una postulación | No tiene autoridad para otorgar permisos y solo se representa con un alias y una huella |
| Asamblea del comité de vivienda | Evaluar la postulación y otorgar permisos mediante su acta | Una asamblea sin el quorum declarado no puede otorgar |
| Miembros del comité | Firmar como integrantes de la asamblea | Ningún miembro puede otorgar por sí solo ni exceder el acta |
| Voluntarios | Construir dentro de un alcance autorizado | Se limitan al alcance, presupuesto en unidades de material, destino y plazo |
| Fundación | Aportar y ejecutar trabajo autorizado | Su tamaño no le da autoridad más allá de su permiso |
| Municipalidad | Autorizar la parte que le corresponde | Actúa solo dentro de su propio permiso |
| Donante | Aportar y seguir la donación mediante recibos | Ve el recorrido de recibos, no a la familia |
| Verificador | Recalcular lo que respalda el registro | Comprueba el registro suministrado; no establece la verdad del mundo real |

## Un recorrido

En el registro ficticio suministrado, una familia postula usando un alias. El primer recibo del acta queda a la espera de una decisión humana porque falta una de las dos aprobaciones requeridas; un recibo posterior registra el acta como verificada. Esa acta otorga permisos distintos a voluntarios, una fundación y la municipalidad. Luego, el ejemplo registra construcción de voluntarios y la fundación, un aporte del donante de 10 unidades de material, un uso registrado de 3 unidades para materiales de vivienda y un paso de entrega municipal.

Cada permiso dice qué paso cubre, cuántas unidades de material puede usar, a qué vivienda se aplica y cuándo vence. Un permiso delegado debe caber dentro del permiso de origen. Si intenta ampliar el alcance, el presupuesto o el plazo, se rechaza. El permiso no puede trasladarse a otra vivienda ni reactivarse después de su vencimiento.

Los voluntarios registran la construcción bajo la autorización. Se registra el aporte del donante junto con quién aportó, para poder seguirlo desde la postulación hasta el uso anotado. Si la misma donación se registra dos veces, se devuelve el mismo recibo en vez de duplicarla. Cada paso agrega un recibo sellado a un registro JSONL local. Un verificador recalcula desde ese registro, sin confiar en el resumen de quien ejecutó. El donante lee el recorrido de recibos sin ver la identidad de la familia.

```
Postulación (alias)
        |
        v
Acta y quorum de la asamblea del comité
        |
        +--> permiso acotado --> voluntarios --> registro de construcción
        +--> permiso acotado --> acciones de fundación / municipalidad
        |
        v
Recibo de donación --> uso registrado --> cadena local de recibos --> vista del donante
                                                               |
                                                               +--> recálculo independiente
```

## Reglas que el acuerdo pide hacer cumplir

- La autoridad empieza en el acta de asamblea, no en el cargo de una persona.
- Sin quorum no hay otorgamiento, y la familia postulante no firma en lugar de la asamblea.
- El permiso debe declarar su alcance, presupuesto en unidades de material, destino y plazo. También registra quiénes deben firmar y quién puede pausar el trabajo.
- Delegar puede reducir un permiso, pero no puede ampliar su alcance, presupuesto ni plazo. Se rechaza la construcción sin el acta que la autoriza.
- No se puede usar una donación sin aportante registrado. Repetir la misma donación devuelve el mismo recibo.
- El registro tiene un esquema de campos cerrado que rechaza campos no declarados. Representa a una familia solo con un alias y una huella.
- El verificador recalcula desde el registro. No basta el informe de quien ejecutó.
- Un paso que excede lo otorgado vuelve como bloqueado, con una razón y la persona que puede resolverlo.
- Las acciones simuladas o pendientes deben identificarse como tales. El anclaje queda pendiente y la prueba de conocimiento cero es simulada.

## Qué demuestra el recorrido

La salida de pruebas suministrada informa comprobaciones de quorum, autoridad de los miembros, límites de permisos, uso de presupuesto, vencimiento, destino, donaciones duplicadas, autorización de construcción, campos cerrados para datos familiares, integridad de recibos, alteración de la cadena, recálculo independiente y un recorrido local completo. La corrida de las fuentes también informa que el JSONL se puede leer sin Casa Firme.

Estas comprobaciones demuestran el comportamiento de un recorrido local sintético y de las entradas suministradas. No establecen la elegibilidad de una familia real, la veracidad de una postulación, la privacidad de un servicio desplegado, cumplimiento legal, construcción efectiva, transferencia real de una donación, participación institucional, anclaje en blockchain ni preparación para producción. La prueba de conocimiento cero está simulada. El recorrido no incluye red, pagos, testnet ni una tercera parte. El estado y los límites actuales de la suite están en [Evidencia](EVIDENCE.md).
