import BreachCheck from "@/components/BreachCheck";
import Sparkle from "@/components/Sparkle";

// Primera pieza real del buscador: un correo, una consulta, ninguna copia
// guardada. El formulario también funciona sin JavaScript (POST clásico).
export default function Comprobar() {
  return (
    <section
      id="comprobar"
      className="relative flex flex-col items-center px-6 pt-28 pb-24 md:pt-36 md:pb-32"
    >
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-brand">
          <Sparkle className="size-4 motion-safe:animate-twinkle" />
          Comprueba tu correo
        </p>
        <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          ¿Aparece en alguna filtración?
        </h2>
        <p className="mt-3 text-lg text-ink/80">
          Estela mira si este correo está en filtraciones ya documentadas y te
          lo explica con calma. No lo guardamos: lo preguntamos y lo olvidamos.
        </p>

        <details className="group mt-6 w-full text-left text-sm text-ink/80">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-ink/70 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            <Sparkle className="size-3.5 transition-transform duration-300 group-open:rotate-45" />
            ¿Qué pasa con mi correo?
          </summary>
          <ul className="mt-3 ml-[5px] list-none space-y-2 border-l-2 border-gold/40 pl-5">
            <li>No lo guardamos ni lo apuntamos en nuestros registros.</li>
            <li>
              Nuestro servidor se lo pregunta a Have I Been Pwned y te enseña la
              respuesta. Ellos reciben el correo, porque lo necesitan para
              buscarlo. Si consultamos otra fuente pública, la tarjeta dice
              cuál.
            </li>
            <li>Solo debes comprobar un correo que sea tuyo. Sin esa casilla, el formulario no se envía.</li>
          </ul>
        </details>

        <BreachCheck />

        <noscript>
          <form action="/api/check" method="post" className="check-form mt-8 flex w-full flex-col gap-4 text-left">
            <label htmlFor="check-email" className="text-sm font-medium">
              Tu correo
              <input
                id="check-email"
                name="email"
                type="email"
                required
                maxLength={254}
                className="mt-2 w-full border-b-2 border-ink/20 bg-transparent px-1 py-3 text-lg"
              />
            </label>
            <label htmlFor="check-consent" className="flex items-start gap-3 text-sm">
              <input id="check-consent" name="consent" type="checkbox" value="yes" required className="checkbox-estela mt-0.5" />
              <span>Solo compruebo mi propio correo.</span>
            </label>
            <p className="consent-hint text-sm text-ink/55">Para comprobar, confirma que el correo es tuyo.</p>
            <button id="check-submit" type="submit" className="w-fit rounded-full bg-gold px-7 py-3 font-medium text-[#0b0920]">
              Comprobar
            </button>
          </form>
        </noscript>

        <p className="mt-8 text-sm text-ink/60">
          <a
            href="https://haveibeenpwned.com"
            target="_blank"
            rel="noopener"
            className="underline decoration-dotted underline-offset-4 transition-colors hover:text-ink"
          >
            Datos de Have I Been Pwned
          </a>{" "}
          · licencia{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener"
            className="underline decoration-dotted underline-offset-4 transition-colors hover:text-ink"
          >
            CC BY 4.0
          </a>
        </p>
      </div>
    </section>
  );
}
