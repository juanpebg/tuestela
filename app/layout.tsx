import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
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
  // Al estrenar dominio propio, cambiar aquí la URL base.
  metadataBase: new URL("https://tuestela.pages.dev"),
  // MODO SIGILOSO — QUITAR AL LANZAR: accesible por enlace, invisible para
  // buscadores (junto con X-Robots-Tag en public/_headers).
  robots: { index: false, follow: false },
  title: "tuEstela — Descubre tu Estela digital",
  description:
    "Ciberseguridad familiar sin tecnicismos, sin jerga y sin alarmas. Próximamente.",
  openGraph: {
    title: "tuEstela — Descubre tu Estela digital",
    description:
      "Ciberseguridad familiar sin tecnicismos, sin jerga y sin alarmas. Próximamente.",
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
      <body className="bg-cream text-ink font-sans antialiased">
        {/* Red de seguridad: sin JavaScript, todo lo que anima con Motion
            (.js-reveal, .js-draw) se muestra directamente en su estado final. */}
        <noscript>
          <style>{`.js-reveal { opacity: 1 !important; transform: none !important; filter: none !important; } .js-draw path { stroke-dasharray: none !important; opacity: 1 !important; }`}</style>
        </noscript>
        {/* Capa de atmósfera (halos + grano), definida en globals.css. */}
        <div aria-hidden="true" className="backdrop" />
        {children}
      </body>
    </html>
  );
}
