# tuEstela

**Descubre tu Estela digital.** Ciberseguridad por y para las personas: sin
tecnicismos, sin jerga y sin alarmas.

Queremos construir el mayor buscador de código abierto del planeta para que
conozcas qué se sabe de ti en internet. Esto es la landing de "próximamente":
una página narrativa con lista de espera, construida en público desde el primer
commit.

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
Cloudflare Pages) más **una única función con servidor**
([functions/api/waitlist.ts](functions/api/waitlist.ts)) que valida el alta en
la lista de espera, la registra en Resend y envía el email de bienvenida.
El porqué, en el [ADR 0001](docs/decisions/0001-web-estatica-y-pages-functions.md).

Stack: Next.js (App Router) · Tailwind CSS v4 · Motion · Cloudflare Pages ·
Resend.

## Desarrollo local

Necesitas Node.js 20.9 o superior.

```bash
npm install
npm run dev        # solo la web, con recarga en caliente → http://localhost:3000
```

Para probar también la función de la lista de espera (build de producción +
runtime real de Cloudflare):

```bash
cp .dev.vars.example .dev.vars   # y rellena tus claves de Resend
npm run preview                  # → http://localhost:8788
```

## Variables de entorno

**Nunca hay secretos en este repositorio.** En local viven en `.dev.vars`
(gitignoreado); en producción, cifradas en el panel de Cloudflare Pages
(*Settings → Environment variables*).

| Variable | Qué es | Dónde se consigue |
| --- | --- | --- |
| `RESEND_API_KEY` | Clave de la API de Resend (permiso *Full access*) | resend.com → API Keys |
| `RESEND_AUDIENCE_ID` | ID de la audiencia donde se registran las altas | resend.com → Audiences |
| `RESEND_FROM` | Remitente del email de bienvenida, p. ej. `tuEstela <hola@dominio.com>` | Dominio verificado en resend.com → Domains |

Ver [.dev.vars.example](.dev.vars.example) para el detalle de cada una.

## Despliegue

Cloudflare Pages conectado a este repositorio:

1. *Workers & Pages → Create → Pages → Connect to Git*.
2. Build command: `npm run build` · Output directory: `out`.
3. Variable de entorno `NODE_VERSION` = `22`, más las tres de la tabla.
4. La carpeta `functions/` se convierte automáticamente en el endpoint
   `/api/waitlist`; el archivo [public/_headers](public/_headers) aplica las
   cabeceras de seguridad ([ADR 0005](docs/decisions/0005-cabeceras-de-seguridad-y-csp.md)).

## Licencia

[MIT](LICENSE). Úsalo, apréndelo, copia lo que te sirva.
