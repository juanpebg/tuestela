// Have I Been Pwned: la fuente principal. La clave llega del entorno y no se
// registra. La URL lleva el correo: tampoco se registra, ni un error de red
// que pudiera incluirla.

import { noBreachView, presentBreaches, type CheckView } from "../breaches";

const HIBP_BREACH_API = "https://haveibeenpwned.com/api/v3/breachedaccount/";
const HIBP_USER_AGENT = "tuestela.es";
const HIBP_TIMEOUT_MS = 10_000;

export type HibpFailure = {
  ok: false;
  status: 400 | 429 | 502;
  retryAfter?: number;
  log: string;
};

export type HibpSuccess = {
  ok: true;
  view: CheckView;
};

export type HibpResult = HibpSuccess | HibpFailure;

function discard(response: Response) {
  try {
    void response.body?.cancel();
  } catch {
    // Si el cuerpo ya no se puede cancelar, seguimos sin leerlo.
  }
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

function breachUrl(email: string): string {
  return `${HIBP_BREACH_API}${encodeURIComponent(email)}?truncateResponse=false&IncludeUnverified=false`;
}

export async function queryHibp(email: string, key: string): Promise<HibpResult> {
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
    return {
      ok: false,
      status: 502,
      log: "HIBP: fallo de red o tiempo de espera agotado.",
    };
  }

  if (upstream.status >= 300 && upstream.status < 400) {
    discard(upstream);
    return { ok: false, status: 502, log: "HIBP: redirección no seguida." };
  }

  if (upstream.status === 404) {
    discard(upstream);
    return { ok: true, view: noBreachView() };
  }

  if (upstream.status === 429) {
    const retryAfter = parseRetryAfter(upstream.headers.get("retry-after"), Date.now());
    discard(upstream);
    return { ok: false, status: 429, retryAfter, log: "HIBP: 429" };
  }

  if (upstream.status === 400) {
    discard(upstream);
    return { ok: false, status: 400, log: "HIBP: 400" };
  }

  if (!upstream.ok) {
    discard(upstream);
    return { ok: false, status: 502, log: `HIBP: ${upstream.status}` };
  }

  let body: unknown;
  try {
    body = await upstream.json();
  } catch {
    return { ok: false, status: 502, log: "HIBP: respuesta ilegible." };
  }

  const view = presentBreaches(body);
  if (!view) {
    return { ok: false, status: 502, log: "HIBP: respuesta inesperada." };
  }
  return { ok: true, view };
}
