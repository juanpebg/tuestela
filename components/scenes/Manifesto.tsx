"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import PencilUnderline from "@/components/PencilUnderline";

const PHRASES = [
  "Tus datos son tuyos.",
  "Solo tuyos.",
  "De nadie más.",
];

// Estados con nombre (variants): el padre orquesta y cada hijo hereda el
// cambio hidden→visible con un retardo escalonado entre hermanos.
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.4 } },
};

const phrase = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Manifesto() {
  const reduceMotion = useReducedMotion();
  // Memoria del componente: ¿terminó ya de aparecer la última frase?
  // La enciende onAnimationComplete y la lee el subrayado.
  const [underline, setUnderline] = useState(false);

  // Con movimiento reducido no hay secuencia: todo visible y subrayado.
  const isStatic = !!reduceMotion;

  return (
    <section className="relative flex min-h-[65svh] items-center justify-center px-6 py-32 md:py-44">
      <motion.p
        className="max-w-3xl text-center font-serif text-3xl font-semibold leading-snug tracking-tight text-balance md:text-5xl"
        variants={isStatic ? undefined : container}
        initial={isStatic ? undefined : "hidden"}
        whileInView={isStatic ? undefined : "visible"}
        viewport={{ once: true, amount: 0.6 }}
      >
        {PHRASES.map((text, i) => {
          const isLast = i === PHRASES.length - 1;
          return (
            <motion.span
              key={text}
              className="js-reveal block"
              variants={isStatic ? undefined : phrase}
              onAnimationComplete={
                isLast
                  ? (definition) =>
                      definition === "visible" && setUnderline(true)
                  : undefined
              }
            >
              {isLast ? (
                <span className="relative inline-block">
                  {text}
                  <PencilUnderline draw={underline || isStatic} />
                </span>
              ) : (
                text
              )}
            </motion.span>
          );
        })}
      </motion.p>
    </section>
  );
}
