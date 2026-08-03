"use client";

import { motion, useReducedMotion } from "motion/react";
import { STAR } from "@/components/Sparkle";

// Micro-estela de recompensa: un trazo corto que se dibuja una sola vez y
// remata con un destello. Aparece, por ejemplo, al completar el alta.
export default function MicroEstela({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg className={className} viewBox="0 0 200 24" fill="none" aria-hidden="true">
      <defs>
        {/* id propio para no chocar con el gradiente de la estela grande */}
        <linearGradient id="micro-estela" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0" />
          <stop offset="30%" stopColor="var(--color-gold)" />
          <stop offset="100%" stopColor="var(--color-violet)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M4 16 C 60 6, 130 20, 182 10"
        stroke="url(#micro-estela)"
        strokeWidth={3}
        strokeLinecap="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      <motion.path
        d={STAR}
        transform="translate(188, 9) scale(0.55)"
        fill="var(--color-gold)"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      />
    </svg>
  );
}
