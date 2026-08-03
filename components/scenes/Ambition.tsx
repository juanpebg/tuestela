"use client";

import { motion, useReducedMotion } from "motion/react";
import { STAR } from "@/components/Sparkle";
import SearchDemo from "@/components/SearchDemo";

// Interludio nocturno: la página vuelve a la noche para el sueño grande.
// Frente al cielo salvaje del hero, aquí el cielo está cartografiado — una
// constelación cuyos puntos siguen la misma onda que la estela, unidos por
// un trazo que se dibuja al entrar en escena.
const POINTS = [
  { x: 100, y: 160, r: 2.2 },
  { x: 280, y: 100, r: 3 },
  { x: 470, y: 185, r: 2 },
  { x: 660, y: 120, r: 2.6 },
  { x: 850, y: 200, r: 2 },
  { x: 1030, y: 130, r: 3 },
  { x: 1210, y: 205, r: 2.2 },
  { x: 1350, y: 150, r: 2.6 },
];

const LINE = POINTS.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(
  " ",
);

// Tres puntos ascienden a estrella de 4 puntas de la marca.
const BRAND_STARS = [1, 4, 6];

export default function Ambition() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="dusk-band relative flex min-h-[75svh] flex-col items-center justify-center overflow-hidden px-6 py-32 md:py-40">
      <div aria-hidden="true" className="absolute inset-0">
        <svg
          className="js-draw absolute left-1/2 top-1/2 w-[1200px] max-w-none -translate-x-1/2 -translate-y-1/2 md:w-[1400px]"
          viewBox="0 0 1440 300"
          fill="none"
        >
          <motion.path
            d={LINE}
            stroke="#f6f0e0"
            strokeOpacity={0.18}
            strokeWidth={1}
            initial={reduceMotion ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
          />
          {POINTS.map(({ x, y, r }, i) =>
            BRAND_STARS.includes(i) ? (
              <path
                key={i}
                d={STAR}
                transform={`translate(${x}, ${y}) scale(${(r / 2.2).toFixed(2)})`}
                fill="var(--color-gold)"
                opacity={0.9}
              />
            ) : (
              <circle key={i} cx={x} cy={y} r={r} fill="#f6f0e0" opacity={0.8} />
            ),
          )}
        </svg>
        {/* El mismo grano de papel: el fondo opaco tapa el del backdrop. */}
        <div className="grain" />
      </div>

      <motion.p
        className="js-reveal relative mx-auto max-w-3xl text-center font-serif text-2xl font-medium leading-normal tracking-tight text-balance text-cream md:text-4xl"
        initial={
          reduceMotion ? false : { opacity: 0, y: 32, filter: "blur(6px)" }
        }
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        Queremos construir el{" "}
        {/* El mismo degradado que viste "Estela" en el hero: rima visual. */}
        <span className="bg-gradient-to-r from-[#eacd8e] via-gold to-violet-light bg-clip-text font-semibold text-transparent">
          mayor buscador de código abierto
        </span>{" "}
        del planeta para que conozcas qué se sabe de ti en internet.
      </motion.p>

      {/* El buscador, ilustrado: teclea, escanea y encuentra. */}
      <SearchDemo />
    </section>
  );
}
