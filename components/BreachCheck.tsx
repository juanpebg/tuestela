"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL_MAX_LENGTH, isValidEmail } from "@/lib/validation";

// El navegador solo llama a /api/check. La clave y Have I Been Pwned se
// quedan en el servidor (ADR 0003 y ADR 0013).

type Advice = {
  label: string;
  explanation: string;
  recommendation: string;
};

type Breach = {
  title: string;
  domain: string;
  date: string;
  leaked: string[];
  note: string | null;
  affected: string | null;
};

type CheckView = {
  ok: true;
  found: boolean;
  summary: string;
  detail: string;
  footnote: string | null;
  breaches: Breach[];
  advice: Advice[];
};

type Status = "idle" | "sending" | "success" | "error";

function isCheckView(value: unknown): value is CheckView {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    data.ok === true &&
    typeof data.summary === "string" &&
    typeof data.detail === "string" &&
    Array.isArray(data.breaches) &&
    Array.isArray(data.advice)
  );
}

export default function BreachCheck() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<CheckView | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success" || status === "error") {
      resultRef.current?.focus();
    }
  }, [status, result, errorMessage]);

  function resetResult() {
    if (status === "idle") return;
    setStatus("idle");
    setErrorMessage("");
    setResult(null);
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setResult(null);
      setStatus("error");
      setErrorMessage("Ese email no parece válido, ¿puedes revisarlo?");
      return;
    }
    if (!consent) {
      setResult(null);
      setStatus("error");
      setErrorMessage("Necesitamos que confirmes que compruebas tu propio correo.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim(), consent }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "No hemos podido consultar las filtraciones. Prueba de nuevo en un momento.";
        setStatus("error");
        setErrorMessage(message);
        return;
      }
      if (!isCheckView(data)) {
        setStatus("error");
        setErrorMessage(
          "No hemos podido consultar las filtraciones. Prueba de nuevo en un momento.",
        );
        return;
      }
      setResult(data);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(
        "No hemos podido consultar las filtraciones. Prueba de nuevo en un momento.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      action="/api/check"
      method="post"
      className="mt-8 flex w-full max-w-xl flex-col gap-4 text-left"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-4">
        <label htmlFor="check-email" className="sr-only">
          Tu correo
        </label>
        <span className="relative flex-1">
          <input
            id="check-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            required
            maxLength={EMAIL_MAX_LENGTH}
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              resetResult();
            }}
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
          {status === "sending" ? "Consultando…" : "Comprobar"}
        </button>
      </div>

      <label className="flex items-start gap-3 text-sm text-ink/80">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          required
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            resetResult();
          }}
          disabled={status === "sending"}
          className="checkbox-estela mt-0.5"
        />
        <span>Solo compruebo mi propio correo.</span>
      </label>

      {status === "sending" && (
        <div className="h-[2px] overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-gold to-violet motion-safe:animate-scan" />
        </div>
      )}

      <div
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        className="outline-none"
      >
        {status === "error" && (
          <p role="alert" className="text-sm font-medium text-pencil">
            {errorMessage}
          </p>
        )}

        {status === "success" && result && (
          <div className="mt-2 flex flex-col gap-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold tracking-tight text-balance">
                {result.summary}
              </h3>
              <p className="mt-2 text-ink/80">{result.detail}</p>
            </div>

            {result.breaches.length > 0 && (
              <ul className="flex flex-col gap-3">
                {result.breaches.map((breach) => (
                  <li
                    key={`${breach.title}-${breach.date}-${breach.domain}`}
                    className="rounded-2xl border border-ink/10 bg-white/50 px-4 py-4"
                  >
                    <p className="font-serif text-xl font-semibold">{breach.title}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      {breach.date}
                      {breach.domain ? ` · ${breach.domain}` : ""}
                    </p>
                    {breach.affected && (
                      <p className="mt-1 text-sm text-ink/60">{breach.affected}</p>
                    )}
                    {breach.note && <p className="mt-2 text-sm text-ink/80">{breach.note}</p>}
                    <p className="mt-3 text-sm font-medium">Qué se filtró</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink/80">
                      {breach.leaked.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            {result.advice.length > 0 && (
              <div>
                <h3 className="font-serif text-xl font-semibold">Qué puedes hacer</h3>
                <ul className="mt-3 flex flex-col gap-4">
                  {result.advice.map((item) => (
                    <li key={item.label}>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-sm text-ink/80">{item.explanation}</p>
                      <p className="mt-1 text-sm text-ink/80">
                        <span className="font-medium text-ink">Qué hacer. </span>
                        {item.recommendation}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.footnote && <p className="text-sm text-ink/60">{result.footnote}</p>}
          </div>
        )}
      </div>
    </form>
  );
}
