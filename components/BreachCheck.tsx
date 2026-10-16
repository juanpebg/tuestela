"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import CheckResults, { type GuidedView } from "@/components/check/CheckResults";
import EstelaSays from "@/components/check/EstelaSays";
import { EMAIL_MAX_LENGTH, isValidEmail } from "@/lib/validation";

// El navegador solo llama a /api/check. La clave y las fuentes se quedan en
// el servidor (ADR 0003, ADR 0013 y ADR 0014).

type Status = "idle" | "sending" | "success" | "error";
type ErrorKind = "plain" | "rate";

const subscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

const STEPS = [
  {
    label: "Abro la fuente",
    source: "Have I Been Pwned",
    line: "Vamos a verlo juntos. Estoy mirando Have I Been Pwned, la fuente que documenta filtraciones.",
  },
  {
    label: "Reviso si apareces",
    source: "Have I Been Pwned",
    line: "Sigo en Have I Been Pwned. Miro si este correo está y qué tipo de datos salieron.",
  },
  {
    label: "Cierro la consulta",
    source: "Have I Been Pwned",
    line: "Casi está. No guardo el correo: en cuanto tenga la respuesta, lo olvido.",
  },
];

function isGuidedView(value: unknown): value is GuidedView {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    data.ok === true &&
    typeof data.summary === "string" &&
    typeof data.detail === "string" &&
    typeof data.found === "boolean" &&
    Array.isArray(data.breaches) &&
    Array.isArray(data.advice)
  );
}

function estelaForError(message: string, kind: ErrorKind): string {
  if (kind === "rate" || message.includes("muchas consultas")) {
    return "Hay que esperar un momento. No es un fallo tuyo: estamos cuidando el ritmo para no saturar la consulta.";
  }
  if (message.includes("no está configurado")) {
    return "Todavía no puedo mirarlo. Falta configurar el servidor, y prefiero decírtelo a inventar una respuesta.";
  }
  if (message.includes("no parece válido")) {
    return "Revisa el correo con calma: tiene que parecerse a una dirección de verdad.";
  }
  if (message.includes("propio correo")) {
    return "Solo miro un correo si me confirmas que es tuyo.";
  }
  return "No he podido mirarlo ahora. No pasa nada: puedes probar otra vez en un momento.";
}

export default function BreachCheck() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const mounted = useMounted();
  const [status, setStatus] = useState<Status>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind>("plain");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<GuidedView | null>(null);
  const [resultId, setResultId] = useState(0);
  const [step, setStep] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success" || status === "error") {
      resultRef.current?.focus();
    }
  }, [status, result, errorMessage]);

  useEffect(() => {
    if (status !== "sending") return;
    const id = window.setInterval(() => {
      setStep((current) => (current >= STEPS.length - 1 ? current : current + 1));
    }, 1100);
    return () => window.clearInterval(id);
  }, [status]);

  function resetResult() {
    if (status === "idle") return;
    setStatus("idle");
    setErrorKind("plain");
    setErrorMessage("");
    setResult(null);
  }

  const jsLock = mounted && (!consent || status === "sending");

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setResult(null);
      setErrorKind("plain");
      setStatus("error");
      setErrorMessage("Necesitamos que confirmes que compruebas tu propio correo.");
      return;
    }
    if (!isValidEmail(email)) {
      setResult(null);
      setErrorKind("plain");
      setStatus("error");
      setErrorMessage("Ese email no parece válido, ¿puedes revisarlo?");
      return;
    }

    setStep(0);
    setStatus("sending");
    setErrorKind("plain");
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
        setErrorKind(response.status === 429 ? "rate" : "plain");
        setStatus("error");
        setErrorMessage(message);
        return;
      }
      if (!isGuidedView(data)) {
        setErrorKind("plain");
        setStatus("error");
        setErrorMessage(
          "No hemos podido consultar las filtraciones. Prueba de nuevo en un momento.",
        );
        return;
      }
      setResult(data);
      setResultId((current) => current + 1);
      setStatus("success");
    } catch {
      setErrorKind("plain");
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
      className="check-form mt-8 flex w-full flex-col gap-4 text-left"
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
            aria-describedby="check-hint"
            onChange={(event) => {
              setEmail(event.target.value);
              resetResult();
            }}
            disabled={jsLock}
            className="peer w-full border-b-2 border-ink/20 bg-transparent px-1 py-3 text-lg text-ink placeholder:text-ink/35 focus:outline-none disabled:opacity-60"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-gold to-violet transition-transform duration-300 peer-focus:scale-x-100"
          />
        </span>
        <button
          id="check-submit"
          type="submit"
          disabled={jsLock}
          className="rounded-full bg-gold px-7 py-3 font-medium text-[#0b0920] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(212,169,78,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {status === "sending" ? "Consultando…" : "Comprobar"}
        </button>
      </div>

      <label htmlFor="check-consent" className="flex items-start gap-3 text-sm text-ink/80">
        <input
          id="check-consent"
          type="checkbox"
          name="consent"
          value="yes"
          required
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            resetResult();
          }}
          disabled={mounted && status === "sending"}
          className="checkbox-estela mt-0.5"
        />
        <span>Solo compruebo mi propio correo.</span>
      </label>

      <p id="check-hint" className="consent-hint text-sm text-ink/55">
        Para comprobar, confirma que el correo es tuyo.
      </p>

      <div ref={resultRef} tabIndex={-1} className="outline-none">
        {status === "sending" && (
          <div className="mt-2 motion-safe:animate-rise">
            <EstelaSays live>
              <p>{STEPS[step].line}</p>
            </EstelaSays>
            <ol className="mt-4 flex flex-col gap-2 text-sm" aria-hidden="true">
              {STEPS.map((item, index) => (
                <li
                  key={item.label}
                  className={
                    index === step
                      ? "font-medium text-ink"
                      : index < step
                        ? "text-ink/50"
                        : "text-ink/35"
                  }
                >
                  <span
                    className={`mr-2 inline-block size-1.5 rounded-full align-middle ${index <= step ? "bg-gold" : "bg-ink/20"}`}
                  />
                  {item.label}
                  <span className="text-ink/45"> · {item.source}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 h-[2px] overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-gold to-violet motion-safe:animate-scan" />
            </div>
            <div className="mt-4 flex flex-col gap-3" aria-hidden="true">
              <div className="h-24 rounded-2xl bg-ink/[0.06] motion-safe:animate-pulse" />
              <div className="h-24 rounded-2xl bg-ink/[0.06] motion-safe:animate-pulse" />
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mt-2 flex flex-col gap-3 motion-safe:animate-rise" role="alert">
            <EstelaSays>
              <p>{estelaForError(errorMessage, errorKind)}</p>
            </EstelaSays>
            <p className="rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-sm text-ink/80">
              {errorMessage}
            </p>
          </div>
        )}

        {status === "success" && result && <CheckResults key={resultId} view={result} />}
      </div>
    </form>
  );
}
