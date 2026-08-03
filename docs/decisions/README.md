# Registro de decisiones técnicas (ADRs)

En Estela creemos que la confianza no se pide: se enseña el trabajo. Esta carpeta
contiene un **ADR** (*Architecture Decision Record*) por cada decisión técnica
relevante del proyecto: qué decidimos, por qué, qué descartamos y qué precio pagamos
a cambio.

Nuestra regla: **si no sabemos explicar una decisión en lenguaje llano, es que no la
entendemos lo suficiente como para tomarla.**

## Cómo funcionan

- Un archivo por decisión, numerado por orden cronológico.
- Un ADR **nunca se edita** una vez aceptado. Si cambiamos de opinión, escribimos uno
  nuevo que lo reemplaza y lo enlazamos. Así queda el rastro honesto de cómo
  evoluciona el proyecto, incluidos nuestros errores.
- Cada ADR sigue la misma plantilla: Contexto → Decisión → Por qué → Qué
  sacrificamos → Alternativas descartadas.

## Índice

| Nº | Decisión | Estado |
| --- | --- | --- |
| [0001](0001-web-estatica-y-pages-functions.md) | Web estática + una función serverless para la lista de espera | Aceptada |
| [0002](0002-alertas-npm-audit-y-overrides.md) | Cómo tratamos las alertas de seguridad de las dependencias | Aceptada |
| [0003](0003-el-navegador-no-habla-con-terceros.md) | El navegador del visitante no habla con terceros | Aceptada |
| [0004](0004-emails-en-resend-audiences.md) | Los emails de la lista de espera viven en Resend Audiences | Aceptada |
| [0005](0005-cabeceras-de-seguridad-y-csp.md) | Cabeceras de seguridad, y el compromiso de la CSP | Aceptada |

¿Ves un fallo en alguna decisión? Ábrenos un issue. Que nos corrijan en público es
parte del plan.
