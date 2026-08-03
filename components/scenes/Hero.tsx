import Estela from "@/components/Estela";
import NightSky from "@/components/NightSky";
import Sparkle from "@/components/Sparkle";
import { REPO_URL } from "@/lib/site";

// Coreografía secuencial. Al cargar, SOLO el cielo; luego cada pieza espera
// a que la anterior termine. Botones y trazo entran juntos como final
// (CTA_DELAY aquí ≡ DRAW_DELAY en Estela.tsx — mantener en sintonía).
//
// IMPORTANTE: los retardos van SIEMPRE como estilo inline, nunca como clase
// [animation-delay:...]: el atajo `animation:` de animate-reveal se genera
// después en el CSS y resetearía la delay a 0 (bug cazado el 2026-08-03).
const EYEBROW_DELAY = 800;
const BLOOM_DELAY = 2600;
const DIGITAL_DELAY = 4200;
const DIGITAL_STEP = 110;
const CTA_DELAY = 6200;
const CUE_DELAY = 8000;

// "digital" se compone a mano: las íes van sin punto (ı, letra turca) y una
// estrella de 4 puntas ocupa su lugar. Podemos permitírnoslo porque el texto
// real para lectores de pantalla y buscadores vive en el sr-only del h1.
const DIGITAL_LETTERS = ["d", "i", "g", "i", "t", "a", "l"];

export default function Hero() {
  return (
    <section className="night-dawn relative flex min-h-svh flex-col overflow-hidden">
      {/* La noche: estrellas, nebulosas y grano. Scrollea con la escena —
          el espacio se queda aquí, no persigue al visitante. */}
      <NightSky />
      {/* La estela cruza el cielo por detrás del contenido. */}
      <Estela className="absolute inset-0 h-full w-full" />

      {/* pb en svh: empuja el bloque sobre el centro y deja aire abajo,
          invitando a scrollear sin decirlo. */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-[30svh]">
        <h1 className="relative text-center text-cream">
          <span className="sr-only">Descubre tu Estela digital</span>

          <span aria-hidden="true">
            {/* Claro de luna: despega el titular del cielo. Va primero en el
                DOM y las líneas llevan `relative` para pintarse encima. */}
            <span className="absolute left-1/2 top-1/2 h-[200%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(212,169,78,0.12),transparent_70%)]" />

            <span
              className="relative block font-sans text-sm font-medium uppercase tracking-[0.4em] text-cream/70 motion-safe:animate-reveal md:text-lg"
              style={{ animationDelay: `${EYEBROW_DELAY}ms` }}
            >
              Descubre tu
            </span>

            <span className="relative mt-3 block font-serif text-5xl font-semibold leading-none tracking-tight md:mt-5 md:text-8xl lg:text-9xl">
              {/* La palabra vestida con el degradado de su propio trazo. */}
              <span
                className="inline-block bg-gradient-to-r from-[#eacd8e] via-gold to-violet-light bg-clip-text text-transparent motion-safe:animate-bloom"
                style={{ animationDelay: `${BLOOM_DELAY}ms` }}
              >
                Estela
              </span>{" "}
              <span className="inline-block whitespace-nowrap">
                {DIGITAL_LETTERS.map((letter, index) => (
                  <span
                    key={index}
                    className="relative inline-block motion-safe:animate-reveal"
                    style={{
                      animationDelay: `${DIGITAL_DELAY + index * DIGITAL_STEP}ms`,
                    }}
                  >
                    {letter === "i" ? "ı" : letter}
                    {letter === "i" && (
                      <span className="absolute left-1/2 top-[0.08em] -translate-x-1/2">
                        <Sparkle
                          className="size-[0.16em] motion-safe:animate-twinkle"
                          style={{
                            animationDelay: index === 1 ? "5.6s" : "6.4s",
                          }}
                        />
                      </span>
                    )}
                  </span>
                ))}
              </span>
            </span>
          </span>
        </h1>

        {/* Funcionales, no decorativos: fuera del bloque aria-hidden. */}
        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-4 motion-safe:animate-reveal md:mt-16"
          style={{ animationDelay: `${CTA_DELAY}ms` }}
        >
          <a
            href="#waitlist"
            className="rounded-full bg-gold px-7 py-3 font-medium text-[#0b0920] transition-colors hover:bg-[#e8cd8b] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0920]"
          >
            Únete a la lista
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 rounded-full border border-cream/25 px-6 py-3 font-medium text-cream/90 transition-colors hover:border-cream/50 hover:bg-cream/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0920]"
          >
            <GitHubIcon />
            GitHub
          </a>
        </div>
      </div>

      {/* Indicador de scroll: una mini-estela cayendo por una guía + la
          palabra, en el estilo de inscripción del "DESCUBRE TU". Espera a
          que termine la coreografía. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-6 flex justify-center motion-safe:animate-reveal"
        style={{ animationDelay: `${CUE_DELAY}ms` }}
      >
        <div className="flex flex-col items-center gap-2.5">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ink/50">
            Desliza
          </span>
          <span className="relative h-10 w-[2px] overflow-hidden rounded-full bg-ink/15">
            <span className="absolute left-0 top-0 h-2/5 w-full rounded-full bg-gradient-to-b from-gold to-violet motion-safe:animate-scroll-hint" />
          </span>
        </div>
      </div>
    </section>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-5 fill-current" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
