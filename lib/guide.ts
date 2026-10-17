// Pasa de la ficha cruda a una explicación que se puede leer con calma:
// qué pasó, qué significa y qué haría Estela.
// No cambia el orden ni el texto de presentBreaches; reordena una copia.

import type { BreachCard, CheckView } from "./breaches";
import type { SourceRef } from "./providers/types";

export type PlanStep = {
  title: string;
  text: string;
};

export type GuidedBreach = BreachCard & {
  sources: SourceRef[];
  happened: string;
  means: string;
  todo: string;
  group: "primero" | "tambien";
};

export type GuidedView = Omit<CheckView, "breaches"> & {
  speech: string;
  plan: PlanStep[];
  breaches: GuidedBreach[];
};

const UNKNOWN = "No se detalla qué datos concretos se filtraron";
const UNDATED = "Fecha no indicada";

const EMPTY_SPEECH =
  "No apareces en ninguna filtración de las que he consultado. Vamos a ver qué significa eso: es una buena señal, y no es un certificado de que no exista nada más.";

export const PLAN: PlanStep[] = [
  {
    title: "Un gestor de contraseñas",
    text: "Una distinta en cada servicio. El gestor las recuerda; tú recuerdas la del gestor.",
  },
  {
    title: "Verificación en dos pasos",
    text: "Aunque alguien tenga la contraseña, le falta un código o una aprobación que solo tienes tú.",
  },
  {
    title: "Revisar el correo con calma",
    text: "Si un mensaje urge y pide una clave o un enlace, párate. El servicio no te lo pide así.",
  },
];

const HIBP: SourceRef = { id: "hibp", label: "Have I Been Pwned" };
const XON: SourceRef = { id: "xposedornot", label: "XposedOrNot" };

function cleanName(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 160);
}

function hasPassword(leaked: string[]): boolean {
  return leaked.some((item) => /contraseñ|\bpin\b|llaves de sesión/i.test(item));
}

function isSpam(card: BreachCard): boolean {
  return card.note?.includes("correo comercial") ?? false;
}

function score(card: BreachCard): number {
  const blob = card.leaked.join("\n");
  let value = 0;
  if (hasPassword(card.leaked)) value += 100;
  if (/teléfono|tarjeta|cuenta bancaria|documento|seguridad social|pasaporte|conducir|biométr/i.test(blob)) {
    value += 40;
  }
  const year = Number(card.date.match(/\b(20\d{2})\b/)?.[1] ?? 0);
  if (year >= 2022) value += 15;
  if (isSpam(card)) value -= 50;
  return value;
}

function happened(card: BreachCard, source: string): string {
  if (isSpam(card)) {
    const when = card.date === UNDATED ? "" : ` La fecha orientativa es el ${card.date}.`;
    return `${card.title} es una lista de envíos comerciales que documenta ${source}.${when} No es una filtración de contraseñas.`;
  }
  if (card.note?.includes("programa")) {
    const when = card.date === UNDATED ? "" : ` La fecha orientativa es el ${card.date}.`;
    return `${source} documenta ${card.title}.${when} Salió de un programa en un dispositivo, no de un fallo de la web.`;
  }
  if (card.date === UNDATED) {
    return `${source} documenta una filtración de ${card.title}. No indica cuándo ocurrió. El correo figuraba entre las cuentas.`;
  }
  return `El ${card.date}, ${source} documenta una filtración de ${card.title}. El correo figuraba entre las cuentas.`;
}

function means(card: BreachCard): string {
  if (isSpam(card)) {
    return "En la práctica, pueden escribirte. No significa que tengan tu contraseña.";
  }
  const known = card.leaked.filter((item) => item !== UNKNOWN);
  if (known.length === 0) {
    return "No sabemos qué campos concretos salieron. Aun así, el correo estaba en ese lote. No doy por hecho que haya contraseñas.";
  }
  const list = known.slice(0, 5).join(", ");
  if (hasPassword(known)) {
    return `Salió esto: ${list}. Si esa contraseña se repite en otros sitios, alguien podría probarla allí.`;
  }
  return `Salió esto: ${list}. Con eso pueden escribirte o hacerse pasar por el servicio. No implica, por sí solo, que tengan una contraseña.`;
}

function todo(card: BreachCard): string {
  if (isSpam(card)) {
    return "No cambiaría contraseñas solo por esto. Desconfiaría de mensajes que no esperaba.";
  }
  if (hasPassword(card.leaked)) {
    return "Cambiaría esa contraseña y cualquiera igual en otros sitios. Un gestor ayuda a no repetirlas, y la verificación en dos pasos sirve aunque la clave ya circule.";
  }
  return "Revisaría ese servicio si aún lo uso, activaría la verificación en dos pasos si la ofrece y desconfiaría de mensajes que citen su nombre.";
}

// A partir de aquí el número deja de abrir la conversación: «he encontrado 257»
// suena a alarma, y nadie va a leerlas todas en el hilo.
const MANY = 20;

function foundSpeech(count: number): string {
  if (count >= MANY) {
    return "Vamos a verlo juntos. Hay bastantes, y es más habitual de lo que parece. No es culpa tuya: quien perdió los datos fue el servicio. Te enseño primero las que más importan.";
  }
  const noun = count === 1 ? "una filtración" : `${count} filtraciones`;
  return `Vamos a verlo juntos. He encontrado ${noun}. No es culpa tuya: quien perdió los datos fue el servicio. Te cuento qué pasó y qué haría yo.`;
}

function recount(count: number): { summary: string; detail: string } {
  const noun = count === 1 ? "1 filtración" : `${count} filtraciones`;
  if (count >= MANY) {
    return {
      summary: `Este correo aparece en ${noun}.`,
      detail: `Son ${count} en total. No hace falta mirarlas una a una: te dejo las primeras y el resto, por si quieres verlo.`,
    };
  }
  return {
    summary: `Este correo aparece en ${noun}.`,
    detail: "Cada tarjeta dice qué pasó, qué significa y de qué fuente viene.",
  };
}

function footnoteFor(hibp: CheckView, breaches: GuidedBreach[]): string | null {
  if (hibp.footnote) return hibp.footnote;
  if (breaches.length === 0) return null;
  if (breaches.every((item) => item.date === UNDATED)) {
    return "No todas las fuentes indican la fecha ni el detalle de los datos. Cada tarjeta dice de dónde viene.";
  }
  return "La fecha es orientativa: a menudo la filtración se descubre mucho después.";
}

function primaryLabel(sources: SourceRef[]): string {
  return sources.find((source) => source.id === "hibp")?.label ?? sources[0]?.label ?? "La fuente";
}

export function compose(hibp: CheckView, xonNames: string[] = []): GuidedView {
  const tagged: { card: BreachCard; sources: SourceRef[] }[] = hibp.breaches.map((card) => ({
    card,
    sources: [{ ...HIBP }],
  }));
  const index = new Map(tagged.map((item, position) => [item.card.title.toLowerCase(), position]));

  for (const raw of xonNames) {
    const title = cleanName(raw);
    if (!title) continue;
    const at = index.get(title.toLowerCase());
    if (at !== undefined) {
      const sources = tagged[at].sources;
      if (!sources.some((source) => source.id === XON.id)) sources.push({ ...XON });
      continue;
    }
    index.set(title.toLowerCase(), tagged.length);
    tagged.push({
      card: {
        title,
        domain: "",
        date: UNDATED,
        leaked: [UNKNOWN],
        note: "Esta fuente solo confirma el nombre. No indica qué datos salieron.",
        affected: null,
      },
      sources: [{ ...XON }],
    });
  }

  const ranked = tagged
    .map((item, order) => ({ ...item, score: score(item.card), order }))
    .sort((a, b) => b.score - a.score || a.order - b.order);

  const breaches: GuidedBreach[] = ranked.map((item) => ({
    ...item.card,
    sources: item.sources,
    happened: happened(item.card, primaryLabel(item.sources)),
    means: means(item.card),
    todo: todo(item.card),
    group: item.score >= 40 ? "primero" : "tambien",
  }));

  if (breaches.length === 0) {
    return {
      ...hibp,
      breaches: [],
      speech: EMPTY_SPEECH,
      plan: PLAN,
    };
  }

  const sameList = breaches.length === hibp.breaches.length && hibp.found;
  const copy = sameList ? { summary: hibp.summary, detail: hibp.detail } : recount(breaches.length);

  return {
    found: true,
    summary: copy.summary,
    detail: copy.detail,
    footnote: footnoteFor(hibp, breaches),
    advice: hibp.advice,
    breaches,
    speech: foundSpeech(breaches.length),
    plan: PLAN,
  };
}
