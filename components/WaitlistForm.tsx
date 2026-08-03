"use client";

import { useState } from "react";
import { isValidEmail, EMAIL_MAX_LENGTH } from "@/lib/validation";
import MicroEstela from "@/components/MicroEstela";

// Un único estado con cuatro valores posibles — no cuatro booleanos sueltos.
// Hace imposible estar "enviando" y "con éxito" a la vez.
type Status = "idle" | "sending" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  // Honeypot: campo invisible que ningún humano rellena (ver la función).
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setStatus("error");
      setErrorMessage("Ese email no parece válido, ¿puedes revisarlo?");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent, website }),
      });
      if (!response.ok) {
        // El servidor redacta mensajes específicos por caso: si llega uno,
        // se muestra; el genérico queda como último recurso.
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        setStatus("error");
        setErrorMessage(
          data?.message ??
            "No hemos podido apuntarte. Prueba de nuevo en un momento.",
        );
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(
        "No hemos podido apuntarte. Prueba de nuevo en un momento.",
      );
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="mt-8 flex flex-col items-center gap-3 motion-safe:animate-reveal"
      >
        {/* Copy honesto: a quien repite alta no le reenviamos la bienvenida,
            así que no prometemos un correo que puede no llegar. */}
        <p className="rounded-lg bg-brand/10 px-6 py-4 text-lg">
          ¡Hecho! Estás en la lista. Si es tu primera vez, te llegará una
          bienvenida en unos minutos.
        </p>
        <MicroEstela className="h-6 w-44" />
        <p className="text-sm text-ink/60">Tu estela empieza aquí.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      // Sin JavaScript, el navegador envía el formulario a la antigua:
      // el endpoint del backend acepta también ese formato.
      action="/api/waitlist"
      method="post"
      className="mt-8 flex w-full max-w-md flex-col gap-4"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-4">
        <label htmlFor="waitlist-email" className="sr-only">
          Tu email
        </label>
        {/* Campo-línea: escribes sobre una raya que, al enfocar, se
            convierte en estela (peer-focus despliega el degradado). */}
        <span className="relative flex-1">
          <input
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={EMAIL_MAX_LENGTH}
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "sending"}
            className="peer w-full border-b-2 border-ink/20 bg-transparent px-1 py-3 text-lg text-ink placeholder:text-ink/35 focus:outline-none disabled:opacity-60"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-gold to-violet transition-transform duration-300 peer-focus:scale-x-100"
          />
        </span>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-gold px-7 py-3 font-medium text-[#0b0920] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(212,169,78,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {status === "sending" ? "Enviando…" : "Avísame"}
        </button>
      </div>

      {/* Honeypot anti-bots: invisible y fuera del orden de tabulación. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
      />

      <label className="flex items-start gap-3 text-left text-sm text-ink/80">
        <input
          type="checkbox"
          name="consent"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={status === "sending"}
          className="checkbox-estela mt-0.5"
        />
        <span>
          Acepto recibir la newsletter de tuEstela y he leído qué vais a hacer
          con mi email.
        </span>
      </label>

      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-pencil">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
