// POST /api/check — consulta si un correo aparece en filtraciones conocidas.
// Cloudflare Pages publica este archivo en /api/check.
//
// El navegador solo habla con nosotros (ADR 0003). La clave de Have I Been
// Pwned vive en el entorno, nunca en el cliente. No guardamos el correo ni
// lo escribimos en los logs: la URL de salida lo lleva en la ruta y un
// error de fetch podría incluirla. Decisión: ADR 0013.

import { presentBreaches, noBreachView, type CheckView } from "../../lib/breaches";
import { isValidEmail } from "../../lib/validation";

interface Env {
  HIBP_API_KEY?: string;
}

type CheckContext = { request: Request; env: Env };

const HIBP_BREACH_API = "https://haveibeenpwned.com/api/v3/breachedaccount/";
const HIBP_USER_AGENT = "tuestela.es";
const HIBP_TIMEOUT_MS = 10_000;
const BODY_LIMIT = 4_096;

// Por debajo de las 10 consultas/minuto de la suscripción Core 1, para dejar
// margen. El contador vive en esta instancia: no se comparte entre todas las
// de Cloudflare. Si aún así HIBP responde 429, obedecemos retry-after.
export const CHECKS_PER_IP = 5;
export const CHECKS_GLOBAL = 8;
export const CHECK_WINDOW_MS = 60_000;

const MSG_UNCONFIGURED = "El servidor no está configurado todavía.";
const MSG_UNREADABLE = "No hemos podido leer la consulta.";
const MSG_BAD_EMAIL = "Ese email no parece válido.";
const MSG_CONSENT = "Necesitamos que confirmes que compruebas tu propio correo.";
const MSG_UPSTREAM =
  "No hemos podido consultar las filtraciones. Prueba de nuevo en un momento.";

const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];
let cooldownUntil = 0;

function rateLimitMessage(seconds: number): string {
  if (seconds <= 90) {
    const unit = seconds === 1 ? "segundo" : "segundos";
    return `Estamos recibiendo muchas consultas. Vuelve a intentarlo en ${seconds} ${unit}.`;
  }
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  const unit = minutes === 1 ? "minuto" : "minutos";
  return `Estamos recibiendo muchas consultas. Vuelve a intentarlo en ${minutes} ${unit}.`;
}

function prune(times: number[], now: number): number[] {
  const start = now - CHECK_WINDOW_MS;
  return times.filter((at) => at > start);
}

function clientIp(request: Request): string {
  // CF-Connecting-IP lo pone Cloudflare y el visitante no puede falsificarlo
  // en su red. No usamos X-Forwarded-For: ese sí se puede inventar.
  const cf = request.headers.get("cf-connecting-ip")?.trim() ?? "";
  if (cf && cf.length <= 64 && !/[\r\n]/.test(cf)) return cf;
  return "sin-ip";
}

function retryAfterSeconds(oldest: number, now: number): number {
  return Math.max(1, Math.ceil((oldest + CHECK_WINDOW_MS - now) / 1000));
}

// Reserva un hueco. Si no hay, devuelve los segundos de espera y no llama a HIBP.
function reserve(ip: string, now: number): { ok: true } | { ok: false; retryAfter: number } {
  if (now < cooldownUntil) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((cooldownUntil - now) / 1000)),
    };
  }
  const mine = prune(ipHits.get(ip) ?? [], now);
  globalHits = prune(globalHits, now);
  if (mine.length >= CHECKS_PER_IP) {
    ipHits.set(ip, mine);
    return { ok: false, retryAfter: retryAfterSeconds(mine[0], now) };
  }
  if (globalHits.length >= CHECKS_GLOBAL) {
    ipHits.set(ip, mine);
    return { ok: false, retryAfter: retryAfterSeconds(globalHits[0], now) };
  }
  mine.push(now);
  globalHits.push(now);
  ipHits.set(ip, mine);
  if (ipHits.size > 2_000) {
    for (const [key, times] of ipHits) {
      if (prune(times, now).length === 0) ipHits.delete(key);
    }
  }
  return { ok: true };
}

function rememberCooldown(seconds: number, now: number) {
  const until = now + seconds * 1000;
  if (until > cooldownUntil) cooldownUntil = until;
}

function parseRetryAfter(header: string | null, now: number): number {
  if (!header) return 60;
  const trimmed = header.trim();
  if (/^\d+$/.test(trimmed)) {
    return Math.min(3600, Math.max(1, Number(trimmed)));
  }
  const when = Date.parse(trimmed);
  if (Number.isNaN(when)) return 60;
  return Math.min(3600, Math.max(1, Math.ceil((when - now) / 1000)));
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function wantsHtml(request: Request): boolean {
  return (request.headers.get("accept") ?? "").includes("text/html");
}

function jsonHeaders(status: number, retryAfter?: number): Headers {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "x-robots-tag": "noindex, nofollow",
  });
  if (status === 429 && retryAfter !== undefined) {
    headers.set("retry-after", String(retryAfter));
  }
  return headers;
}

function respondJson(status: number, body: unknown, retryAfter?: number): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders(status, retryAfter) });
}

function respondError(html: boolean, status: number, message: string, retryAfter?: number): Response {
  if (!html) {
    return respondJson(status, { ok: false, message }, retryAfter);
  }
  return respondHtml(status, renderMessage(message), retryAfter);
}

function respondHtml(status: number, main: string, retryAfter?: number): Response {
  const headers = new Headers({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "x-robots-tag": "noindex, nofollow",
    "content-security-policy":
      "default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  });
  if (status === 429 && retryAfter !== undefined) {
    headers.set("retry-after", String(retryAfter));
  }
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>tuEstela</title></head><body style="font-family:Georgia,serif;background:#fdf6e9;color:#1e1b4b;max-width:40rem;margin:3rem auto;padding:0 1.25rem;line-height:1.5">${main}${attribution()}<p><a href="/">← Volver a tuEstela</a></p></body></html>`;
  return new Response(html, { status, headers });
}

function attribution(): string {
  return `<p style="margin-top:2rem;font-family:sans-serif;font-size:0.9rem"><a href="https://haveibeenpwned.com">Datos de Have I Been Pwned</a> · licencia <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p>`;
}

function renderMessage(message: string): string {
  return `<h1 style="font-size:1.6rem">No hemos podido completar la consulta</h1><p>${escapeHtml(message)}</p>`;
}

function renderView(view: CheckView): string {
  const breaches = view.breaches
    .map((breach) => {
      const meta = [breach.date, breach.domain].filter(Boolean).join(" · ");
      const leaked = breach.leaked.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      return `<article style="margin:1.5rem 0;padding-top:1rem;border-top:1px solid rgba(30,27,75,0.15)"><h2 style="font-size:1.3rem;margin-bottom:0.25rem">${escapeHtml(breach.title)}</h2><p>${escapeHtml(meta)}</p>${breach.affected ? `<p>${escapeHtml(breach.affected)}</p>` : ""}${breach.note ? `<p>${escapeHtml(breach.note)}</p>` : ""}<h3 style="font-size:1rem">Qué se filtró</h3><ul>${leaked}</ul></article>`;
    })
    .join("");
  const advice = view.advice
    .map(
      (item) =>
        `<section style="margin:1rem 0"><h3 style="font-size:1.05rem;margin-bottom:0.25rem">${escapeHtml(item.label)}</h3><p>${escapeHtml(item.explanation)}</p><p><strong>Qué hacer.</strong> ${escapeHtml(item.recommendation)}</p></section>`,
    )
    .join("");
  const adviceBlock =
    view.advice.length > 0
      ? `<h2 style="font-size:1.4rem;margin-top:2rem">Qué puedes hacer</h2>${advice}`
      : "";
  return `<h1 style="font-size:1.8rem">${escapeHtml(view.summary)}</h1><p>${escapeHtml(view.detail)}</p>${breaches}${adviceBlock}${view.footnote ? `<p>${escapeHtml(view.footnote)}</p>` : ""}`;
}

type Payload = { email: string; consent: boolean };

async function readPayload(request: Request): Promise<Payload | null> {
  const contentType = request.headers.get("content-type") ?? "";
  const declared = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > BODY_LIMIT) return null;
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return null;
  }
  if (raw.length > BODY_LIMIT) return null;
  try {
    if (contentType.includes("application/json")) {
      const data = JSON.parse(raw) as Record<string, unknown>;
      return {
        email: typeof data.email === "string" ? data.email : "",
        consent: data.consent === true,
      };
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = new URLSearchParams(raw);
      const consent = form.get("consent");
      return {
        email: form.get("email") ?? "",
        consent: consent === "on" || consent === "yes",
      };
    }
  } catch {
    return null;
  }
  return null;
}

function configuredKey(env: Env): string | null {
  const key = env.HIBP_API_KEY?.trim() ?? "";
  if (!key || key.length > 200 || /[\r\n]/.test(key)) return null;
  return key;
}

function discard(response: Response) {
  try {
    void response.body?.cancel();
  } catch {
    // Si el cuerpo ya no se puede cancelar, seguimos sin leerlo.
  }
}

function breachUrl(email: string): string {
  const account = encodeURIComponent(email);
  return `${HIBP_BREACH_API}${account}?truncateResponse=false&IncludeUnverified=false`;
}

export async function onRequestPost(context: CheckContext): Promise<Response> {
  const { request, env } = context;
  const html = wantsHtml(request);
  const key = configuredKey(env);
  if (!key) {
    console.error("HIBP: clave ausente o mal formada.");
    return respondError(html, 500, MSG_UNCONFIGURED);
  }

  const payload = await readPayload(request);
  if (!payload) return respondError(html, 400, MSG_UNREADABLE);

  const email = payload.email.trim().toLowerCase();
  if (!isValidEmail(email)) return respondError(html, 400, MSG_BAD_EMAIL);
  if (!payload.consent) return respondError(html, 400, MSG_CONSENT);

  const now = Date.now();
  const slot = reserve(clientIp(request), now);
  if (!slot.ok) {
    return respondError(html, 429, rateLimitMessage(slot.retryAfter), slot.retryAfter);
  }

  // La URL lleva el correo. No registrarla ni registrar el error de red.
  let upstream: Response;
  try {
    upstream = await fetch(breachUrl(email), {
      headers: {
        "hibp-api-key": key,
        "user-agent": HIBP_USER_AGENT,
        accept: "application/json",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(HIBP_TIMEOUT_MS),
    });
  } catch {
    console.error("HIBP: fallo de red o tiempo de espera agotado.");
    return respondError(html, 502, MSG_UPSTREAM);
  }

  if (upstream.status >= 300 && upstream.status < 400) {
    discard(upstream);
    console.error("HIBP: redirección no seguida.");
    return respondError(html, 502, MSG_UPSTREAM);
  }

  if (upstream.status === 404) {
    discard(upstream);
    return respondView(html, noBreachView());
  }

  if (upstream.status === 429) {
    const retryAfter = parseRetryAfter(upstream.headers.get("retry-after"), Date.now());
    discard(upstream);
    rememberCooldown(retryAfter, Date.now());
    console.error("HIBP: 429");
    return respondError(html, 429, rateLimitMessage(retryAfter), retryAfter);
  }

  if (upstream.status === 400) {
    discard(upstream);
    console.error("HIBP: 400");
    return respondError(html, 400, MSG_BAD_EMAIL);
  }

  if (!upstream.ok) {
    console.error(`HIBP: ${upstream.status}`);
    discard(upstream);
    return respondError(html, 502, MSG_UPSTREAM);
  }

  let body: unknown;
  try {
    body = await upstream.json();
  } catch {
    console.error("HIBP: respuesta ilegible.");
    return respondError(html, 502, MSG_UPSTREAM);
  }

  const view = presentBreaches(body);
  if (!view) {
    console.error("HIBP: respuesta inesperada.");
    return respondError(html, 502, MSG_UPSTREAM);
  }
  return respondView(html, view);
}

function respondView(html: boolean, view: CheckView): Response {
  if (html) return respondHtml(200, renderView(view));
  return respondJson(200, { ok: true, ...view });
}
