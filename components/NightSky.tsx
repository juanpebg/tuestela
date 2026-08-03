import type { CSSProperties } from "react";
import Sparkle from "@/components/Sparkle";

// Cielo nocturno del hero. Componente de servidor: las estrellas se generan
// en el build y llegan como HTML puro — cero JavaScript. El parpadeo es CSS
// (starlight/twinkle en globals.css), con ritmo propio por estrella.
//
// Generador con SEMILLA FIJA en vez de Math.random(): el mismo cielo en cada
// build. Los builds reproducibles son verificables — y además evita que cada
// build despliegue una página distinta sin haber cambiado el código.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260802); // la semilla: fecha de nacimiento del proyecto

// Posición en %, tamaño en px. Las estrellas viven en el 80% superior y las
// que rozan la franja del amanecer (y > 55) nacen más tenues: la luz del día
// se las va comiendo.
const STARS = Array.from({ length: 110 }, () => {
  const y = +(rand() * 80).toFixed(2);
  const base = +((0.25 + rand() * 0.55) * (y > 55 ? 0.45 : 1)).toFixed(2);
  return {
    x: +(rand() * 100).toFixed(2),
    y,
    size: +(0.8 + rand() * 1.8).toFixed(2),
    base,
    delay: +(rand() * 6).toFixed(2),
    dur: +(2.5 + rand() * 4).toFixed(2),
    gold: rand() < 0.16,
  };
});

// Unas pocas estrellas "protagonistas" con la forma de 4 puntas de la marca.
const BIG_STARS = Array.from({ length: 5 }, () => ({
  x: +(rand() * 96).toFixed(2),
  y: +(rand() * 50).toFixed(2),
  size: +(10 + rand() * 9).toFixed(1),
  delay: +(rand() * 4).toFixed(2),
}));

export default function NightSky() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Nebulosas: los dos colores de la estela, respirando en el cielo. */}
      <div
        className="absolute"
        style={{
          left: "-5%",
          top: "2%",
          width: 620,
          height: 460,
          background:
            "radial-gradient(closest-side, rgba(212, 169, 78, 0.14), transparent 70%)",
        }}
      />
      <div
        className="absolute"
        style={{
          right: "-8%",
          top: "18%",
          width: 720,
          height: 540,
          background:
            "radial-gradient(closest-side, rgba(124, 58, 237, 0.2), transparent 70%)",
        }}
      />
      {/* Vía láctea: una banda diagonal apenas perceptible. */}
      <div
        className="absolute"
        style={{
          left: "-10%",
          top: "12%",
          width: "130%",
          height: 260,
          transform: "rotate(-14deg)",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(245, 239, 223, 0.05), transparent 70%)",
        }}
      />

      {STARS.map(({ x, y, size, base, delay, dur, gold }, i) => (
        <span
          key={i}
          className="absolute rounded-full motion-safe:animate-starlight"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              backgroundColor: gold ? "#e5c37c" : "#f6f0e0",
              opacity: base,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              "--star-min": base,
            } as CSSProperties
          }
        />
      ))}

      {BIG_STARS.map(({ x, y, size, delay }, i) => (
        <span
          key={`big-${i}`}
          className="absolute motion-safe:animate-twinkle"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: +size,
            height: +size,
            animationDelay: `${delay}s`,
          }}
        >
          <Sparkle className="h-full w-full" />
        </span>
      ))}

      {/* El mismo grano de papel que el resto de la página. */}
      <div className="grain" />
    </div>
  );
}
