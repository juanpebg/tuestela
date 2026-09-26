# ADR 0010 — Llevar el carácter del logo a la tipografía de la web

- **Fecha:** 2026-09-26
- **Estado:** Aceptada
- **Sustituye:** ADR 0009 en la composición visual y uso de la marca.
- **Conserva:** originales locales, exportación estática, movimiento reducido,
  fallback sin JavaScript y el principio de no contactar con terceros.

## Contexto

JuanPe rechaza la primera integración por resultar forzada, especialmente la
placa crema de la esquina superior izquierda. Aclara que busca trasladar la
tipografía del logo a la web y revisar los iconos, utilizando con criterio las
tres variantes disponibles.

## Decisión

Retirar la cabecera añadida y el logo repetido en el cierre. La primera escena
vuelve a centrarse en el titular y la estela. Conservar únicamente el nombre
original como firma pequeña al pie, sin placa ni retrato.

Sustituir Source Serif 4 en los titulares por **Righteous 400**, alojada en local
mediante `next/font/local`. Sus letras redondeadas, la a de un piso y la barra
inclinada de la e se aproximan al nombre del logo. No sabemos qué fuente produjo
el PNG y no afirmamos que sea idéntica. Source Sans 3 se conserva en textos y
controles por legibilidad. No se sintetizan pesos que Righteous no ofrece.

El titular visual presenta «estela digital» en minúsculas, manteniendo el texto
accesible «Descubre tu Estela digital». La tarjeta social usa la misma fuente,
jerarquía y estela, sin añadir otro logo en una tarjeta dentro de la imagen.

Los iconos se adaptan a su tamaño: estrella de contornos curvos, inspirada en el
logo, para las pestañas pequeñas; retrato de `logo-2.png` sobre crema para el icono
grande de Apple. Los PNG transparentes también vacían el interior de la cara,
por lo que no se colocan sobre el cielo nocturno.

## Por qué

La marca se reconoce en cómo está escrita la página. Separar tipografía de
lectura y tipografía de titulares conserva la claridad del mensaje. Elegir el
recurso por tamaño y función evita repetir el mismo bloque gráfico en todas las
secciones.

El TTF pesa aproximadamente 43 kB y sirve también para generar la imagen social.
Su licencia OFL se conserva junto al archivo. No se añaden dependencias ni
peticiones del visitante a Google.

## Qué sacrificamos

Righteous es una aproximación. Una fuente original o un manual de marca posterior
podrán sustituirla. Su único peso limita variaciones tipográficas, por lo que
la jerarquía utiliza tamaño, espacio y color. El retrato completo no aparece en
las pestañas de 16 px, donde sus detalles perderían lectura.

## Alternativas descartadas

- Volver a colocar la composición completa sobre el hero: repetiría el problema
  señalado por JuanPe.
- Righteous en todo el texto: cansaría en párrafos largos y formularios.
- Baloo o Fredoka como aproximación: sus formas redondeadas comparten el tono,
  pero no el rasgo diagonal de la e que distingue este nombre.

## Verificación

Lint y build estático correctos. Revisado el titular en 1440, 390 y 320 px,
sin desbordamiento horizontal, y las secciones interiores en escritorio.
El HTML exportado conserva el fallback sin JavaScript, los dos noindex y la
pausa de altas. Las únicas imágenes de marca dentro de la página corresponden
a la firma del pie; la fuente se sirve desde el mismo dominio.

## Fuentes

- [Righteous en Google Fonts](https://fonts.google.com/specimen/Righteous).
- [Archivo y licencia originales](https://github.com/google/fonts/tree/main/ofl/righteous).
