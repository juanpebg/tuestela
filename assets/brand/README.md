# Marca provisional · septiembre de 2026

Originales recibidos en `C:/Users/juanp/Desktop/tuestela-logos/`, coincidentes
con los descargados de la carpeta de Drive
[tuestela-logos](https://drive.google.com/drive/folders/1yFTbMflEUa3Vhu_o4uMOoGi3fKME2dkM).
Se conservan sin cambios:

- `logo.png`: composición completa sobre fondo crema.
- `logo-background.png`: composición completa transparente.
- `logo-2.png`: símbolo transparente, sin nombre.

Los píxeles transparentes incluyen cara y cuello. El pie y el icono de Apple
usan fondo crema. El favicon conserva la transparencia por elección de JuanPe.

## Uso en la web

La landing conserva su tipografía original: **Source Serif 4** en titulares y
**Source Sans 3** en párrafos y controles. Las fuentes se sirven desde nuestro
dominio mediante `next/font`; el navegador no contacta con terceros.

El pie combina el personaje de `logo-2.png` y el nombre original como firma
sobre crema. No hay una placa en cabecera ni una repetición del retrato en el
cierre. Por elección de JuanPe, `logo-2.png` también aporta el favicon PNG
transparente de 64 × 64 px y el icono de Apple de 180 × 180 px sobre crema,
ambos sin nombre. La tarjeta social usa
Source Serif 4 y mantiene la composición nocturna y la estela.

`node scripts/prepare-brand.mjs` prepara el símbolo y el nombre para web, el
favicon y el icono de Apple, sin redibujar los PNG. El nombre se recorta de la
franja inferior del archivo
transparente (desde y=900): revisar ese recorte si cambian los originales.
Las copias de entrega se guardan en el repositorio y no requieren acceder a Drive.

La decisión vigente está en el
[ADR 0011](../../docs/decisions/0011-tipografia-original-y-simbolo-en-iconos.md),
complementado por el [ADR 0012](../../docs/decisions/0012-favicon-transparente.md)
para la transparencia del favicon.

No se ha definido una nueva licencia para los logos. Este documento registra
su procedencia y uso provisional en el proyecto.
