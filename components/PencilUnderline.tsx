"use client";

import { motion, useReducedMotion } from "motion/react";

// Dos pasadas, como un subrayado real hecho a mano: el trazo principal y
// una segunda pasada más corta debajo. La segunda arranca cuando la primera
// casi ha terminado.
const STROKES = [
  { d: "M6 8 C 60 3, 150 2, 246 7", width: 5, delay: 0 },
  { d: "M16 16 C 80 11, 170 10, 234 14", width: 4, delay: 0.45 },
];

export default function PencilUnderline({ draw }: { draw: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      className="js-draw absolute inset-x-0 top-full h-[0.28em] w-full -translate-y-[0.08em]"
      viewBox="0 0 252 20"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {STROKES.map(({ d, width, delay }) => (
        <motion.path
          key={d}
          d={d}
          stroke="var(--color-pencil)"
          strokeWidth={width}
          strokeOpacity={0.9}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: draw ? 1 : 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.5, delay, ease: [0.6, 0.05, 0.4, 1] }
          }
        />
      ))}
    </svg>
  );
}
