"use client";

import { motion, useReducedMotion } from "motion/react";
import WaitlistForm from "@/components/WaitlistForm";
import Sparkle from "@/components/Sparkle";

export default function Waitlist() {
  const reduceMotion = useReducedMotion();

  return (
    // pt pequeño a propósito: esta escena responde a la anterior
    // ("¿quieres saber más?" sigue a la ambición) y van casi pegadas.
    // id="waitlist": destino del botón "Únete a la lista" del hero.
    <section
      id="waitlist"
      className="relative flex flex-col items-center px-6 pt-28 pb-36 md:pt-36 md:pb-44"
    >
      <motion.div
        className="js-reveal flex w-full max-w-xl flex-col items-center text-center"
        initial={
          reduceMotion ? false : { opacity: 0, y: 32, filter: "blur(6px)" }
        }
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-brand">
          <Sparkle className="size-4 motion-safe:animate-twinkle" />
          Próximamente
        </p>
        <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Sé de los primeros en ver tu <span className="text-brand">Estela</span>
        </h2>
        {/* La newsletter se presenta aquí, ANTES del checkbox que la cita. */}
        <p className="mt-3 text-lg text-ink/80">
          Mientras la construimos, te contamos cada paso por email — con total
          transparencia.
        </p>

        {/* El desplegable va antes del formulario a propósito: el checkbox
            afirma "he leído qué vais a hacer con mi email" y esto es lo que
            se lee. El orden es parte del consentimiento. */}
        {/* `group` + `group-open:` — la estrella rota 45° al desplegar. */}
        <details className="group mt-6 w-full max-w-md text-left text-sm text-ink/80">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-ink/70 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
            <Sparkle className="size-3.5 transition-transform duration-300 group-open:rotate-45" />
            ¿Qué hacemos con tu email?
          </summary>
          <ul className="mt-3 ml-[5px] list-none space-y-2 border-l-2 border-gold/40 pl-5">
            <li>
              Te llega nuestra newsletter, donde contamos con total
              transparencia cómo construimos tuEstela paso a paso — explicado
              tan claro que lo entienda cualquiera. También incluirá contenido
              comercial: cuando tengamos algo que ofrecerte, te lo contaremos
              ahí.
            </li>
            <li>No vendemos ni cedemos tu email a nadie. Nunca.</li>
            <li>Te das de baja con un clic, desde cualquier correo.</li>
          </ul>
        </details>

        <WaitlistForm />
      </motion.div>
    </section>
  );
}
