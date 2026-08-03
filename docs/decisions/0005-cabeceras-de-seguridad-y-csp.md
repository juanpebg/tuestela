# ADR 0005 — Cabeceras de seguridad, y el compromiso de la CSP

- **Fecha:** 2026-08-02
- **Estado:** Aceptada

## Contexto

Las cabeceras HTTP de seguridad son lo primero que un auditor (humano o
automático) escanea de una web. Cloudflare Pages permite declararlas en un
archivo `_headers` que viaja con el build (`public/_headers`).

## Decisión

Servimos el sitio con: **CSP** (lista blanca de orígenes: todo debe venir de
nuestro propio dominio), `frame-ancestors 'none'` + `X-Frame-Options: DENY`
(nadie puede embeber la web en un iframe), `X-Content-Type-Options: nosniff`,
`Referrer-Policy: no-referrer` (al salir de nuestra web hacia un enlace, el
navegador no cuenta de dónde vienes — privacidad también a la salida),
`Permissions-Policy` negando cámara/micrófono/geolocalización (no los usamos:
mejor decirlo), y HSTS (HTTPS siempre).

## El compromiso que preferimos contar nosotros

Nuestra CSP incluye `'unsafe-inline'` en scripts y estilos. Traducido: permite
scripts y estilos incrustados en el propio HTML, que una CSP purista prohibiría.

¿Por qué? Next.js arranca la interactividad con scripts incrustados en el HTML
que genera, y las animaciones aplican estilos en línea. Es la limitación
conocida de los sitios Next estáticos. El riesgo que `'unsafe-inline'` habilita
es la inyección de código… en una web **sin sesiones, sin cookies, sin cuentas y
sin datos de usuario en el navegador**: el botín posible es ínfimo. Aun así no
lo maquillamos: está aquí escrito.

**Mejora futura anotada:** sustituir `'unsafe-inline'` de scripts por hashes
generados en el build (una lista de huellas de los scripts legítimos). Si esta
web algún día maneja sesiones, esa mejora pasa de deseable a obligatoria y este
ADR quedará reemplazado.

## Alternativas que descartamos

- **Sin CSP** (lo que hace la mayoría de landings): gratis y cómodo, pero
  renuncia a la defensa estructural y al mensaje.
- **CSP con nonces/hashes desde ya:** exigiría post-procesar cada build. Lo
  valoraremos cuando el contenido del sitio lo justifique.

## Nota

Estas cabeceras aplican a los archivos estáticos. Las respuestas de la función
`/api/waitlist` son JSON puro sin HTML que interpretar, donde estas cabeceras
no tienen efecto útil.
