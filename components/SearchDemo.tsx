"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

// Demo del buscador en miniatura: se teclea la pregunta, una línea escanea
// y los resultados aparecen uno a uno.
//
// Truco de resiliencia: el estado INICIAL es el final (todo visible), así el
// HTML pre-renderizado muestra la ilustración completa a quien navega sin
// JavaScript. Con JS, un efecto lo resetea al montar (aún fuera de pantalla)
// y la secuencia se reproduce al entrar en escena.

const QUERY = "¿Qué se sabe de mí?";

const RESULTS = [
  { label: "2 perfiles públicos con tu nombre", color: "var(--color-violet-light)" },
  { label: "4 fotos visibles para cualquiera", color: "var(--color-gold)" },
  { label: "1 teléfono en un listado abierto", color: "#f6f0e0" },
  { label: "1 contraseña en una filtración antigua", color: "var(--color-pencil)" },
];

// Tiempos de la secuencia (ms).
const TYPE_START = 400;
const TYPE_STEP = 70;
const SCAN_DURATION = 900;
const RESULT_STEP = 450;

export default function SearchDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  const [typed, setTyped] = useState(QUERY.length);
  const [shown, setShown] = useState(RESULTS.length);
  const [scanning, setScanning] = useState(false);

  // Mostrar el estado final también si la preferencia cambia a mitad de la demo.
  const visibleResults = reduceMotion ? RESULTS.length : shown;
  const visibleQuery = reduceMotion ? QUERY : QUERY.slice(0, typed);

  // Al montar con JS (y sin movimiento reducido): rebobinar al principio.
  // El setState síncrono es deliberado — es el patrón de React para divergir
  // del HTML del servidor tras hidratar (el SSR enseña el estado final; el
  // cliente rebobina para reproducir la secuencia). Un único render extra,
  // asumido y con la regla desactivada solo en estas dos líneas.
  useEffect(() => {
    if (reduceMotion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTyped(0);
    setShown(0);
  }, [reduceMotion]);

  // La secuencia. Regla de oro de useEffect: todo temporizador programado
  // se limpia en el return — si el componente se desmonta a mitad de
  // función, no quedan relojes sonando en memoria.
  useEffect(() => {
    if (!inView || reduceMotion) return;

    const timers: number[] = [];

    for (let i = 1; i <= QUERY.length; i++) {
      timers.push(window.setTimeout(() => setTyped(i), TYPE_START + i * TYPE_STEP));
    }
    const afterTyping = TYPE_START + QUERY.length * TYPE_STEP + 200;
    timers.push(window.setTimeout(() => setScanning(true), afterTyping));
    timers.push(
      window.setTimeout(() => setScanning(false), afterTyping + SCAN_DURATION),
    );
    RESULTS.forEach((_, i) => {
      timers.push(
        window.setTimeout(
          () => setShown(i + 1),
          afterTyping + SCAN_DURATION + i * RESULT_STEP,
        ),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [inView, reduceMotion]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative mx-auto mt-14 w-full max-w-md rounded-2xl border border-cream/10 bg-[#0e0c22]/70 p-4 backdrop-blur-sm md:mt-16"
    >
      {/* Fila de búsqueda */}
      <div className="flex items-center gap-3 border-b border-cream/10 pb-3">
        <MagnifierIcon />
        <span className="grid font-sans text-sm leading-6 text-cream/90">
          {/* Reserva el tamaño de la pregunta completa durante el tecleo. */}
          <span className="invisible [grid-area:1/1]">{QUERY}</span>
          <span className="[grid-area:1/1]">
            {visibleQuery}
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] bg-gold motion-safe:animate-caret" />
          </span>
        </span>
      </div>

      {/* La guía ocupa siempre el mismo espacio, también cuando está oculta. */}
      <div
        className="mt-4 h-[2px] overflow-hidden rounded-full bg-cream/10"
        style={{ opacity: scanning && !reduceMotion ? 1 : 0 }}
      >
        {scanning && !reduceMotion && (
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-gold to-violet-light motion-safe:animate-scan" />
        )}
      </div>

      {/* Todas las filas conservan su altura natural: solo animamos opacidad
          y desplazamiento, sin estirar la sección ni su degradado (ADR 0013). */}
      <ul className="mt-3 space-y-2">
        {RESULTS.map(({ label, color }, index) => (
          <motion.li
            key={label}
            initial={false}
            animate={{
              opacity: index < visibleResults ? 1 : 0,
              y: index < visibleResults ? 0 : 8,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
            className="flex items-center gap-3 rounded-lg bg-cream/[0.04] px-3 py-2 text-sm text-cream/85"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </motion.li>
        ))}
      </ul>

      <motion.p
        initial={false}
        animate={{ opacity: visibleResults === RESULTS.length ? 1 : 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.6,
          delay: !reduceMotion && visibleResults === RESULTS.length ? 0.3 : 0,
        }}
        className="mt-4 text-xs leading-relaxed text-cream/50"
      >
        Esto es lo que internet cuenta de ti. Pronto podrás verlo — y decidir.
      </motion.p>
    </div>
  );
}

function MagnifierIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4 shrink-0 stroke-cream/50"
      fill="none"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 L14 14" strokeLinecap="round" />
    </svg>
  );
}
