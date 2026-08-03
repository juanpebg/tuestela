import { REPO_URL } from "@/lib/site";

// La despedida de la página: el wordmark firma y dos enlaces discretos
// prueban lo que la web promete. Componente de servidor: cero JS.
const LINKS = [
  { href: REPO_URL, label: "Hecho en abierto — GitHub" },
  { href: `${REPO_URL}/tree/main/docs/decisions`, label: "Nuestras decisiones" },
];

export default function Footer() {
  return (
    <footer className="px-6 pb-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 border-t border-ink/10 pt-8 text-sm sm:flex-row sm:justify-between">
        <p className="font-serif text-lg font-semibold">
          tu<span className="text-brand">Estela</span>
        </p>
        <nav
          aria-label="Enlaces del proyecto"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-ink/60"
        >
          {LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener"
              className="underline decoration-dotted underline-offset-4 transition-colors hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
