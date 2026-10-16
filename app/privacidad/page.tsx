import type { Metadata } from "next";
import Link from "next/link";
import { REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad — tuEstela",
  description:
    "Qué datos usa la comprobación de tuEstela: solo el correo para consultar, sin guardarlo, preguntando a Have I Been Pwned.",
};

const linkClass =
  "font-medium text-brand underline decoration-2 underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function Privacidad() {
  return (
    <main className="relative mx-auto w-full max-w-2xl px-6 py-16 md:py-24">
      <Link href="/#comprobar" className={linkClass}>
        Volver a la conversación
      </Link>
      <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-balance">
        Política de privacidad
      </h1>
      <p className="mt-4 text-lg text-ink/80">
        Esto es lo que pasa cuando le pides a Estela que mire un correo.
      </p>

      <h2 className="mt-10 font-serif text-2xl font-semibold">Qué datos se usan</h2>
      <p className="mt-3 text-pretty text-ink/85 leading-relaxed">
        Solo el correo que escribes, y solo para consultar si aparece en
        filtraciones ya documentadas. No pedimos tu nombre, tu teléfono ni tu
        contraseña. Sin tu sí —que el correo es tuyo— no hay consulta.
      </p>

      <h2 className="mt-10 font-serif text-2xl font-semibold">No lo guardamos</h2>
      <p className="mt-3 text-pretty text-ink/85 leading-relaxed">
        No guardamos el correo. No lo apuntamos en registros, no lo repetimos
        en la respuesta y no lo usamos para escribirte. Lo preguntamos y lo
        olvidamos. Para no saturar la consulta, contamos durante un minuto
        cuántas veces se pregunta desde la misma conexión. Ese recuento no se
        guarda y no va unido al correo.
      </p>

      <h2 className="mt-10 font-serif text-2xl font-semibold">Qué fuentes se consultan</h2>
      <p className="mt-3 text-pretty text-ink/85 leading-relaxed">
        Nuestro servidor se lo enseña a{" "}
        <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
          Have I Been Pwned
        </a>
        , porque ellos lo necesitan para buscarlo. La respuesta te la cuenta
        Estela. Si algún día consultamos otra fuente pública, la tarjeta dirá
        cuál.
      </p>
      <p className="mt-3 text-sm text-ink/60">
        <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
          Datos de Have I Been Pwned
        </a>{" "}
        · licencia{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          CC BY 4.0
        </a>
      </p>

      <h2 className="mt-10 font-serif text-2xl font-semibold">Contacto</h2>
      <p className="mt-3 text-pretty text-ink/85 leading-relaxed">
        Si quieres preguntarnos algo sobre esto, escríbenos en{" "}
        <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className={linkClass}>
          GitHub
        </a>
        .
      </p>
      <p className="mt-3 text-pretty text-ink/85 leading-relaxed">
        La lista de espera de esta web está en pausa y no recoge correos.
      </p>
      <p className="mt-8 text-sm text-ink/50">16 de octubre de 2026</p>
    </main>
  );
}
