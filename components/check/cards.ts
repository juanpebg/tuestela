import type { GuidedBreach, SourceRef } from "@/components/check/types";

const UNKNOWN = "No se detalla qué datos concretos se filtraron";
const UNDATED = "Fecha no indicada";

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

function usableSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return [];
  const sources: SourceRef[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const source = item as Record<string, unknown>;
    const id = clean(source.id, 40);
    const label = clean(source.label, 80);
    if (!id || !label) continue;
    sources.push({ id, label });
    if (sources.length === 4) break;
  }
  return sources;
}

// Una ficha a la que le falte un campo no puede tumbar el chat.
// Si no hay nada que contar, devuelve null y el hilo sigue.
export function usableCard(value: unknown): GuidedBreach | null {
  if (!value || typeof value !== "object") return null;
  const card = value as Record<string, unknown>;
  const title = clean(card.title, 160);
  const leaked: string[] = [];
  const seen = new Set<string>();
  if (Array.isArray(card.leaked)) {
    for (const item of card.leaked) {
      const label = clean(item, 80);
      if (!label || seen.has(label)) continue;
      seen.add(label);
      leaked.push(label);
    }
  }
  if (!title && leaked.length === 0) return null;
  const happened = clean(card.happened, 500);
  const means = clean(card.means, 500);
  const todo = clean(card.todo, 500);
  const note = clean(card.note, 400);
  const domain = clean(card.domain, 253);
  return {
    title: title || "Filtración",
    domain: /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain) ? domain : "",
    date: clean(card.date, 80) || UNDATED,
    leaked: leaked.length > 0 ? leaked : [UNKNOWN],
    note: note || null,
    sources: usableSources(card.sources),
    happened: happened || undefined,
    means: means || undefined,
    todo: todo || undefined,
    group: card.group === "primero" ? "primero" : "tambien",
  };
}

export function fallbackCard(): GuidedBreach {
  return {
    title: "Lo que aparece",
    domain: "",
    date: UNDATED,
    leaked: [UNKNOWN],
    note: null,
    happened: "La lista ha llegado incompleta. El correo sí figura en filtraciones documentadas.",
    means: "No doy por hecho que haya contraseñas.",
    todo: "Un gestor de contraseñas y la verificación en dos pasos cubren el caso general.",
  };
}
