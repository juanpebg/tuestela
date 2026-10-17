// Elige qué fuentes consultar y devuelve una sola vista.
// Have I Been Pwned va siempre primero. XposedOrNot solo si la bandera está
// encendida y la primera fuente ya ha contestado: un 429 o un fallo no
// reenvían el correo a ningún otro sitio.
//
// Pwned Passwords no tiene sitio aquí: comprueba una contraseña por
// k-anonimato, no un correo. El hueco está en lib/providers/types.ts.

import { compose, type GuidedView } from "../guide";
import { queryHibp } from "./hibp";
import { queryXon, xonEnabled } from "./xposedornot";

export type ConsultFailure = {
  ok: false;
  status: 400 | 429 | 502;
  retryAfter?: number;
  log: string;
};

export type ConsultResult =
  | { ok: true; view: GuidedView; log?: string }
  | ConsultFailure;

export async function consult(
  email: string,
  key: string,
  xonFlag: string | undefined,
): Promise<ConsultResult> {
  const hibp = await queryHibp(email, key);
  if (!hibp.ok) return hibp;

  if (!xonEnabled(xonFlag)) {
    return { ok: true, view: compose(hibp.view) };
  }

  const extra = await queryXon(email);
  if (!extra.ok) {
    return { ok: true, view: compose(hibp.view), log: extra.log };
  }
  return { ok: true, view: compose(hibp.view, extra.names) };
}
