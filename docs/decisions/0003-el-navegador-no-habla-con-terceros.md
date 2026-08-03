# ADR 0003 — El navegador del visitante no habla con terceros

- **Fecha:** 2026-08-02
- **Estado:** Aceptada

## Contexto

Usamos las tipografías Source Serif 4 y Source Sans 3, publicadas en Google Fonts.
La forma habitual de usarlas es enlazar el CDN de Google: cómodo, pero cada visita
a la web dispara una petición a servidores de Google con la dirección IP del
visitante. Un tribunal alemán (LG München, 2022) ya consideró esa práctica
contraria al RGPD. Para una web de ciberseguridad que promete "tus datos son
tuyos", filtrar la IP de cada visitante a un tercero antes siquiera de pintar la
página sería empezar mintiendo.

## Decisión

**Autoalojamos todo.** Las fuentes se descargan una sola vez durante el build
(`next/font`) y se sirven desde nuestro propio dominio. Y lo elevamos a principio
general: **la web no provoca ninguna petición del navegador a dominios de
terceros** — ni fuentes, ni scripts de CDNs, ni analítica externa.

## Por qué

1. **Privacidad por defecto, no por promesa.** El visitante no tiene que confiar
   en nuestra política de privacidad: su navegador simplemente no contacta con
   nadie más.
2. **Es verificable en 10 segundos.** Abre las herramientas de desarrollo del
   navegador (pestaña Red) o inspecciona la carpeta `out/` del build: todas las
   peticiones van a nuestro dominio. Invitamos a comprobarlo.
3. **El argumento de rendimiento del CDN compartido murió.** Los navegadores
   modernos particionan la caché por sitio web (precisamente por privacidad), así
   que "la fuente ya estará cacheada de otra web" ya no es verdad. Autoalojar es
   además más rápido: mismo dominio, sin conexiones extra.

## Qué sacrificamos

- Las fuentes se actualizan solo cuando reconstruimos la web (irrelevante: las
  tipografías son estables).
- Si algún día queremos analítica, tendrá que ser autoalojada o de primera parte,
  nunca un script de terceros. Asumimos esa restricción con gusto.

## Alternativas que descartamos

- **CDN de Google Fonts:** gratis y cómodo, pero regala la IP de cada visitante.
- **Copiar los `.woff2` a mano al repo:** mismo resultado de privacidad, pero
  `next/font` lo hace por nosotros y además genera una fuente de respaldo con
  métricas ajustadas que evita el "salto" del texto mientras carga.
