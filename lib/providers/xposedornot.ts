// XposedOrNot: API pública de filtraciones por correo, sin clave.
// Solo se llama si XPOSEDORNOT_ENABLED está encendida y Have I Been Pwned ya
// ha contestado (200 o 404). Un fallo de aquí no tumba la consulta principal.
// La URL lleva el correo: no se registra.

const XON_API = "https://api.xposedornot.com/v1/check-email/";
const XON_USER_AGENT = "tuestela.es";
const XON_TIMEOUT_MS = 8_000;

export type XonResult = { ok: true; names: string[] } | { ok: false; log: string };

export function xonEnabled(value: string | undefined): boolean {
  return /^(1|true|yes)$/i.test((value ?? "").trim());
}

// null: cuerpo inesperado. Lista vacía: no hay nombres (también un 404 lógico).
export function namesFromXon(body: unknown): string[] | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.Error === "string" || typeof record.error === "string") return [];
  const breaches = record.breaches ?? record.Breaches;
  if (breaches == null) return [];
  if (!Array.isArray(breaches)) return null;
  const names: string[] = [];
  const visit = (item: unknown) => {
    if (typeof item === "string") {
      names.push(item);
      return;
    }
    if (Array.isArray(item)) {
      for (const nested of item) visit(nested);
    }
  };
  for (const item of breaches) visit(item);
  return names.slice(0, 100);
}

function discard(response: Response) {
  try {
    void response.body?.cancel();
  } catch {
    // Si el cuerpo ya no se puede cancelar, seguimos sin leerlo.
  }
}

export async function queryXon(email: string): Promise<XonResult> {
  let upstream: Response;
  try {
    upstream = await fetch(`${XON_API}${encodeURIComponent(email)}`, {
      headers: {
        "user-agent": XON_USER_AGENT,
        accept: "application/json",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(XON_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, log: "XposedOrNot: no disponible." };
  }

  if (upstream.status === 404) {
    discard(upstream);
    return { ok: true, names: [] };
  }

  if (upstream.status >= 300 && upstream.status < 400) {
    discard(upstream);
    return { ok: false, log: "XposedOrNot: no disponible." };
  }

  if (!upstream.ok) {
    discard(upstream);
    return { ok: false, log: "XposedOrNot: no disponible." };
  }

  let body: unknown;
  try {
    body = await upstream.json();
  } catch {
    return { ok: false, log: "XposedOrNot: no disponible." };
  }

  const names = namesFromXon(body);
  if (!names) return { ok: false, log: "XposedOrNot: no disponible." };
  return { ok: true, names };
}
