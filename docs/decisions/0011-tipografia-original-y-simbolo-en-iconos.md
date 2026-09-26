# ADR 0011 — Recuperar la tipografía original y usar el símbolo en los iconos

- **Fecha:** 2026-09-26
- **Estado:** Aceptada
- **Sustituye:** ADR 0010 en la tipografía y el uso del símbolo.
- **Conserva:** originales y recursos locales, composición nocturna, exportación
  estática, movimiento reducido y fallback sin JavaScript.

## Contexto

Tras revisar la propuesta tipográfica, JuanPe decide recuperar las fuentes
originales de la landing. Pide mantener la firma del pie y añadir el personaje
junto al nombre. Para el favicon elige expresamente `logo-2.png`, la variante
del símbolo sin texto.

## Decisión

Volver a **Source Serif 4** en los titulares y mantener **Source Sans 3** en
textos y controles. Las fuentes se sirven desde nuestro dominio mediante
`next/font`, conservando el principio de que el navegador no contacta con
terceros. Righteous deja de formar parte de la tipografía visible de la web.

El pie combina el personaje de `logo-2.png` con el nombre original, extraído
de `logo-background.png`. Ambos se presentan juntos como firma sobre el fondo
crema, sin recuperar la placa de cabecera ni repetir el logo en el cierre.

El favicon pasa a ser un PNG de **64 × 64 px** generado a partir de
`logo-2.png`, sin nombre. Se compone sobre crema porque la transparencia del
original también vacía la cara y el cuello. El icono de Apple utiliza el mismo
símbolo y fondo en **180 × 180 px**. Se conserva el dibujo original, con los
ajustes de tamaño y espacio necesarios para cada formato.

La tarjeta social vuelve a utilizar **Source Serif 4**, a partir del archivo
local de la fuente, y conserva la composición nocturna y la estela.

Los originales no se modifican. Los derivados se generan con
`node scripts/prepare-brand.mjs` y se guardan en el repositorio para servirlos
desde el mismo dominio. Esta decisión no cambia las altas en pausa, el modo
noindex ni los servicios de la landing.

## Por qué

La tipografía original conserva el tono que JuanPe prefiere para la página.
El personaje y el nombre juntos permiten reconocer la marca en el pie, mientras
que los iconos utilizan la variante del logo elegida expresamente por él.
El fondo crema mantiene visible la cara sin alterar el dibujo.

## Qué sacrificamos

La tipografía de la web ya no intenta reproducir la del nombre dibujado en el
logo. El retrato contiene detalles que pierden definición en las pestañas más
pequeñas; se acepta esta limitación para mantener el símbolo seleccionado.

## Alternativas descartadas

- Mantener Righteous en los titulares: contradice la preferencia actual de
  JuanPe por la tipografía original.
- Mantener la estrella aislada como favicon: JuanPe ha elegido el símbolo
  completo sin texto.
- Dejar el rostro transparente en los iconos: el color de fondo de cada
  dispositivo podría oscurecerlo y alterar su lectura.
