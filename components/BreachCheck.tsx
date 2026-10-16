"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  againLine,
  ASK_CONSENT,
  ASK_EMAIL,
  ASK_HINT,
  BAD_EMAIL,
  EMPTY_FOLLOW,
  estelaForError,
  INTRO,
  MORE,
  moreLeft,
  ONLINE,
  PLAN_LEAD,
  QUESTIONS,
  RESTART,
  SEARCHING,
  SEE_ALL,
  TELL_MORE,
  TYPING,
  YES,
} from "@/components/check/copy";
import type { ChatMessage, GuidedBreach, GuidedView } from "@/components/check/types";
import { EMAIL_MAX_LENGTH, isValidEmail } from "@/lib/validation";

const PREVIEW_COUNT = 2;
const SOURCE_HREF: Record<string, string> = {
  hibp: "https://haveibeenpwned.com",
  xposedornot: "https://xposedornot.com",
};

const subscribeMotion = (onChange: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function clock(): string {
  return new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

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

function greeting(): ChatMessage {
  return { id: "hi", role: "estela", text: INTRO[0], at: "" };
}

export default function BreachCheck() {
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const [session, setSession] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [greeting()]);
  const [phase, setPhase] = useState<"intro" | "consent" | "email" | "checking" | "chat" | "error">("intro");
  const [typing, setTyping] = useState(false);
  const [header, setHeader] = useState(ONLINE);
  const [live, setLive] = useState<string>(INTRO[0]);
  const [draft, setDraft] = useState("");
  const [hidden, setHidden] = useState<GuidedBreach[]>([]);
  const [asked, setAsked] = useState<string[]>([]);

  const life = useRef(0);
  const busy = useRef(false);
  const seq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pause(ms: number) {
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, reducedRef.current ? 0 : ms);
    });
  }

  function stamp(role: ChatMessage["role"], extra: Partial<ChatMessage>): ChatMessage {
    seq.current += 1;
    return { id: `${role}-${session}-${seq.current}`, role, at: clock(), ...extra };
  }

  function push(message: ChatMessage, spoken: string) {
    setMessages((current) => [...current, message]);
    setLive(spoken);
  }

  useEffect(() => {
    const token = { cancel: false };
    const born = life.current;

    async function say(text: string) {
      if (token.cancel || life.current !== born) return;
      setTyping(true);
      setHeader(TYPING);
      await pause(560);
      if (token.cancel || life.current !== born) return;
      setTyping(false);
      setHeader(ONLINE);
      push(stamp("estela", { text }), text);
      await pause(260);
    }

    (async () => {
      await pause(380);
      if (token.cancel || life.current !== born) return;
      setMessages((current) =>
        current.map((message) => (message.id === "hi" && !message.at ? { ...message, at: clock() } : message)),
      );
      await say(INTRO[1]);
      await say(INTRO[2]);
      await say(ASK_CONSENT);
      if (token.cancel || life.current !== born) return;
      setTyping(false);
      setHeader(ONLINE);
      setPhase("consent");
    })();

    return () => {
      token.cancel = true;
    };
    // El saludo se rehace al empezar de nuevo. pause y push leen refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    const node = threadRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, typing, phase, hidden]);

  useEffect(() => {
    if (phase === "email") inputRef.current?.focus();
  }, [phase]);

  async function tellMore() {
    if (busy.current) return;
    busy.current = true;
    const born = life.current;
    setPhase("intro");
    push(stamp("user", { text: TELL_MORE }), TELL_MORE);
    for (const line of MORE) {
      if (life.current !== born) return;
      setTyping(true);
      setHeader(TYPING);
      await pause(560);
      if (life.current !== born) return;
      setTyping(false);
      setHeader(ONLINE);
      push(stamp("estela", { text: line }), line);
      await pause(240);
    }
    if (life.current !== born) return;
    busy.current = false;
    setPhase("consent");
  }

  async function accept() {
    if (busy.current) return;
    busy.current = true;
    const born = life.current;
    setPhase("intro");
    push(stamp("user", { text: YES }), YES);
    setTyping(true);
    setHeader(TYPING);
    await pause(480);
    if (life.current !== born) return;
    setTyping(false);
    setHeader(ONLINE);
    push(stamp("estela", { text: ASK_EMAIL }), ASK_EMAIL);
    busy.current = false;
    setPhase("email");
  }

  async function narrate(view: GuidedView, born: number) {
    const lead = view.summary.includes("comercial")
      ? view.summary
      : (view.speech ?? view.summary);
    setTyping(true);
    setHeader(TYPING);
    await pause(520);
    if (life.current !== born) return;
    setTyping(false);
    setHeader(ONLINE);
    push(stamp("estela", { text: lead }), lead);
    await pause(280);
    if (life.current !== born) return;

    if (!view.found) {
      setTyping(true);
      await pause(480);
      if (life.current !== born) return;
      setTyping(false);
      push(stamp("estela", { text: EMPTY_FOLLOW }), EMPTY_FOLLOW);
      await pause(240);
    } else if (view.detail) {
      setTyping(true);
      await pause(420);
      if (life.current !== born) return;
      setTyping(false);
      push(stamp("estela", { text: view.detail }), view.detail);
      await pause(220);
    }

    const all = view.breaches;
    const shown = all.length > PREVIEW_COUNT ? all.slice(0, PREVIEW_COUNT) : all;
    const rest = all.slice(shown.length);
    for (const card of shown) {
      if (life.current !== born) return;
      setTyping(true);
      setHeader(TYPING);
      await pause(460);
      if (life.current !== born) return;
      setTyping(false);
      setHeader(ONLINE);
      const spoken = `${card.title}. ${card.happened ?? ""}`;
      push(stamp("estela", { card }), spoken);
      await pause(200);
    }
    if (rest.length > 0) {
      if (life.current !== born) return;
      const line = moreLeft(rest.length);
      setTyping(true);
      await pause(400);
      if (life.current !== born) return;
      setTyping(false);
      push(stamp("estela", { text: line }), line);
      setHidden(rest);
    } else {
      setHidden([]);
    }

    if (life.current !== born) return;
    setTyping(true);
    await pause(420);
    if (life.current !== born) return;
    setTyping(false);
    push(stamp("estela", { text: PLAN_LEAD }), PLAN_LEAD);
    for (const step of view.plan ?? []) {
      if (life.current !== born) return;
      const line = `${step.title}. ${step.text}`;
      setTyping(true);
      await pause(400);
      if (life.current !== born) return;
      setTyping(false);
      push(stamp("estela", { text: line }), line);
      await pause(180);
    }
    if (view.footnote) {
      if (life.current !== born) return;
      push(stamp("estela", { text: view.footnote }), view.footnote);
    }
    if (life.current !== born) return;
    setHeader(ONLINE);
    setTyping(false);
    setPhase("chat");
  }

  async function sendEmail(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = draft.trim();
    const born = life.current;
    push(stamp("user", { text: email || "…" }), email || "Mensaje vacío");
    setDraft("");
    if (!isValidEmail(email)) {
      setTyping(true);
      setHeader(TYPING);
      await pause(420);
      if (life.current !== born) return;
      setTyping(false);
      setHeader(ONLINE);
      push(stamp("estela", { text: BAD_EMAIL }), BAD_EMAIL);
      setPhase("email");
      return;
    }

    setPhase("checking");
    setHeader(SEARCHING[0]);
    setTyping(true);
    let step = 0;
    const timer = window.setInterval(() => {
      step = (step + 1) % SEARCHING.length;
      setHeader(SEARCHING[step]);
    }, reducedRef.current ? 1600 : 900);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, consent: true }),
        signal: controller.signal,
      });
      const data: unknown = await response.json().catch(() => null);
      if (life.current !== born) return;
      window.clearInterval(timer);
      setTyping(false);
      if (!response.ok || !isGuidedView(data)) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "No hemos podido consultar las filtraciones. Prueba de nuevo en un momento.";
        const rate = response.status === 429;
        const intro = estelaForError(message, rate);
        push(stamp("estela", { text: intro }), intro);
        if (message !== intro) push(stamp("estela", { text: message }), message);
        const later = againLine();
        push(stamp("estela", { text: later }), later);
        setHeader(ONLINE);
        setPhase("error");
        return;
      }
      await narrate(data, born);
    } catch (error) {
      window.clearInterval(timer);
      if (life.current !== born || (error instanceof DOMException && error.name === "AbortError")) {
        return;
      }
      const intro = estelaForError("", false);
      push(stamp("estela", { text: intro }), intro);
      const later = againLine();
      push(stamp("estela", { text: later }), later);
      setTyping(false);
      setHeader(ONLINE);
      setPhase("error");
    }
  }

  async function showAll() {
    const born = life.current;
    const pending = hidden;
    setHidden([]);
    setPhase("intro");
    for (const card of pending) {
      if (life.current !== born) return;
      setTyping(true);
      setHeader(TYPING);
      await pause(420);
      if (life.current !== born) return;
      setTyping(false);
      setHeader(ONLINE);
      push(stamp("estela", { card }), `${card.title}. ${card.happened ?? ""}`);
      await pause(160);
    }
    if (life.current !== born) return;
    setPhase("chat");
  }

  async function ask(id: string, label: string, answer: string) {
    const born = life.current;
    setAsked((current) => (current.includes(id) ? current : [...current, id]));
    setPhase("intro");
    push(stamp("user", { text: label }), label);
    setTyping(true);
    setHeader(TYPING);
    await pause(520);
    if (life.current !== born) return;
    setTyping(false);
    setHeader(ONLINE);
    push(stamp("estela", { text: answer }), answer);
    setPhase("chat");
  }

  function restart() {
    life.current += 1;
    busy.current = false;
    abortRef.current?.abort();
    seq.current = 0;
    setMessages([greeting()]);
    setPhase("intro");
    setTyping(false);
    setHeader(ONLINE);
    setLive(INTRO[0]);
    setDraft("");
    setHidden([]);
    setAsked([]);
    setSession((current) => current + 1);
  }

  const replies =
    phase === "consent" ? (
      <div className="flex flex-wrap gap-2 px-3 pb-3">
        <Reply onClick={accept}>{YES}</Reply>
        <Reply onClick={tellMore}>{TELL_MORE}</Reply>
      </div>
    ) : phase === "chat" ? (
      <div className="flex flex-col gap-2 px-3 pb-3">
        <p className="text-xs text-ink/50">{ASK_HINT}</p>
        <div className="flex flex-wrap gap-2">
          {hidden.length > 0 && <Reply onClick={showAll}>{SEE_ALL}</Reply>}
          {QUESTIONS.filter((question) => !asked.includes(question.id)).map((question) => (
            <Reply key={question.id} onClick={() => ask(question.id, question.label, question.answer)}>
              {question.label}
            </Reply>
          ))}
          <Reply onClick={restart}>{RESTART}</Reply>
        </div>
      </div>
    ) : phase === "error" ? (
      <div className="flex flex-wrap gap-2 px-3 pb-3">
        <Reply onClick={restart}>{RESTART}</Reply>
      </div>
    ) : null;

  return (
    <div className="mt-8 w-full overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white/75 text-left shadow-[0_18px_50px_rgba(30,27,75,0.08)]">
      <header className="flex items-center gap-3 border-b border-ink/10 bg-cream/80 px-4 py-3">
        <Image
          src="/brand/symbol.webp"
          alt=""
          width={256}
          height={224}
          unoptimized
          className="h-auto w-11 shrink-0"
        />
        <div className="min-w-0">
          <p className="font-serif text-lg font-semibold leading-none">Estela</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            {typing || phase === "checking" ? header : ONLINE}
          </p>
        </div>
      </header>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </div>

      <div
        ref={threadRef}
        id="estela-thread"
        className="flex max-h-[min(70vh,34rem)] flex-col gap-2 overflow-y-auto px-3 py-4 sm:px-4"
      >
        <ol aria-label="Conversación con Estela" className="flex flex-col gap-2">
          {messages.map((message) => (
            <li key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
              {message.card ? (
                <BreachPreview card={message.card} at={message.at} />
              ) : (
                <Bubble message={message} />
              )}
            </li>
          ))}
        </ol>
        {typing && (
          <div className="flex justify-start" aria-hidden="true">
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-ink/10 bg-white px-3 py-3">
              <span className="typing-dot size-1.5 rounded-full bg-ink/50" />
              <span className="typing-dot size-1.5 rounded-full bg-ink/50" />
              <span className="typing-dot size-1.5 rounded-full bg-ink/50" />
            </div>
          </div>
        )}
      </div>

      {replies}

      {phase === "email" && (
        <form onSubmit={sendEmail} className="flex items-center gap-2 border-t border-ink/10 px-3 py-3">
          <label htmlFor="estela-email" className="sr-only">
            Tu correo
          </label>
          <input
            ref={inputRef}
            id="estela-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            required
            maxLength={EMAIL_MAX_LENGTH}
            placeholder="tu@email.com"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-w-0 flex-1 rounded-full border border-ink/15 bg-cream/60 px-4 py-2.5 text-base text-ink outline-none placeholder:text-ink/35 focus-visible:ring-2 focus-visible:ring-brand/40"
          />
          <button
            type="submit"
            aria-label="Enviar"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-[#0b0920] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <SendIcon />
          </button>
        </form>
      )}
    </div>
  );
}

function Reply({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-gold/50 bg-cream px-3.5 py-1.5 text-sm text-ink transition-colors hover:bg-gold/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      {children}
    </button>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.role === "user";
  return (
    <div
      className={
        mine
          ? "max-w-[85%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-cream motion-safe:animate-rise"
          : "max-w-[85%] rounded-2xl rounded-bl-md border border-ink/10 bg-white px-3.5 py-2 text-ink motion-safe:animate-rise"
      }
    >
      <p className="text-pretty text-[0.95rem] leading-snug">{message.text}</p>
      <p className={`mt-1 flex items-center justify-end text-[11px] ${mine ? "text-cream/60" : "text-ink/40"}`}>
        {message.at}
        {mine && <Ticks />}
      </p>
    </div>
  );
}

function BreachPreview({ card, at }: { card: GuidedBreach; at: string }) {
  const sources = card.sources ?? [];
  return (
    <article className="w-full max-w-[95%] overflow-hidden rounded-2xl rounded-bl-md border border-ink/10 bg-white shadow-[0_8px_24px_rgba(30,27,75,0.05)] motion-safe:animate-rise">
      <div className="border-b border-gold/30 bg-gold/10 px-3.5 py-2.5">
        <p className="font-serif text-lg font-semibold leading-tight">{card.title}</p>
        <p className="mt-0.5 text-xs text-ink/60">
          {card.date}
          {card.domain ? ` · ${card.domain}` : ""}
        </p>
      </div>
      <div className="space-y-2.5 px-3.5 py-3 text-sm text-ink/85">
        {card.happened && <p>{card.happened}</p>}
        <ul className="flex flex-wrap gap-1.5">
          {card.leaked.map((item) => (
            <li key={item} className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs text-ink/80">
              {item}
            </li>
          ))}
        </ul>
        {card.means && (
          <p>
            <span className="font-medium text-ink">Qué significa. </span>
            {card.means}
          </p>
        )}
        {card.todo && (
          <p>
            <span className="font-medium text-ink">Qué haría yo. </span>
            {card.todo}
          </p>
        )}
        {card.note && <p className="text-ink/60">{card.note}</p>}
        {sources.length > 0 && (
          <p className="text-xs text-ink/55">
            {sources.length > 1 ? "Fuentes" : "Fuente"}:{" "}
            {sources.map((source, index) => {
              const href = SOURCE_HREF[source.id];
              return (
                <span key={`${source.id}-${source.label}`}>
                  {index > 0 ? " y " : null}
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener"
                      className="underline decoration-dotted underline-offset-4 hover:text-ink"
                    >
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                </span>
              );
            })}
          </p>
        )}
        {at && <p className="text-right text-[11px] text-ink/40">{at}</p>}
      </div>
    </article>
  );
}

function Ticks() {
  return (
    <svg viewBox="0 0 16 11" className="ml-1 inline-block h-2.5 w-3.5" aria-hidden="true">
      <path d="M1 6.2 3.1 8.3 7 3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.2 6.5 7.3 8.6 14.5 2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M4 12h11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 6.5 19.5 12 13 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
