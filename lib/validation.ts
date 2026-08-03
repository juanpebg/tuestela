// Validación de email compartida entre el formulario (aviso inmediato en el
// navegador) y la función del backend (la validación de verdad — el cliente
// siempre puede saltarse el formulario y llamar al endpoint directamente).
//
// La expresión es deliberadamente sencilla: algo@algo.algo. Validar emails
// con regex exhaustivas es una guerra perdida; la comprobación definitiva
// de que un email existe es que reciba el correo de bienvenida.
export const EMAIL_MAX_LENGTH = 254; // límite del estándar (RFC 5321)

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (email.length === 0 || email.length > EMAIL_MAX_LENGTH) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
