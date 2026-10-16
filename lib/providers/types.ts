// Contrato de una fuente pública de filtraciones.
//
// Have I Been Pwned es la primera. XposedOrNot puede sumarse, apagada por
// defecto, porque su API de correo es pública y no pide clave. Pwned Passwords
// (k-anonimato) comprueba una contraseña sin enviarla entera: no entra en
// esta consulta, que es por correo. Si algún día se añade, será otro
// proveedor y no recibirá el correo.
//
// Ningún proveedor escribe en el log. Devuelve un texto por si el llamador
// quiere registrarlo, ya sin correo y sin URL.

export type SourceId = "hibp" | "xposedornot";

export type SourceRef = {
  id: SourceId;
  label: string;
};
