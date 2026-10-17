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
| [0006](0006-actualizacion-de-seguridad-septiembre-2026.md) | Actualizar las dependencias antes de conectar el dominio | Aceptada |
| [0007](0007-altas-seguras-ante-repeticiones-y-fallos.md) | Altas seguras ante repeticiones y fallos | Aceptada |
| [0008](0008-publicar-la-landing-con-altas-en-pausa.md) | Publicar la landing con las altas en pausa | Aceptada |
| [0009](0009-marca-provisional-local.md) | Integrar la marca provisional como recursos locales | Sustituida por 0010 |
| [0010](0010-identidad-tipografica-sin-repetir-logos.md) | Llevar el carácter del logo a la tipografía de la web | Sustituida por 0011 |
| [0011](0011-tipografia-original-y-simbolo-en-iconos.md) | Recuperar la tipografía original y usar el símbolo en los iconos | Aceptada; favicon complementado por 0012 |
| [0012](0012-favicon-transparente.md) | Favicon transparente | Aceptada |
| [0013](0013-consulta-de-filtraciones-sin-guardar-el-correo.md) | Consultar filtraciones sin guardar el correo | Aceptada |
| [0014](0014-resultados-con-estela-y-varias-fuentes.md) | Resultados con Estela y varias fuentes públicas | Aceptada |
| [0015](0015-conversacion-con-estela.md) | La comprobación es una conversación con Estela | Aceptada |
| [0016](0016-safari-ios-no-se-queda-en-blanco.md) | Safari en el iPhone no se queda con la página en blanco | Aceptada |
| [0017](0017-muchas-filtraciones-no-paran-el-chat.md) | Muchas filtraciones no paran el chat | Aceptada |

¿Ves un fallo en alguna decisión? Ábrenos un issue. Que nos corrijan en público es
parte del plan.
