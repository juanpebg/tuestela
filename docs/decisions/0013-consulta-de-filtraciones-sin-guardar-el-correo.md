# ADR 0013 — Consultar filtraciones sin guardar el correo

- **Fecha:** 2026-10-16
- **Estado:** Aceptada
- **Complementa:** [ADR 0001](0001-web-estatica-y-pages-functions.md) y [ADR 0003](0003-el-navegador-no-habla-con-terceros.md)

## Contexto

La landing explicaba un buscador que todavía no existía: la escena de ambición
enseñaba una animación con resultados inventados. Para la demo hace falta
comprobar un correo de verdad, contra las filtraciones que documenta Have I
Been Pwned.

Esa API exige una clave. Su propia documentación pide no llamarla desde el
navegador, porque la clave quedaría a la vista. El [ADR 0003](0003-el-navegador-no-habla-con-terceros.md)
además prohíbe que la página dispare peticiones a terceros. Y el proyecto no
quiere guardar correos «para luego».

## Decisión

`POST /api/check` (Cloudflare Pages Function, `functions/api/check.ts`) recibe
el correo y un consentimiento explícito («solo compruebo mi propio correo»).
El servidor llama a

`GET https://haveibeenpwned.com/api/v3/breachedaccount/{correo}?truncateResponse=false&IncludeUnverified=false`

con la cabecera `hibp-api-key` leída de `HIBP_API_KEY` y `user-agent: tuestela.es`.
La respuesta se traduce a castellano llano: nombre de la filtración, fecha,
qué salió, y una explicación con un paso concreto por cada tipo de dato.

Reglas que no se negocian:

1. **La clave solo vive en el entorno.** Ni en el código, ni en las pruebas,
   ni en el JavaScript que descarga el visitante. En local, `.dev.vars`. En
   Cloudflare Pages, variable cifrada, en Production y en Preview.
2. **No guardamos el correo y no lo escribimos en logs.** Tampoco la URL de
   salida (lleva el correo en la ruta) ni el cuerpo de un error de red, que
   podría incluirla. La respuesta no lo repite.
3. **El navegador solo llama a `/api/check`.** Sigue valiendo el ADR 0003. No
   cargamos los logotipos de HIBP: serían peticiones a otro dominio. La
   atribución es un enlace, visible, «Datos de Have I Been Pwned», hacia
   haveibeenpwned.com, con la licencia CC BY 4.0.
4. **Sin consentimiento no hay consulta.** El `required` del formulario es
   cortesía; el servidor vuelve a exigirlo.
5. **Límite propio, y el de HIBP.** Como mucho 5 consultas por minuto y por IP
   (`CF-Connecting-IP`, que el visitante no puede falsificar en la red de
   Cloudflare) y 8 por minuto en cada instancia, por debajo de las 10 de la
   suscripción Core 1. Si HIBP responde 429, enseñamos la espera y copiamos
   `retry-after`. Un 404 es «no hay filtraciones», no un fallo.

Solo entran filtraciones verificadas. Las que HIBP marca como sensibles o
retiradas no se enseñan: su API pública tampoco las devuelve. Una lista de
correo comercial se explica como eso, no como un robo de contraseñas.

La web sigue siendo estática. Esta es la segunda función, al lado de la lista
de espera; no sustituye el modelo del ADR 0001.

## Por qué

1. **La clave no puede estar en el navegador.** Quien mirara el JavaScript se
   la llevaría, y con ella las 10 consultas por minuto de todo el mundo.
2. **Privacidad comprobable.** El correo no se apunta. Lo que sí ocurre —Have
   I Been Pwned lo recibe, porque su API lo pide en la ruta— está escrito en
   la propia página, antes del botón.
3. **Lenguaje de persona.** Los nombres de dato de HIBP están en inglés y no
   dicen qué hacer. Traducimos cada uno y dejamos un paso concreto (cambiar
   una contraseña, llamar al banco por su número oficial, no pagar un chantaje).
4. **Atribución.** Los datos son suyos, bajo CC BY 4.0. El crédito se ve
   junto al comprobador, no en un pie de página escondido.

## Qué sacrificamos

- **El correo sale de nuestra casa.** Viaja en la ruta de la petición a HIBP.
  No lo escribimos nosotros, pero no podemos prometer que Cloudflare o HIBP
  no registren esa llamada. Por eso lo decimos en la interfaz, en vez de
  prometer un secreto que esta API no permite.
- **El límite en memoria es de cada instancia**, no de toda la red de
  Cloudflare. Dos instancias pueden sumar más de 8 consultas en un minuto. El
  429 de HIBP es el tope de verdad; lo respetamos para no empeorarlo.
- **No mostramos filtraciones sin verificar.** Hay menos falsas alarmas y
  también menos pistas dudosas.
- **La demo comparte 10 consultas por minuto.** Si mucha gente prueba a la
  vez, verá la espera. Subir de plan es una decisión de producto, no de código.
- HIBP también ofrece una búsqueda por prefijo de hash, que no revela el
  correo entero. No devuelve en la misma llamada el detalle de qué se filtró.
  Esta demo necesita ese detalle, así que usa la búsqueda directa.

## Alternativas que descartamos

- **Llamar a HIBP desde el navegador.** Expone la clave y rompe el ADR 0003.
  Su documentación lo desaconseja.
- **Seguir con la animación de resultados inventados.** No sirve para una
  demo en la que alguien escribe su correo.
- **Guardar las consultas** (aunque sea un rato, aunque sea un hash) para ir
  más rápido o para estadísticas. No hace falta, y abre una caja que habíamos
  dicho que no abriríamos.
- **Enseñar la descripción HTML de HIBP.** Viene en inglés, con enlaces a
  otros sitios, y meter HTML ajeno en la página es un riesgo gratis.

## Verificación

`node --test tests/check.test.mjs tests/breaches.test.mjs` cubre una respuesta
con filtraciones, un 404, un 429 con `retry-after`, otros errores, la clave
ausente, el correo inválido, el límite por IP y que ni los logs ni la
respuesta contienen el correo ni la clave. El catálogo de tipos de dato se
prueba aparte, incluidos contraseñas, teléfonos, direcciones y fechas de
nacimiento.
