import { EMPTY_LESSON, LESSONS } from "@/components/check/lessons";

export const INTRO = [
  "Hola. Soy Estela.",
  "Puedo mirar si tu correo aparece en filtraciones que ya están documentadas. Te lo cuento con calma.",
  "No lo guardo. Lo pregunto y lo olvido.",
] as const;

export const ASK_CONSENT = "¿Seguimos? Solo si el correo es tuyo.";
export const PRIVACY_LEAD = "Si quieres el detalle, está en la";
export const PRIVACY_LINK = "política de privacidad";
export const PRIVACY_HREF = "/privacidad";

export const MORE = [
  "La fuente principal es Have I Been Pwned. Nuestro servidor les enseña el correo, porque lo necesitan para buscarlo, y luego yo te explico la respuesta.",
  "Si algún día miro otra fuente pública, te diré cuál en la tarjeta.",
  "Solo miro un correo que sea tuyo. Cuando quieras, seguimos.",
] as const;

export const ASK_EMAIL = "Escríbeme el correo y lo miro.";

export const BAD_EMAIL =
  "Ese correo no me encaja. ¿Lo revisas? Tiene que parecerse a una dirección de verdad.";

export const YES = "Sí, adelante";
export const TELL_MORE = "Cuéntame más";
export const SEE_ALL = "Ver todas";
export const RESTART = "Empezar de nuevo";
export const PLAN_LEAD = "Si quieres, yo haría tres cosas.";
export const ASK_HINT = "Si quieres, pregúntame";
export const ONLINE = "en línea";
export const TYPING = "escribiendo…";

export const SEARCHING = [
  "Estela está buscando en Have I Been Pwned…",
  "Estela está investigando…",
  "Revisando las fuentes públicas…",
] as const;

export const QUESTIONS = [
  { id: "filtracion", label: "¿Qué es una filtración?", answer: LESSONS[0].body },
  { id: "aparecer", label: "¿Qué significa aparecer?", answer: LESSONS[1].body },
  { id: "culpa", label: "¿Por qué no es culpa mía?", answer: LESSONS[2].body },
  { id: "dos-pasos", label: "¿Qué es el 2FA?", answer: LESSONS[3].body },
] as const;

export const EMPTY_FOLLOW = EMPTY_LESSON.body;

export function estelaForError(message: string, rate: boolean): string {
  if (rate || message.includes("muchas consultas")) {
    return "Hay que esperar un momento. No es un fallo tuyo: estamos cuidando el ritmo para no saturar la consulta.";
  }
  if (message.includes("no está configurado")) {
    return "Todavía no puedo mirarlo. Falta configurar el servidor, y prefiero decírtelo a inventar una respuesta.";
  }
  if (message.includes("propio correo")) {
    return "Solo miro un correo si me confirmas que es tuyo.";
  }
  return "No he podido mirarlo ahora. No pasa nada: puedes probar otra vez en un momento.";
}

export function againLine(): string {
  return "Cuando quieras, lo intentamos otra vez.";
}

export function moreLeft(count: number): string {
  if (count === 1) return "Hay otra. Si quieres, te la enseño.";
  return `Hay ${count} más. Si quieres, te las enseño.`;
}
