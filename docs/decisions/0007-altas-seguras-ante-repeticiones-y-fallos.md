# ADR 0007 — Altas seguras ante repeticiones y fallos de Resend

- **Fecha:** 2026-09-26
- **Estado:** Aceptada
- **Amplía:** ADR 0004, sin cambiar el proveedor ni la arquitectura estática.

## Contexto

Antes de publicar la landing revisamos el único endpoint con servidor. La
función consultaba si un contacto existía, pero interpretaba cualquier error
como «no existe». Después enviaba siempre un alta con `unsubscribed: false`,
incluso cuando el contacto ya estaba guardado. Dos peticiones simultáneas podían
enviar dos bienvenidas. Las excepciones de red no tenían una respuesta controlada.

## Decisión

1. Si la consulta confirma que el contacto existe, devolver una respuesta neutra
   sin cambiarlo ni reenviarle un correo. Esto también conserva las bajas.
2. Crear un contacto solo cuando la consulta responde `404`. Un error de
   permisos, saturación, servidor o red interrumpe el alta sin hacer escrituras.
3. Acotar cada petición a Resend a diez segundos y responder de forma controlada
   ante errores de red. Los logs solo contienen mensajes genéricos o códigos
   HTTP, nunca el email, la URL de consulta ni el contenido de las excepciones.
4. Enviar la bienvenida con una clave `Idempotency-Key` estable basada en el ID
   del contacto devuelto por Resend, sin incluir la dirección de correo. Dos
   intentos simultáneos del mismo contacto usan la misma clave. La protección
   del proveedor dura **24 horas**, no indefinidamente.
5. Una vez confirmado el alta, un fallo al preparar o enviar la bienvenida no
   convierte el registro en un error. Sin un ID de contacto válido, se omite el
   envío: no se manda un correo que no podamos deduplicar.

## Por qué

Una consulta fallida no prueba que el contacto sea nuevo. Separar ambos casos
evita convertir una avería de Resend en una repetición de correos o un cambio
involuntario de preferencias. La consulta previa evita envíos posteriores y la
idempotencia cubre la ventana de concurrencia entre consultar y crear.

La documentación de [idempotencia de Resend](https://resend.com/docs/dashboard/emails/idempotency-keys)
confirma el uso de la cabecera en `POST /emails`, su duración de 24 horas y la
posibilidad de respuestas `409` durante peticiones concurrentes. Cloudflare
[admite AbortSignal en fetch](https://blog.cloudflare.com/standards-compliant-workers-api/).

## Qué sacrificamos y qué no resuelve

- Un contacto dado de baja no se reactiva rellenando el formulario otra vez.
  Un futuro flujo de reactivación tendrá que comprobar que lo pide su titular.
- Un correo de bienvenida fallido no se reintenta automáticamente. El contacto
  permanece guardado; garantizar la entrega exigiría guardar su estado y diseñar
  reintentos.
- No es una defensa completa contra bots, direcciones inventadas ni altas de
  terceros. Los límites de peticiones y el doble opt-in quedan como decisiones
  separadas. Tampoco sustituye la revisión de privacidad y baja antes de captar
  suscripciones reales.
- Mantenemos los endpoints de Audiences existentes. Resend documenta una
  [migración a Contacts y Segments](https://resend.com/docs/dashboard/segments/migrating-from-audiences-to-segments);
  queda pendiente comprobar el flujo en la cuenta real antes de publicar. Una
  migración de la integración merece su propia decisión y verificación.

## Alternativas descartadas

- Continuar si falla la consulta: arriesga cambios y envíos sin saber el estado.
- Confiar solo en «consultar antes»: no cubre dos peticiones simultáneas.
- Usar el email en la clave: el identificador del contacto ya sirve y evita
  copiar datos personales a otra cabecera.
- Añadir una base de datos o cola ahora: excede esta corrección y cambia las
  decisiones de infraestructura aceptadas.

## Verificación

`node --test tests/waitlist.test.mjs` ejecuta la función real con respuestas de
Resend simuladas, dentro de un entorno sin acceso a red ni a secretos. Cubre
contactos existentes y dados de baja, errores de consulta y alta, concurrencia,
timeouts, fallos al enviar, respuestas malformadas, validación, honeypot y el
formulario sin JavaScript. Las pruebas no crean contactos ni envían correos.
