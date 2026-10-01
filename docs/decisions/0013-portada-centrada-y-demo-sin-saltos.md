# ADR 0013 — Portada centrada y demo sin saltos de altura

- **Fecha:** 2026-10-01
- **Estado:** Aceptada
- **Conserva:** identidad «La noche y el amanecer», fuentes originales,
  exportación estática, servicios, noindex y altas en pausa.

## Contexto

JuanPe pide incorporar feedback de diseño: el contenido de la portada queda
demasiado arriba, los botones tienen anchos distintos, el titular domina demasiado
y falta una explicación inicial del producto. La sección del buscador presenta
saltos en el fondo mientras aparecen los resultados.

La demo montaba y desmontaba la barra de escaneo, las filas y su texto final.
Eso cambiaba la altura de la sección y recalculaba el degradado porcentual con
cada resultado, desplazando también el contenido posterior.

## Decisión

Centrar el conjunto de la portada con márgenes verticales simétricos, reducir
el titular con un tamaño fluido y colocar las acciones en columnas iguales.
En pantallas estrechas los botones se apilan y conservan el mismo ancho y alto.
Añadir una explicación breve que presenta el buscador como un producto en
desarrollo. Cambiar «Queremos construir» por «Estamos construyendo» en la ambición.

Mantener en el documento todas las filas y el cierre de la demo desde el primer
render, reservando también el espacio del escaneo y de la pregunta completa.
Animar únicamente opacidad y desplazamiento visual. La altura sigue dependiendo
del contenido real, para adaptarse al ancho disponible y a los saltos de línea.

El HTML inicial muestra la demo completa, sin animación inicial de Motion.
Con JavaScript se reproduce la secuencia al entrar en pantalla. Con movimiento
reducido se presenta el estado final, incluso si la preferencia cambia durante
la secuencia.

## Por qué

Reservar el espacio corrige la causa del salto sin sustituir el degradado ni
renunciar a la aparición progresiva que gustó en el feedback. La portada explica
el proyecto antes de hacer scroll y mantiene la jerarquía visual existente.

## Qué sacrificamos

La tarjeta conserva espacio vacío mientras se escribe la pregunta y aparecen
los resultados. Es deliberado: permite que la página permanezca estable.

## Alternativas descartadas

- Fijar una altura en píxeles para toda la demo: podría recortar texto al ampliar
  la fuente o cambiar el ancho de pantalla.
- Animar la altura: suavizaría el salto, pero seguiría moviendo el degradado y
  las secciones siguientes.
- Quitar la animación: el feedback pide conservarla y corregir su efecto lateral.

## Verificación

`npm ci`, `npm run lint`, las 21 pruebas existentes y `npm run build` completados.
Revisión en la vista previa de Cloudflare en escritorio y a 390 y 320 px, sin
desbordamiento horizontal. Ambos botones comparten dimensiones en cada formato.

Antes y después de mostrar los cuatro resultados, la sección y la tarjeta
mantienen respectivamente 850,5 y 304,5 px en escritorio, y 816 y 324 px en el
móvil de 390 px. El HTML exportado incluye las cuatro filas visibles y conserva
el fallback sin JavaScript y noindex. No se han realizado altas ni envíos reales.
