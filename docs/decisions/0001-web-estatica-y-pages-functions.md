# ADR 0001 — Web estática + una función serverless para la lista de espera

- **Fecha:** 2026-08-02
- **Estado:** Aceptada

## Contexto

La primera versión de tuEstela es una landing de "próximamente": una página
narrativa con animaciones y un único formulario (la lista de espera). No hay
usuarios, ni sesiones, ni contenido que cambie por visitante. La web se despliega en
Cloudflare Pages y el código es público.

## Decisión

Generamos la web como **archivos estáticos** (Next.js con `output: 'export'`): el
build produce HTML, CSS y JavaScript planos que Cloudflare sirve desde su CDN. La
única pieza con lógica de servidor es el endpoint de la lista de espera, una
**Cloudflare Pages Function** (`functions/api/waitlist.ts`) que valida el email,
lo registra y envía el correo de bienvenida.

## Por qué

1. **Menos superficie de ataque.** En una web estática no hay ningún servidor
   nuestro ejecutando código en cada visita: no hay servidor que comprometer, ni
   base de datos expuesta, ni sesiones que robar. Todo el riesgo se concentra en
   una única función de ~100 líneas, que cualquiera puede auditar en este repo.
2. **Honestidad estructural.** El modelo mental es explicable en una frase: "una
   web estática y una función". Para un proyecto que promete transparencia
   radical, que la arquitectura sea comprensible es un requisito, no un lujo.
3. **Velocidad y coste.** Servir archivos desde un CDN es lo más rápido y barato
   que existe. Sin servidores que mantener, parchear o pagar.
4. **Puerta abierta.** La propia documentación de Next.js plantea el export
   estático como "empieza estático, mejora después": si Estela crece y necesita
   servidor, el camino de vuelta existe sin reescribir.

## Qué sacrificamos

- Las funciones de servidor de Next.js (SSR, route handlers, middleware,
  optimización de imágenes en tiempo real). No las necesitamos: ninguna página es
  dinámica.
- El backend vive en `functions/`, fuera de la convención de Next.js. Es el precio
  de encajar en el modelo de Cloudflare Pages sin capas intermedias.

## Alternativas que descartamos

- **Next.js "completo" sobre Cloudflare** (adaptadores como `@opennextjs/cloudflare`):
  permite usar todo el framework, pero añade una capa de build compleja y más
  piezas en producción para unas capacidades que esta landing no usa. Más
  complejidad sin beneficio = más superficie de fallo.
