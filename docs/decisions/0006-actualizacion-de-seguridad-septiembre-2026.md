# ADR 0006 — Actualizar las dependencias antes de conectar el dominio

- **Fecha:** 2026-09-26
- **Estado:** Aceptada
- **Relación:** complementa el ADR 0002; mantiene su criterio de actualización revisada.

## Contexto

Al restaurar el proyecto en Windows, `npm audit` señaló siete paquetes afectados
(seis de severidad alta y uno crítica). La comprobación de agosto no describe
el estado actual: los avisos y las versiones corregidas han cambiado.

Los avisos críticos de Next.js incluyen ejecución de código en servidores Windows
y en la optimización de imágenes AVIF. La producción de tuEstela exporta archivos
estáticos: no ejecuta un servidor Next.js ni ofrece su optimizador de imágenes.
Esto limita la exposición, pero no justifica conservar dependencias vulnerables
en el entorno de desarrollo y compilación.

## Decisión

Actualizar de forma acotada, sin `npm audit fix --force`:

- Next.js y su configuración ESLint: **16.3.6**.
- Wrangler: **4.141.0**, dentro de la misma versión mayor.
- Elevar el mínimo del override de Sharp a **0.35.4**.
- Resolver las dependencias transitivas afectadas a versiones corregidas:
  js-yaml **4.3.2**, nanoid **3.3.19** y undici **7.29.0**.
- Conservar el override de PostCSS; Next.js todavía declara una versión menor
  que la fijada por el proyecto. El archivo de bloqueo conserva **8.5.25**.

El archivo `package-lock.json` fija el árbol completo y `npm ci` lo reproduce.
La actualización no cambia la exportación estática, los proveedores, el diseño
ni las dos medidas de noindex. El resultado de la auditoría se comprueba junto
con lint y build; cero avisos conocidos no equivale a una auditoría completa.

## Por qué

Corregimos los avisos conocidos tanto para el despliegue como para trabajar desde
Windows. Mantener Next.js y eslint-config-next en la misma versión evita una
mezcla innecesaria, y revisar cambios explícitos conserva la trazabilidad.

## Qué sacrificamos

Las dependencias nuevas deben verificarse de nuevo en Cloudflare y en local.
La auditoría depende de los avisos publicados y debe repetirse antes de futuros
despliegues. Los overrides siguen siendo responsabilidad del proyecto.

## Alternativas descartadas

- Mantener las versiones de agosto porque producción sea estática: dejaría el
  entorno de trabajo y compilación sin corregir.
- Actualizar todas las librerías por inercia o usar `--force`: ampliaría el
  cambio sin necesidad para esta tarea.

## Referencias

- [Aviso de Next.js para servidores Windows](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36).
- [Aviso de optimización AVIF](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4).
- [Corrección de Sharp](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c).
- [Publicación de Next.js 16.3.6](https://github.com/vercel/next.js/releases/tag/v16.3.6).
