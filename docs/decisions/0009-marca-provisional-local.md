# ADR 0009 — Integrar la marca provisional como recursos locales

- **Fecha:** 2026-09-26
- **Estado:** Aceptada
- **Relación:** amplía el ADR 0003 y conserva «La noche y el amanecer».

## Contexto

JuanPe ha cerrado tres logos provisionales y pide adaptar la landing con criterio
autónomo. El dibujo reúne un retrato, una estela lavanda y una estrella ámbar;
el nombre usa una tipografía propia. La página tenía solo una firma tipográfica
en el pie y una tarjeta social crema sin el logo.

## Decisión

Conservar los originales en `assets/brand/`, con su procedencia. Preparar copias
WebP de tamaño acotado para la web y un PNG para componer la imagen social durante
el build. El recorte y la reducción se pueden reproducir con
`node scripts/prepare-brand.mjs`, que usa Sharp ya disponible en el proyecto.
Los archivos de entrega se guardan también: no se añade trabajo ni acceso a Drive
al build de producción.

Un componente compartido presenta la firma en la cabecera, el logo completo en
el cierre y el nombre en el pie. `next/image` utiliza `unoptimized` en estas
copias ya preparadas, con dimensiones explícitas: compatible con exportación
estática y sin saltos por la carga. Todos los recursos se sirven desde el dominio.

Los huecos de cara y cuello son transparentes, por lo que la marca descansa
siempre sobre crema. La firma de cabecera tiene una base crema incluso sobre
la noche. El titular conserva la tipografía editorial de la landing; no intenta
recrear el nombre oficial. Los acentos de interfaz se acercan al ámbar y violeta
del logo sin sustituir las escenas, sus fondos ni la narrativa.

La tarjeta social une noche, fondo crema para la marca y el titular de la landing.
El icono de Apple usa el símbolo. En pestañas de 16–32 px se conserva la estrella
simplificada existente sobre violeta: el retrato completo pierde legibilidad.

## Por qué

Integramos los recursos aprobados en vez de dibujar una nueva interpretación.
El proyecto no depende de enlaces privados de Drive, de optimización en servidor
ni de JavaScript para mostrar la marca. Separar originales de copias pequeñas
permite cambiar los logos cuando dejen de ser provisionales.

## Qué sacrificamos

Los originales son mapas de bits, no vectores. Conservamos su textura y calidad
de origen y evitamos ampliarlos sin límite. El recorte del nombre debe revisarse
si llega otra composición. Una futura versión vectorial podrá sustituir estas
copias sin cambiar el resto de la página.

## Alternativas descartadas

- Rediseñar toda la landing: la paleta y la estela actuales ya son compatibles.
- Dibujar otra mascota o reconstruir el nombre con una fuente parecida: alteraría
  los logos que JuanPe ha cerrado.
- Poner el PNG transparente directamente sobre el cielo: teñiría la cara de oscuro.
- Cargar imágenes de Drive: introduce una dependencia externa y rompe el ADR 0003.

## Verificación

Instalación con `npm ci`, lint sin avisos, build estático y las 21 pruebas
existentes correctas. ESLint excluye `.wrangler/`, que contiene código temporal
de la vista previa y ya estaba excluido de Git.

Revisión visual en escritorio y móvil, con imágenes locales y enlaces de ida
y vuelta entre cabecera y cierre. El HTML exportado contiene los logos y el
fallback sin JavaScript; se conservan las variantes `motion-safe` y no se añaden
animaciones de marca. Siguen presentes las dos medidas de noindex. La función
en la vista previa de Cloudflare devuelve 503 sin datos de prueba ni envíos.
