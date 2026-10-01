# ADR 0014 — Mensaje de portada y contexto de la demo

- **Fecha:** 2026-10-01
- **Estado:** Aceptada
- **Complementa:** ADR 0013; sustituye su distribución inicial de los textos
  entre la portada y la sección de ambición. Conserva sus ajustes de diseño y
  la solución al salto de altura.

## Contexto

Tras revisar los primeros ajustes, JuanPe descarta el cierre «Sin tecnicismos,
sin alarmas» del nuevo párrafo de portada: le resulta genérico y poco natural.
Prefiere la orientación del texto que acompañaba a la animación del buscador.
Decidimos trasladar esa ambición a la portada y dar a la demo una explicación
complementaria. JuanPe aprueba ambos textos al terminar la revisión.

## Decisión

La portada responde a qué estamos construyendo y para qué:

> Estamos construyendo el mayor buscador de código abierto del planeta para que
> conozcas qué se sabe de ti en internet.

La sección de la demo concreta dónde puede estar esa información:

> Tu información está repartida por internet: en perfiles, fotos o listados que
> quizá ni recuerdas. Queremos ayudarte a encontrarla en un solo lugar.

Conservar el énfasis en degradado sobre «encontrarla en un solo lugar» en la
segunda sección. Eliminar la coletilla de la portada y alinear la presentación
del README con el mensaje aprobado.

«El mayor buscador» expresa la ambición del proyecto, no una posición comprobada
frente a otros productos. Esta versión sigue siendo una landing de próximamente,
con altas pausadas y una demo que muestra datos fijos. No implementa un buscador.

## Por qué

La primera pantalla debe explicar el proyecto sin exigir scroll. Al llegar a la
animación, los ejemplos de perfiles, fotos y listados dan contexto a sus filas.
Cada sección aporta algo y el texto evita repetir la misma presentación.

## Qué sacrificamos

El mensaje de portada es más largo que la primera propuesta. Conservamos el ancho
de lectura acotado y los saltos de línea naturales. La expresión «el mayor» es
ambiciosa; no debe reutilizarse como una afirmación sobre capacidades actuales.

## Alternativas descartadas

- Mantener «Sin tecnicismos, sin alarmas»: no aporta información concreta y
  JuanPe rechaza ese tono.
- Repetir la promesa del buscador en ambas secciones: no hace avanzar la
  explicación al recorrer la página.
- Presentar las filas de la demo como resultados de una búsqueda real: el
  producto aún no tiene esa capacidad.

## Verificación

Lint y compilación estática completados después de los textos definitivos.
Comprobado en la vista previa de Cloudflare que ambos párrafos aparecen en sus
secciones. Los ajustes visuales y la estabilidad de la animación se comprobaron
durante el ADR 0013; sus medidas corresponden a aquella revisión, anterior al
cambio final de textos. Las 21 pruebas existentes pasaron en esta sesión con
respuestas simuladas, sin altas ni envíos reales.
