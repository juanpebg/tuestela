# ADR 0016 — Safari en el iPhone no se queda con la página en blanco

- **Fecha:** 2026-10-17
- **Estado:** Aceptada
- **Complementa:** ADR 0005. No cambia la CSP ni el resto de cabeceras que aquel
  describe.

## Contexto

Al abrir la preview desde WhatsApp, el iPhone pasa a Safari y la página se
queda en blanco. Puede ocurrir al llegar desde otra app o al volver del login
de Cloudflare Access.

Había dos causas en la propia web:

1. `Cross-Origin-Opener-Policy: same-origin` en `public/_headers`. Esa
   cabecera no está en el ADR 0005. En Safari iOS, una página con esa política
   abierta desde otro origen (el visor de WhatsApp, o la vuelta desde
   `cloudflareaccess.com`) puede no llegar a pintarse. El documento se queda
   en blanco.
2. El JavaScript de Next se compilaba para Safari 16.4. El runtime incluye
   bloques `static {}`, que Safari no entiende hasta iOS 16.4. En 15 y en
   16.0–16.3 el archivo ni siquiera se ejecuta. Si la hidratación falla, React
   puede vaciar el HTML que el servidor ya había pintado. Además, las
   animaciones de entrada usaban `filter` con `animation-fill-mode: both`: si
   la animación no arranca (la página carga mientras Safari pasa a primer
   plano), el texto se queda en opacidad 0.

La web no usa cookies, `localStorage` ni service worker. El modo privado solo
importa si alguna librería toca el almacenamiento: ahí el acceso lanza y, sin
red, puede tumbar el arranque.

## Decisión

- No enviamos `Cross-Origin-Opener-Policy`. La página no abre ventanas que
  haya que aislar.
- El build apunta a Safari 15 e iOS Safari 15, además de los navegadores que
  Next ya cubría, para que el compilador reescriba la sintaxis que iOS 15 no
  lee.
- Un guion en ES5, el primero del `<head>`, añade lo que iOS 15.0–15.3 no
  trae (`Array.prototype.at`, `String.prototype.at`, `Object.hasOwn`) y, si
  `localStorage` o `sessionStorage` lanzan, los sustituye por memoria de la
  pestaña.
- Si hay un error de sintaxis, una excepción al arrancar, el documento se
  queda sin texto o la entrada sigue invisible, ese guion muestra un formulario
  visible: el mismo `POST /api/check`, con la casilla de consentimiento y el
  enlace a la política. Sin JavaScript, el formulario que ya estaba en
  `<noscript>` sigue ahí, y la entrada se muestra en su estado final.
- Las animaciones de entrada ya no animan `filter`.

## Por qué

Queremos que quien abre el enlace desde el móvil vea la página, también con
iOS 15, 16 o 17, y que un fallo de JavaScript no deje la pantalla vacía.

## Qué sacrificamos

Sin COOP, un enlace nuestro abierto con `window.open` comparte contexto de
navegación con quien lo abrió. No tenemos sesión en el navegador, así que el
botín de ese aislamiento era nulo. La entrada del hero ya no se enfoca con
desenfoque: solo aparece y se asienta.

## Alternativas descartadas

- `Cross-Origin-Opener-Policy: same-origin-allow-popups`: en Safari iOS sigue
  asociado a navegaciones en blanco.
- Dejar el objetivo en Safari 16.4 y fiarlo todo al HTML servido: en cuanto
  React hidrata y el archivo no parsea, puede borrar ese HTML.
- Un `<noscript>` solo: no se muestra cuando JavaScript está encendido pero
  roto, que es justo el caso del iPhone.
