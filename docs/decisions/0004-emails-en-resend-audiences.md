# ADR 0004 — Los emails de la lista de espera viven en Resend Audiences

- **Fecha:** 2026-08-02
- **Estado:** Aceptada

## Contexto

La lista de espera necesita tres cosas: guardar cada email, enviar un correo de
bienvenida y, en el futuro, mandar la newsletter. Y una obligación legal nada
trivial: que darse de baja funcione siempre, con un clic (RGPD). Ya usamos
Resend para enviar el correo de bienvenida.

## Decisión

El email se registra como contacto en una **audiencia de Resend** (su gestor de
listas). No mantenemos ninguna base de datos propia: la función de la web hace
dos llamadas al mismo servicio — "alta del contacto" y "envía la bienvenida".

## Por qué

1. **La baja de un clic viene resuelta.** Es la parte legalmente delicada y
   Resend la tiene industrializada en sus envíos de newsletter. Construirla
   nosotros mal sería peor que no tenerla.
2. **Menos piezas.** Sin base de datos propia no hay base de datos propia que
   proteger, migrar ni exponer por error. La superficie de ataque de la lista
   es la de un único proveedor, con el que ya trabajábamos.
3. **El destino natural del dato.** La newsletter saldrá desde Resend: guardar
   los contactos en otro sitio solo añadiría una sincronización que puede
   fallar.

## Qué sacrificamos

- Los emails viven en un tercero (Resend, EE. UU.). Legalmente es la figura
  habitual de "encargado del tratamiento" con contrato DPA, y así lo contamos
  en nuestra política de privacidad — pero es un hecho, no lo escondemos.
- Cierta dependencia del proveedor, mitigada porque Resend permite exportar
  los contactos: si algún día migramos, los datos salen con nosotros.

## Alternativas que descartamos

- **Guardarlos nosotros** (Cloudflare KV o D1) y usar Resend solo para enviar:
  control total del dato a cambio de construir la baja, el borrado y la
  exportación a mano. Tiene sentido cuando el dato es el producto; una lista
  de espera no lo es. Si tuEstela crece, esta decisión se revisará con un
  nuevo ADR.

## Nota sobre abuso

La función que da de alta aplica dos protecciones deliberadas: un honeypot
(campo invisible que delata bots) y bienvenida solo en la primera alta — sin
esto, cualquiera podría reenviar el formulario en bucle para bombardear el
buzón de otra persona. El código está en `functions/api/waitlist.ts`.
