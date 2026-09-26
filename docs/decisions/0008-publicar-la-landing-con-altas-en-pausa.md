# ADR 0008 — Publicar la landing con las altas en pausa

- **Fecha:** 2026-09-26
- **Estado:** Aceptada
- **Decisión de producto:** JuanPe elige publicar primero la landing y activar
  la lista de espera después.

## Contexto

La prioridad es disponer de la landing en producción bajo `tuestela.es`.
Quedan pendientes la información de privacidad, la baja, el correo definitivo,
la protección contra abuso y la verificación de la integración de Resend. La
publicación visual puede adelantarse manteniendo cerrada la captación de emails.

## Decisión

La constante `WAITLIST_ENABLED = false`, en `lib/waitlist.ts`, gobierna tanto
la escena pública como el endpoint. Mientras esté desactivada, la web presenta
la lista como próxima y no muestra un formulario para captar direcciones.

`POST /api/waitlist` responde `503` con un aviso neutro, en JSON o HTML según
el cliente. Esta comprobación sucede antes de leer el cuerpo, consultar las
variables de entorno o llamar a Resend. Protege también las llamadas directas y
los formularios que puedan permanecer abiertos de una versión anterior.

La lógica de alta corregida en el ADR 0007 se conserva y prueba por separado.
No introducimos interruptores adicionales ni cambiamos los servicios elegidos,
la exportación estática o el modo noindex.

La URL base de los metadatos y el texto de la imagen social pasan a
`tuestela.es`. El dominio se asociará al proyecto existente de Cloudflare Pages;
no se crea otro alojamiento. La publicación sigue el despliegue automático
de la rama `main` ya configurado en Cloudflare.

## Por qué

Ocultar el formulario por sí solo no impide invocar el endpoint. La pausa
en servidor garantiza que esta versión no crea contactos ni envía bienvenidas,
incluso si tiene credenciales configuradas. Compartir la constante evita que la
interfaz anuncie una disponibilidad distinta de la del servidor.

## Qué sacrificamos

Durante esta primera publicación no se recogen suscripciones. Activarlas
requiere resolver los pendientes de lanzamiento de la lista, cambiar la
constante y publicar una versión nueva; no basta con configurar credenciales.
La pausa se aplica a esta versión, no revoca credenciales ni desactiva los
despliegues históricos. Deben revocarse las claves antiguas expuestas y usar una
clave nueva guardada como Secret antes de reactivar la integración.

## Alternativas descartadas

- Ocultar solo el formulario: deja abierto el endpoint a llamadas directas.
- Eliminar la función o la integración: obligaría a reconstruirlas después.
- Usar distintos indicadores en frontend y servidor: pueden desincronizarse.

## Verificación

`node --test tests/waitlist.test.mjs` comprueba que el endpoint devuelve `503`
en HTML y JSON sin leer datos ni configuración, y que tampoco procesa un alta
válida con credenciales presentes. Las pruebas de lógica activa del ADR 0007
siguen ejecutándose con un sustituto de Resend sin red ni envíos reales.
