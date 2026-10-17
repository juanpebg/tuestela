# ADR 0017 — Muchas filtraciones no paran el chat

- **Fecha:** 2026-10-17
- **Estado:** Aceptada
- **Complementa:** [ADR 0015](0015-conversacion-con-estela.md)

## Contexto

Con la clave de Have I Been Pwned, `test@example.com` devuelve cientos de
filtraciones. Estela decía «He encontrado 257 filtraciones» y «Te cuento qué
se filtró… por partes», y el hilo se quedaba ahí: sin tarjetas y sin botones.

Esas dos frases salen antes de las fichas, y entre medias hay una pausa. Si
esa pausa no se reanuda, el chat sigue en «consultando» y no hay paso
siguiente. Además, una ficha a la que le falte un campo (o traiga un dato que
no es texto) tira el árbol de React al pintarla: la página entera pasa a
«no ha podido cargar» y se pierde la conversación.

El número, dicho el primero y en alto, también suena a alarma. No hace falta
asustar para contar que hay muchas.

## Decisión

- A partir de 20 filtraciones, la primera frase no dice el número. Dice que
  hay bastantes, que no es culpa de quien pregunta, y que va a enseñar
  primero las que más importan. El número va en la frase siguiente, con la
  promesa de dejar el resto a un lado.
- Con menos de 20, el mensaje sigue diciendo cuántas son.
- El detalle, las dos primeras tarjetas, el aviso de que hay más y los
  botones se publican en el mismo turno. La pausa que viene después solo
  escribe el plan. Si esa pausa no vuelve, las tarjetas y un paso siguiente
  ya están.
- Un temporizador de reserva publica ese mismo bloque si la pausa anterior
  no se reanuda.
- Cada ficha se normaliza antes de entrar en el hilo: listas de texto, título
  y fecha. Si una ficha tira al pintarse, esa burbuja se sustituye y el resto
  del chat sigue.
- Si no queda ni una ficha usable, entra una de reserva para que el hilo no
  se cierre en vacío.
- «Ver todas» añade el resto de una vez y no esconde los botones mientras
  tanto. Recitar cientos de tarjetas con una pausa entre cada una dejaba el
  chat mudo durante minutos.

## Por qué

1. **El fallo se veía justo después de prometer el relato.** Quien lee esas
   dos frases espera tarjetas. Tienen que salir con ellas, no después de otra
   espera.
2. **Un dato mal formado no puede llevarse la conversación.** La página de
   error no explica nada y no deja reintentar desde el hilo.
3. **257 no es una emergencia.** Es un recuento. El primer mensaje puede
   decirlo sin sonar a sirena, y el número sigue estando, un mensaje más
   abajo.

## Qué sacrificamos

- **El plan ya no sale pegado a las tarjetas en el mismo instante.** Se
  escribe después, con sus pausas. Los botones sí están mientras tanto.
- **«Ver todas» deja de contarlas de una en una.** Aparecen juntas. Con
  cientos, el hilo se alarga de golpe; se puede volver arriba.
- **Por debajo de 20 se sigue diciendo el número al principio.** Quien tiene
  dos o tres filtraciones merece oírlas con claridad.

## Alternativas que descartamos

- **Seguir recitando todas las fichas.** El hilo no da para 257 relatos, y
  cualquier fallo a la mitad se queda sin botones.
- **Ocultar el número.** La persona quiere saber cuántas son. Va en la
  segunda frase, no como titular.
- **Tragar el error y mostrar la página de «no ha podido cargar».** Eso es
  justo lo que ya pasaba cuando una ficha venía rota.

## Verificación

`npm test`, `npm run lint` y `npm run build`. Una lista de 257 fichas abre
tarjetas y botones. Una ficha sin datos filtrados no tira la página. El
primer mensaje de esa lista no contiene «He encontrado 257».
