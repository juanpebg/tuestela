import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { CRITICAL_CSS, FALLBACK_HTML, SAFARI_GUARD } from "@/lib/safari-guard";
import "./globals.css";

// next/font descarga las fuentes durante el build y las sirve desde nuestro
// dominio: el navegador del visitante nunca contacta con Google (ADR 0003).
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  // Dominio de la landing; el acceso por pages.dev se conserva en Cloudflare.
  metadataBase: new URL("https://tuestela.es"),
  // MODO SIGILOSO — QUITAR AL LANZAR: accesible por enlace, invisible para
  // buscadores (junto con X-Robots-Tag en public/_headers).
  robots: { index: false, follow: false },
  title: "tuEstela — Descubre tu Estela digital",
  description:
    "Comprueba si tu correo aparece en filtraciones conocidas. Ciberseguridad familiar, sin tecnicismos y sin alarmas.",
  openGraph: {
    title: "tuEstela — Descubre tu Estela digital",
    description:
      "Comprueba si tu correo aparece en filtraciones conocidas. Ciberseguridad familiar, sin tecnicismos y sin alarmas.",
    siteName: "tuEstela",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      // scroll-smooth solo si el sistema no pide movimiento reducido.
      className={`${sourceSerif.variable} ${sourceSans.variable} motion-safe:scroll-smooth`}
    >
      <head>
        {/* Antes que los chunks: en iOS 15–16.3 un static block tira el
            archivo entero, y este guion tiene que estar ya escuchando. */}
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <script id="estela-guard" dangerouslySetInnerHTML={{ __html: SAFARI_GUARD }} />
      </head>
      <body className="bg-cream text-ink font-sans antialiased">
        {/* Sin JavaScript, la entrada y Motion se ven en su estado final.
            El respaldo solo aparece si el guion detecta un fallo. */}
        <noscript>
          <style>{`.js-reveal, .enter { opacity: 1 !important; transform: none !important; filter: none !important; animation: none !important; } .js-draw path { stroke-dasharray: none !important; opacity: 1 !important; }`}</style>
        </noscript>
        <div
          id="estela-respaldo"
          role="region"
          aria-label="Comprobación de respaldo"
          dangerouslySetInnerHTML={{ __html: FALLBACK_HTML }}
        />
        {/* Capa de atmósfera (halos + grano), definida en globals.css. */}
        <div aria-hidden="true" className="backdrop" />
        {children}
      </body>
    </html>
  );
}
