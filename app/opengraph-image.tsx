import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// La tarjeta comparte tipografía y atmósfera con la web. Se genera en build.
export const dynamic = "force-static";
export const alt = "tuEstela — Descubre tu Estela digital. Comprueba tu correo en tuestela.es";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const sourceSerif = await readFile(path.join(process.cwd(), "assets/fonts/SourceSerif4-Semibold.otf"));

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", paddingBottom: 90,
        backgroundColor: "#0b0920", color: "#fdf6e9", fontFamily: "Source Serif 4",
        backgroundImage: "radial-gradient(ellipse at 85% 100%, #49306f 0%, transparent 65%)",
      }}>
        <div style={{ display: "flex", fontSize: 25, letterSpacing: 7, color: "#d5cce7", marginBottom: 26 }}>
          DESCUBRE TU
        </div>
        <div style={{ display: "flex", fontSize: 108, lineHeight: 1.12, letterSpacing: -3, gap: 24 }}>
          <span style={{ color: "#f2a52b" }}>Estela</span><span>digital</span>
        </div>
        <svg width="1200" height="180" viewBox="0 0 1200 180" style={{ position: "absolute", bottom: 60 }}>
          <defs>
            <linearGradient id="trail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f2a52b" />
              <stop offset="100%" stopColor="#b5a1f5" />
            </linearGradient>
          </defs>
          <path d="M-20 65 C220 10 355 155 610 98 S955 8 1220 110" stroke="url(#trail)" strokeWidth="18" opacity="0.14" fill="none" />
          <path d="M-20 65 C220 10 355 155 610 98 S955 8 1220 110" stroke="url(#trail)" strokeWidth="5" fill="none" />
        </svg>
        <div style={{ display: "flex", position: "absolute", bottom: 35, left: 60, fontSize: 23, color: "#d5cce7" }}>tuestela.es</div>
        <div style={{ display: "flex", position: "absolute", bottom: 35, right: 60, fontSize: 23, color: "#d5cce7" }}>Comprueba tu correo</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Source Serif 4", data: sourceSerif, weight: 600, style: "normal" }] },
  );
}
