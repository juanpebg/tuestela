# tuEstela

**Descubre tu Estela digital.** Ciberseguridad por y para las personas: sin
tecnicismos, sin jerga y sin alarmas.

Queremos construir el mayor buscador de código abierto del planeta para que
conozcas qué se sabe de ti en internet. Esta es la landing: una página
narrativa, un comprobador de filtraciones por correo y una lista de espera,
construida en público desde el primer commit.

Las altas están temporalmente pausadas: la landing muestra «Próximamente» y
`POST /api/waitlist` devuelve 503 sin contactar con Resend. La decisión compartida
vive en `lib/waitlist.ts`; no activar hasta completar privacidad, baja y
configuración de correo. El dominio previsto para esta versión es
`https://tuestela.es`; se conserva el modo noindex.

## Transparencia radical

Este proyecto se explica a sí mismo:

- **[docs/decisions/](docs/decisions/)** — cada decisión técnica relevante
  tiene su registro (ADR) en lenguaje llano: qué elegimos, por qué, qué
  sacrificamos y qué descartamos. Incluidos nuestros errores.
- **[SECURITY.md](SECURITY.md)** — cómo reportarnos una vulnerabilidad, y qué
  nos comprometemos a hacer con ella.
- ¿Ves algo mal hecho? Ábrenos un issue. Que nos corrijan en público es parte
  del plan.

## Arquitectura en una frase

Una web 100 % estática (Next.js con `output: 'export'`, servida por el CDN de
Cloudflare Pages) más **dos funciones con servidor**:

- [functions/api/check.ts](functions/api/check.ts) consulta si un correo aparece
  en filtraciones. La fuente principal es Have I Been Pwned; otras fuentes
  públicas entran por `lib/providers` y, si se consultan, se nombran en la
  tarjeta. No guarda el correo. El navegador no habla con ellos ni ve la clave
  ([ADR 0013](docs/decisions/0013-consulta-de-filtraciones-sin-guardar-el-correo.md),
  [ADR 0014](docs/decisions/0014-resultados-con-estela-y-varias-fuentes.md),
  [ADR 0015](docs/decisions/0015-conversacion-con-estela.md)).
- [functions/api/waitlist.ts](functions/api/waitlist.ts) valida el alta en la
  lista de espera, la registra en Resend y envía el email de bienvenida.

El porqué de la web estática, en el [ADR 0001](docs/decisions/0001-web-estatica-y-pages-functions.md).

Stack: Next.js (App Router) · Tailwind CSS v4 · Motion · Cloudflare Pages ·
Resend · Have I Been Pwned.

## Desarrollo local

Necesitas Node.js 20.9 o superior.

```bash
npm ci
npm run dev        # solo la web, con recarga en caliente → http://localhost:3000
```

Verificación: `npm run lint`, `npm test` y `npm run build`. Las pruebas usan
respuestas simuladas y nunca crean contactos ni envían correos reales.

Para probar también las funciones (build de producción + runtime real de
Cloudflare):

```bash
cp .dev.vars.example .dev.vars   # rellena HIBP_API_KEY para el comprobador
npm run preview                  # → http://localhost:8788
```

`wrangler pages dev` lee `.dev.vars`. Sin `HIBP_API_KEY`, la página carga y
`POST /api/check` responde que el servidor no está configurado. Con las altas
pausadas no hace falta ninguna clave de Resend.

## Variables de entorno

**Nunca hay secretos en este repositorio.** En local viven en `.dev.vars`
(gitignoreado); en producción, cifradas en el panel de Cloudflare Pages
(*Settings → Environment variables*).

| Variable | Qué es | Dónde se consigue |
| --- | --- | --- |
| `RESEND_API_KEY` | Clave de la API de Resend (permiso *Full access*) | resend.com → API Keys |
| `RESEND_AUDIENCE_ID` | ID de la audiencia donde se registran las altas | resend.com → Audiences |
| `RESEND_FROM` | Remitente del email de bienvenida, p. ej. `tuEstela <hola@dominio.com>` | Dominio verificado en resend.com → Domains |
| `HIBP_API_KEY` | Clave de Have I Been Pwned para `POST /api/check` | haveibeenpwned.com → API key |
| `XPOSEDORNOT_ENABLED` | Opcional. `true`, `1` o `yes` consulta también XposedOrNot. Apagada por defecto | No pide clave |

Ver [.dev.vars.example](.dev.vars.example) para el detalle de cada una.

### Clave de Have I Been Pwned

La clave no va en el repositorio, ni en el JavaScript de la página, ni en las
pruebas. Solo en el entorno:

1. **Local.** Copia `.dev.vars.example` a `.dev.vars` y sustituye
   `HIBP_API_KEY`. Luego `npm run preview` (`wrangler pages dev`), que lee ese
   archivo. `.dev.vars` está en `.gitignore`.
2. **Cloudflare Pages.** *Settings → Environment variables*. Crea
   `HIBP_API_KEY`, márcala cifrada (*Encrypt*) y actívala en **Production** y
   en **Preview**. Guarda y vuelve a desplegar para que la función la vea.

La suscripción Core 1 permite unas 10 consultas por minuto, compartidas por
toda la web. La función se queda un poco por debajo y, si HIBP responde 429,
enseña una espera y respeta el encabezado `retry-after`.

### Otras fuentes

Have I Been Pwned es la única que se consulta si no se dice lo contrario.
`XPOSEDORNOT_ENABLED` (`true`, `1` o `yes`) añade
[XposedOrNot](https://xposedornot.com), una API pública sin clave. El correo
también sale hacia allí, así que la bandera nace apagada. Solo se llama
después de una respuesta real de HIBP: un límite o un fallo no reenvían el
correo. Si XposedOrNot no contesta, se enseña igual lo que dijo HIBP.

Pwned Passwords (la comprobación de una contraseña por k-anonimato, sin
enviarla entera) no forma parte de esta consulta. El hueco está descrito en
`lib/providers/types.ts` para no mezclarla con el correo.

## Despliegue

Cloudflare Pages conectado a este repositorio:

1. *Workers & Pages → Create → Pages → Connect to Git*.
2. Build command: `npm run build` · Output directory: `out`.
3. Variable de entorno `NODE_VERSION` = `22`, más las de la tabla (la de HIBP,
   cifrada, en Production y en Preview).
4. La carpeta `functions/` se convierte automáticamente en `/api/waitlist` y
   `/api/check`. El archivo [public/_headers](public/_headers) aplica las
   cabeceras de seguridad ([ADR 0005](docs/decisions/0005-cabeceras-de-seguridad-y-csp.md)).
   `connect-src 'self'` ya permite que el navegador llame a nuestras funciones
   y a ninguna otra.

## Marca provisional

Los originales y su procedencia están en [assets/brand/](assets/brand/README.md).
Las copias web se sirven desde nuestro dominio y se pueden regenerar con
`node scripts/prepare-brand.mjs`. La integración se explica en el
[ADR 0011](docs/decisions/0011-tipografia-original-y-simbolo-en-iconos.md).

## Licencia

[MIT](LICENSE). Úsalo, apréndelo, copia lo que te sirva.
