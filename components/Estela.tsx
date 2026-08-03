"use client";

import { motion, useReducedMotion } from "motion/react";
import { STAR } from "@/components/Sparkle";

// El trazo entra A LA VEZ que los botones, cerrando juntos la coreografía
// (≡ CTA_DELAY en Hero.tsx — mantener en sintonía).
const DRAW_DELAY = 6.2;
const DRAW_DURATION = 2.2;

// La ruta vuela por la franja y 390-630: bajo el bloque del titular y los
// botones, rozando el inicio del amanecer al salir.
const PATH = "M-60 470 C 240 390, 430 610, 720 530 S 1160 420, 1520 630";

// Tres trazos superpuestos sobre la misma ruta, de fondo a frente:
// halo difuminado (luz), trazo principal y núcleo brillante (energía).
const LAYERS = [
  { width: 34, opacity: 0.3, blur: true, light: false },
  { width: 12, opacity: 0.9, blur: false, light: false },
  { width: 3.5, opacity: 0.95, blur: false, light: true },
];

// Polvo de estela: cada destello aparece cuando el trazo pasa a su altura
// (los retardos siguen el avance del dibujado, de izquierda a derecha).
const SPARKLES = [
  { x: 180, y: 458, scale: 0.8, delay: 7.2 },
  { x: 250, y: 440, scale: 1.0, delay: 7.3 },
  { x: 430, y: 520, scale: 0.7, delay: 7.55 },
  { x: 520, y: 542, scale: 1.1, delay: 7.7 },
  { x: 700, y: 535, scale: 1.4, delay: 8.0 },
  { x: 860, y: 505, scale: 0.8, delay: 8.15 },
  { x: 1000, y: 480, scale: 1.7, delay: 8.3 },
  { x: 1180, y: 498, scale: 0.9, delay: 8.55 },
  { x: 1330, y: 550, scale: 1.5, delay: 8.8 },
];

export default function Estela({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      // js-draw: sin JavaScript, el noscript del layout muestra el trazo
      // completo en vez del estado inicial invisible de Motion.
      className={`js-draw ${className ?? ""}`}
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* La cola nace transparente y el color gana cuerpo hacia el frente:
            el rastro de algo que ya pasó. */}
        <linearGradient id="estela-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0" />
          <stop offset="14%" stopColor="var(--color-gold)" stopOpacity="0.9" />
          {/* Violeta claro: el oscuro se fundiría con el cielo nocturno. */}
          <stop offset="100%" stopColor="var(--color-violet-light)" />
        </linearGradient>
        <linearGradient id="estela-luz" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fffaf0" stopOpacity="0" />
          <stop offset="18%" stopColor="#fffaf0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fffaf0" stopOpacity="0.9" />
        </linearGradient>
        <filter id="estela-blur" x="-30%" y="-150%" width="160%" height="400%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {LAYERS.map(({ width, opacity, blur, light }) => (
        <motion.path
          key={width}
          d={PATH}
          stroke={light ? "url(#estela-luz)" : "url(#estela-gradient)"}
          strokeWidth={width}
          strokeOpacity={opacity}
          strokeLinecap="round"
          filter={blur ? "url(#estela-blur)" : undefined}
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            delay: DRAW_DELAY,
            duration: DRAW_DURATION,
            ease: [0.65, 0, 0.35, 1],
          }}
        />
      ))}

      {SPARKLES.map(({ x, y, scale, delay }) => (
        <motion.path
          key={`${x}-${y}`}
          d={STAR}
          fill="var(--color-gold)"
          transform={`translate(${x}, ${y}) scale(${scale})`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={
            reduceMotion ? { opacity: 0.7 } : { opacity: [0, 1, 0.35, 1, 0.35] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  delay,
                  duration: 3.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </svg>
  );
}
