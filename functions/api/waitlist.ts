// POST /api/waitlist — alta en la lista de espera.
// La otra función con servidor es /api/check (ADR 0013).
// Cloudflare Pages convierte este archivo en endpoint por su posición:
// functions/api/waitlist.ts → /api/waitlist. Exportar onRequestPost lo
// limita al método POST.
//
// Flujo: leer petición → honeypot → validar → alta en Resend Audiences →
// bienvenida (solo la primera vez). Decisiones: ADR 0001 y ADR 0004.

import { isValidEmail } from "../../lib/validation";
import { WAITLIST_ENABLED } from "../../lib/waitlist";

interface Env {
  RESEND_API_KEY: string;
  RESEND_AUDIENCE_ID: string;
  RESEND_FROM: string;
}

const RESEND_API = "https://api.resend.com";
const RESEND_TIMEOUT_MS = 10_000;
const SUCCESS_MESSAGE =
  "¡Hecho! Si es tu primera vez, recibirás una bienvenida en unos minutos.";
const RETRY_MESSAGE =
  "No hemos podido apuntarte. Prueba de nuevo en un momento.";

async function resendRequest(
  path: string,
  init: RequestInit,
): Promise<Response | null> {
  try {
    return await fetch(`${RESEND_API}${path}`, {
      ...init,
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
  } catch {
    // No registrar la excepción: puede contener la URL con el email.
    console.error("Resend: fallo de red o tiempo de espera agotado.");
    return null;
  }
}

type WaitlistContext = { request: Request; env: Env };

// [BORRADOR — el texto definitivo lo redacta Juanpe]
const WELCOME_SUBJECT = "Bienvenido a la lista de espera de tuEstela";
const WELCOME_TEXT = [
  "¡Hola!",
  "",
  "Gracias por querer saber más de tuEstela. Te iremos contando, con total",
  "transparencia, cómo construimos paso a paso el mayor buscador de código",
  "abierto del planeta para que conozcas qué se sabe de ti en internet.",
  "",
  "Puedes darte de baja cuando quieras, con un clic, desde cualquier correo.",
  "",
  "— El equipo de tuEstela",
].join("\n");

type Payload = { email: string; consent: boolean; website: string };

async function readPayload(request: Request): Promise<Payload | null> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const data = (await request.json()) as Record<string, unknown>;
      return {
        email: typeof data.email === "string" ? data.email : "",
        consent: data.consent === true,
        website: typeof data.website === "string" ? data.website : "",
      };
    }
    // Formulario clásico: visitantes sin JavaScript.
    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      return {
        email: String(form.get("email") ?? ""),
        consent: form.get("consent") !== null,
        website: String(form.get("website") ?? ""),
      };
    }
  } catch {
    // Cuerpo ilegible: cae al return null y se responde 400.
  }
  return null;
}

// Hoy todos los mensajes son constantes nuestras, pero se escapan igualmente:
// si mañana un mensaje incluyera algo escrito por el usuario (su email, por
// ejemplo), interpolarlo sin escapar sería un XSS reflejado.
function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// El fetch del formulario espera JSON; un envío sin JavaScript espera HTML.
function respond(wantsHtml: boolean, status: number, message: string): Response {
  if (wantsHtml) {
    return new Response(
      `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>tuEstela</title></head><body style="font-family:sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem"><p>${escapeHtml(message)}</p><p><a href="/">← Volver a tuEstela</a></p></body></html>`,
      { status, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
  return Response.json({ ok: status < 400, message }, { status });
}

export async function onRequestPost(context: WaitlistContext): Promise<Response> {
  // La pausa también protege las llamadas directas y formularios antiguos.
  // No leer configuración, procesar datos ni contactar con Resend en este caso.
  if (!WAITLIST_ENABLED) {
    const wantsHtml = (context.request.headers.get("accept") ?? "").includes(
      "text/html",
    );
    return respond(
      wantsHtml,
      503,
      "La lista de espera todavía no está abierta. Vuelve más adelante.",
    );
  }
  return processWaitlistRequest(context);
}

// La lógica de alta se prueba por separado de la pausa de lanzamiento.
// Cloudflare publica únicamente onRequestPost como handler de esta ruta.
export async function processWaitlistRequest(
  context: WaitlistContext,
): Promise<Response> {
  const { request, env } = context;
  const wantsHtml = (request.headers.get("accept") ?? "").includes("text/html");

  if (!env.RESEND_API_KEY || !env.RESEND_AUDIENCE_ID || !env.RESEND_FROM) {
    // Mejor un error claro que un fallo misterioso si faltan variables.
    return respond(wantsHtml, 500, "El servidor no está configurado todavía.");
  }

  const payload = await readPayload(request);
  if (!payload) {
    return respond(wantsHtml, 400, "No hemos podido leer el formulario.");
  }

  // Honeypot: "website" es invisible para humanos. Si llega relleno es un
  // bot — respondemos "todo bien" sin registrar nada, para no darle pistas.
  if (payload.website !== "") {
    return respond(wantsHtml, 200, SUCCESS_MESSAGE);
  }

  const email = payload.email.trim();
  if (!isValidEmail(email)) {
    return respond(wantsHtml, 400, "Ese email no parece válido.");
  }
  // El `required` del navegador es cortesía; la exigencia real es esta.
  if (!payload.consent) {
    return respond(
      wantsHtml,
      400,
      "Necesitamos tu consentimiento para apuntarte.",
    );
  }

  const auth = {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  };

  // 1) Si ya existe, no sobrescribir sus preferencias de baja ni reenviar
  // la bienvenida. Solo un 404 confirma que debemos crear el contacto.
  const contactsPath = `/audiences/${env.RESEND_AUDIENCE_ID}/contacts`;
  const lookupResponse = await resendRequest(
    `${contactsPath}/${encodeURIComponent(email)}`,
    { headers: auth },
  );
  if (lookupResponse?.ok) {
    return respond(wantsHtml, 200, SUCCESS_MESSAGE);
  }
  if (!lookupResponse || lookupResponse.status !== 404) {
    if (lookupResponse) {
      console.error("Resend consulta fallo:", lookupResponse.status);
    }
    return respond(wantsHtml, 502, RETRY_MESSAGE);
  }

  // 2) Alta del contacto nuevo. No se llega aquí si falló la consulta.
  const createResponse = await resendRequest(contactsPath, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  if (!createResponse?.ok) {
    // Solo el código de estado: en los logs tampoco entran datos personales.
    if (createResponse) {
      console.error("Resend contacts fallo:", createResponse.status);
    }
    return respond(wantsHtml, 502, RETRY_MESSAGE);
  }

  // 3) Dos altas simultáneas pueden haber leído 404. El ID del contacto
  // identifica la misma bienvenida, sin poner el email en la clave.
  // Resend conserva esta protección contra duplicados durante 24 horas.
  try {
    const contact: unknown = await createResponse.json();
    if (
      !contact ||
      typeof contact !== "object" ||
      !("id" in contact) ||
      typeof contact.id !== "string" ||
      !contact.id ||
      contact.id.length > 200
    ) {
      // Sin un ID fiable no enviar un correo que no podamos deduplicar.
      console.error("Resend contacts: respuesta sin identificador válido.");
      return respond(wantsHtml, 200, SUCCESS_MESSAGE);
    }
    const emailResponse = await resendRequest("/emails", {
      method: "POST",
      headers: {
        ...auth,
        "Idempotency-Key": `waitlist-welcome/v1/${contact.id}`,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: [email],
        subject: WELCOME_SUBJECT,
        text: WELCOME_TEXT,
      }),
    });
    if (emailResponse && !emailResponse.ok) {
      // El contacto ya quedó guardado: un fallo en el correo de cortesía no
      // debe contarle al visitante que no está apuntado.
      console.error("Resend emails fallo:", emailResponse.status);
    }
  } catch {
    // Incluye un cuerpo de respuesta ilegible o interrumpido por timeout.
    // El contacto ya está guardado; nunca convertirlo en un error de alta.
    console.error("Resend: no se pudo preparar la bienvenida.");
  }

  return respond(wantsHtml, 200, SUCCESS_MESSAGE);
}
