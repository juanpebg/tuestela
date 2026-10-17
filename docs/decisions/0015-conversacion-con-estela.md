# ADR 0015 — La comprobación es una conversación con Estela

- **Fecha:** 2026-10-16
- **Estado:** Aceptada
- **Complementa:** [ADR 0014](0014-resultados-con-estela-y-varias-fuentes.md)

## Contexto

El comprobador ya explicaba el resultado con calma, en una ficha debajo del
formulario. Quien lo usa reconoce mejor otro ritmo: el de una conversación,
con una persona al otro lado que saluda, pide permiso, escribe y va contando
lo que encuentra.

## Decisión

La escena de comprobar es un chat con Estela.

- Cabecera con su retrato, su nombre y el estado: en línea, escribiendo, o la
  fuente que está mirando.
- Sus mensajes van a la izquierda y los de la persona a la derecha, con la
  hora y unas marcas discretas en los de la persona.
- Primero saluda y dice que no guarda el correo. El permiso es un botón
  («Sí, adelante»). Hasta ese sí, no hay caja para el correo.
- El correo sale como mensaje de quien escribe. Mientras llega la respuesta,
  se ven los tres puntos y el estado va cambiando: Have I Been Pwned, luego
  que sigue mirando, luego las fuentes públicas.
- Cada filtración es una tarjeta dentro del hilo. Si hay más de dos, enseña
  las primeras y deja «Ver todas». Las dudas («¿Qué es una filtración?»,
  «¿Qué es el 2FA?») son botones: al pulsarlos, Estela responde.
- Cierra con tres cosas que ella haría y con «Empezar de nuevo».
- Si no hay filtraciones, si la consulta falla o si hay que esperar, lo dice
  ella, sin alarma.
- Quien entra sin JavaScript sigue teniendo el formulario de siempre, con la
  casilla obligatoria. El servidor no cambia: sin consentimiento no consulta.
- Los textos que se leen en el chat no usan «corto», «breve», «rápido» ni
  «rápidamente».

Las pausas entre burbujas son de menos de un segundo. Si el sistema pide
poco movimiento, no hay pausa ni puntos animados. Los mensajes nuevos se
anuncian con `aria-live`.

La arquitectura de fuentes del ADR 0014 no se toca.

## Por qué

1. **El permiso y el correo se entienden en el orden en que pasan.** Primero
   el sí, después la dirección. No hay un formulario que parezca una
   herramienta antes de que alguien haya dicho que sí.
2. **La espera deja de ser una barra muda.** Se ve que está escribiendo y en
   qué fuente.
3. **Muchas filtraciones no tienen que ocupar la pantalla de golpe.** Dos
   tarjetas y la opción de seguir.
4. **El lenguaje de una persona no suena a plantilla.** Evitamos las palabras
   que delatan un texto generado.

## Qué sacrificamos

- **Sin JavaScript, la conversación no avanza sola.** Queda el formulario
  clásico. La experiencia pensada es la del chat.
- **El hilo crece hacia abajo y la caja de mensajes solo aparece al final
  del permiso.** En un móvil largo hay que bajar un poco. La cabecera y el
  hilo tienen un alto máximo para no perder el hilo de vista.
- **«2FA» en el botón es la palabra que la gente busca**, y la respuesta
  dice «verificación en dos pasos». Preferimos que el botón se reconozca.

## Alternativas que descartamos

- **Dejar el formulario y poner el chat solo en el resultado.** El permiso
  y la espera también son parte de la conversación.
- **Animar cada burbuja aunque la persona pida poco movimiento.** El estado
  se lee igual sin la animación.
- **Mandar varias filtraciones en un solo bloque.** Se pierde el ritmo de
  ir contándolas.

## Verificación

`npm test`, `npm run lint` y `npm run build`. Un repaso de los textos
visibles rechaza «corto», «breve», «rápido» y «rápidamente».
