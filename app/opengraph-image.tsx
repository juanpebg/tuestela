import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Tarjeta social (og:image), generada EN EL BUILD — compatible con el export
// estático. Reproduce la escena del hero: crema, halos, titular y estela.
// La fuente OTF vive en assets/fonts (el motor no lee los woff2 de next/font).

// Obligatorio con `output: export`: declara que la imagen es 100% estática.
export const dynamic = "force-static";

export const alt = "tuEstela — Descubre tu Estela digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Misma geometría STAR de components/Sparkle.tsx, a escala de la tarjeta.
const STAR = "M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z";

const SPARKLES = [
  { x: 210, y: 100, s: 2.2 },
  { x: 560, y: 168, s: 1.6 },
  { x: 860, y: 96, s: 2.8 },
  { x: 1080, y: 150, s: 1.9 },
];

export default async function Image() {
  const sourceSerif = await readFile(
    path.join(process.cwd(), "assets/fonts/SourceSerif4-Semibold.otf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fdf6e9",
          backgroundImage:
            "radial-gradient(700px 400px at 15% 0%, rgba(212,169,78,0.22), transparent 70%), radial-gradient(650px 420px at 90% 100%, rgba(124,58,237,0.16), transparent 70%)",
          fontFamily: "Source Serif 4",
          color: "#1e1b4b",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 92,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          <div style={{ display: "flex" }}>Descubre tu</div>
          <div style={{ display: "flex", gap: 24 }}>
            <span style={{ color: "#4338ca" }}>Estela</span>
            <span>digital</span>
          </div>
        </div>

        <svg
          width="1100"
          height="200"
          viewBox="0 0 1200 220"
          style={{ marginTop: 8 }}
        >
          <defs>
            <linearGradient id="og-estela" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4a94e" stopOpacity="0" />
              <stop offset="15%" stopColor="#d4a94e" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path
            d="M-40 150 C 220 70, 420 200, 640 150 S 980 60, 1240 170"
            stroke="url(#og-estela)"
            strokeWidth="24"
            strokeOpacity="0.16"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-40 150 C 220 70, 420 200, 640 150 S 980 60, 1240 170"
            stroke="url(#og-estela)"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          {SPARKLES.map(({ x, y, s }) => (
            <path
              key={`${x}-${y}`}
              d={STAR}
              transform={`translate(${x}, ${y}) scale(${s})`}
              fill="#d4a94e"
              opacity="0.9"
            />
          ))}
        </svg>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 40,
            fontSize: 30,
            color: "rgba(30, 27, 75, 0.65)",
          }}
        >
          tuestela.pages.dev
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Source Serif 4",
          data: sourceSerif,
          weight: 600,
          style: "normal",
        },
      ],
    },
  );
}
