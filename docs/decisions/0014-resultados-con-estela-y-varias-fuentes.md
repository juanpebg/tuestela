# ADR 0014 — Resultados con Estela y varias fuentes públicas

- **Fecha:** 2026-10-16
- **Estado:** Aceptada
- **Complementa:** [ADR 0013](0013-consulta-de-filtraciones-sin-guardar-el-correo.md)

## Contexto

La primera versión del comprobador devolvía la lista de Have I Been Pwned
traducida, con el tamaño de la filtración y el consejo por tipo de dato. Para
quien acaba de escribir su correo, eso se lee como un parte: mucho dato, poca
guía. El producto quiere otra cosa. Estela acompaña. Primero se tranquiliza,
luego se explica, y al final queda un plan corto.

Al mismo tiempo, HIBP no tiene por qué ser la única fuente pública. Hace falta
un sitio donde enchufar otra sin reescribir `/api/check` ni enviar el correo a
un segundo sitio por sorpresa.

## Decisión

La respuesta de `POST /api/check` sigue siendo la de HIBP, y además lleva una
capa de guía:

- Estela habla en primera persona (`speech`).
- Cada filtración es una tarjeta: qué pasó, qué datos salieron, qué significa
  y qué haría ella. La fuente va en la tarjeta, sin la URL (el enlace lo pone
  la página, para no meter dominios de terceros en el JSON de la consulta).
- El orden lo marca la relevancia: contraseñas y datos que permiten suplantar
  primero; lo demás, después. El contador de cuentas afectadas no se enseña.
- Siempre hay un plan de tres pasos: gestor de contraseñas, verificación en
  dos pasos y revisar el correo. También con cero filtraciones.
- El vacío se explica: «no apareces en ninguna filtración» no es un
  certificado. El resumen «Buena señal…» se mantiene.

Las fuentes implementan un contrato común (`lib/providers`):

1. **Have I Been Pwned** es la primera y la que decide si la consulta ha
   salido bien. Un 429, un fallo o una respuesta ilegible se quedan ahí: no
   se reenvía el correo.
2. **XposedOrNot** es opcional y viene apagada. Solo corre si
   `XPOSEDORNOT_ENABLED` es `true`, `1` o `yes`, y solo después de una
   respuesta real de HIBP (filtraciones o ninguna). No tiene clave. Si falla,
   se enseña lo de HIBP y se anota que no estaba disponible, sin correo y sin
   URL. Un mismo nombre en las dos fuentes es una tarjeta con las dos
   etiquetas, no dos alarmas.
3. **Pwned Passwords** no entra. Comprueba una contraseña por k-anonimato, no
   un correo. El hueco queda documentado para no colarla en este flujo.

La página, mientras espera, dice qué fuente está mirando. Sin consentimiento
el formulario no se envía: la casilla lo cierra en CSS (también sin
JavaScript) y, con JavaScript, deshabilita el campo. El servidor sigue
exigiéndolo.

No hay rojo de alarma, ni las palabras «peligro» o «hackeado», en esta capa.

## Por qué

1. **Una persona asustada no lee una tabla.** Nombrar la fuente, decir qué
   significa y dejar tres pasos cabe en una pantalla y se puede volver a abrir.
2. **El correo no debe salir dos veces por defecto.** La segunda fuente existe,
   pero hay que encenderla. Quien no lo hace sigue en el contrato del ADR 0013:
   el correo viaja solo a Have I Been Pwned.
3. **El orden por fecha esconde lo útil.** Una filtración vieja con contraseñas
   importa más que un boletín reciente. La traducción de `presentBreaches` no
   cambia; la guía reordena una copia, y los tests de aquella siguen valiendo.
4. **Sin JavaScript el formulario tiene que poder enviarse.** Deshabilitar los
   campos en el HTML inicial los dejaría muertos. La casilla `required` y
   `:has` cierran el campo hasta que se marca.

## Qué sacrificamos

- **Otra copia del correo, si se enciende la bandera.** XposedOrNot lo recibe
  en la ruta, igual que HIBP. Por eso está apagada y, si se enciende, la
  tarjeta lo dice.
- **Menos detalle de la segunda fuente.** Aporta nombres, no clases de dato.
  No inventamos contraseñas que no ha declarado.
- **El contador de cuentas ya no se ve.** Sigue calculándose por si hace falta,
  pero no entra en la página: empuja a comparar tamaños en vez de a actuar.
- **Dos lecturas del mismo hecho.** El resumen de HIBP se conserva y Estela lo
  dice con otras palabras. Preferimos la repetición a quedarnos solo con el
  parte.

## Alternativas que descartamos

- **Llamar a todas las fuentes en paralelo.** Un 429 de HIBP ya nos pide
  parar. Disparar el correo a otro sitio en ese momento empeora la privacidad
  sin mejorar la respuesta.
- **Meter Pwned Passwords en el mismo formulario.** Pide una contraseña, no
  un correo, y mezclarlos enseña mal qué se está comprobando.
- **Pedir la segunda fuente desde el navegador.** Rompe el ADR 0003.
- **Un contador grande y rojo.** Dice poco y asusta antes de explicar.

## Verificación

`node --test tests/check.test.mjs tests/guide.test.mjs tests/sources.test.mjs`
cubre la guía (orden, vacío, fuentes repetidas), el parser de XposedOrNot, que
la bandera apagada no llama, que un 429 no reenvía el correo, y que un fallo
de la segunda fuente no borra la respuesta de HIBP ni escribe el correo en el
log.
