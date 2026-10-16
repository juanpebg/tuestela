"use client";

import { useEffect, useRef } from "react";
import Sparkle from "@/components/Sparkle";
import EstelaSays from "@/components/check/EstelaSays";
import { EMPTY_LESSON, LESSONS } from "@/components/check/lessons";

type Advice = {
  label: string;
  explanation: string;
  recommendation: string;
};

type SourceRef = {
  id: string;
  label: string;
};

export type GuidedBreach = {
  title: string;
  domain: string;
  date: string;
  leaked: string[];
  note: string | null;
  sources?: SourceRef[];
  happened?: string;
  means?: string;
  todo?: string;
  group?: "primero" | "tambien";
};

export type PlanStep = {
  title: string;
  text: string;
};

export type GuidedView = {
  found: boolean;
  summary: string;
  detail: string;
  footnote: string | null;
  speech?: string;
  plan?: PlanStep[];
  breaches: GuidedBreach[];
  advice: Advice[];
};

const SOURCE_HREF: Record<string, string> = {
  hibp: "https://haveibeenpwned.com",
  xposedornot: "https://xposedornot.com",
};

function BreachCard({
  breach,
  initiallyOpen,
  delay,
}: {
  breach: GuidedBreach;
  initiallyOpen: boolean;
  delay: number;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (initiallyOpen && ref.current) ref.current.open = true;
  }, [initiallyOpen]);

  return (
    <details
      ref={ref}
      className="check-card group rounded-2xl border border-ink/10 bg-white/70 shadow-[0_10px_30px_rgba(30,27,75,0.04)] transition-[border-color,box-shadow] duration-300 open:border-gold/50 open:shadow-[0_14px_40px_rgba(242,165,43,0.14)] motion-safe:animate-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      <summary className="cursor-pointer list-none rounded-2xl px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:px-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-serif text-xl font-semibold tracking-tight text-balance">{breach.title}</p>
            <p className="mt-1 text-sm text-ink/60">
              {breach.date}
              {breach.domain ? ` · ${breach.domain}` : ""}
            </p>
          </div>
          <Sparkle className="mt-1.5 size-3.5 shrink-0 transition-transform duration-300 group-open:rotate-45" />
        </div>
        <SourceLine sources={breach.sources ?? []} />
      </summary>
      <div className="check-card-body space-y-4 px-4 pb-5 sm:px-5">
        {breach.happened && <p className="text-ink/85">{breach.happened}</p>}
        <div>
          <p className="text-sm font-medium">Qué datos salieron</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {breach.leaked.map((item) => (
              <li key={item} className="rounded-full bg-brand/10 px-3 py-1 text-sm text-ink/85">
                {item}
              </li>
            ))}
          </ul>
        </div>
        {breach.means && (
          <p className="text-sm text-ink/85">
            <span className="font-medium text-ink">Qué significa. </span>
            {breach.means}
          </p>
        )}
        {breach.todo && (
          <p className="text-sm text-ink/85">
            <span className="font-medium text-ink">Qué haría yo. </span>
            {breach.todo}
          </p>
        )}
        {breach.note && <p className="text-sm text-ink/65">{breach.note}</p>}
      </div>
    </details>
  );
}

function SourceLine({ sources }: { sources: SourceRef[] }) {
  if (sources.length === 0) return null;
  const word = sources.length > 1 ? "Fuentes" : "Fuente";
  return (
    <p className="mt-2 text-sm text-ink/65">
      {word}:{" "}
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
                className="underline decoration-dotted underline-offset-4 transition-colors hover:text-ink"
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
  );
}

function Lesson({
  title,
  body,
  initiallyOpen = false,
}: {
  title: string;
  body: string;
  initiallyOpen?: boolean;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (initiallyOpen && ref.current) ref.current.open = true;
  }, [initiallyOpen]);

  return (
    <details ref={ref} className="group border-b border-ink/10 py-3 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-ink/80 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 [&::-webkit-details-marker]:hidden">
        <Sparkle className="size-3.5 shrink-0 transition-transform duration-300 group-open:rotate-45" />
        {title}
      </summary>
      <p className="mt-2 pl-6 text-sm text-ink/75">{body}</p>
    </details>
  );
}

function Plan({ steps }: { steps: PlanStep[] }) {
  return (
    <section>
      <h3 className="font-serif text-2xl font-semibold tracking-tight">Un plan corto</h3>
      <p className="mt-1 text-sm text-ink/70">Tres cosas que yo haría, aparezcas o no.</p>
      <ol className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-ink/10 bg-white/55 px-4 py-4 motion-safe:animate-rise"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <span className="font-serif text-lg text-gold">{index + 1}</span>
            <p className="mt-1 font-medium">{step.title}</p>
            <p className="mt-1 text-sm text-ink/75">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function CheckResults({ view }: { view: GuidedView }) {
  const primero = view.breaches.filter((breach) => breach.group === "primero");
  const tambien = view.breaches.filter((breach) => breach.group !== "primero");
  const plan = view.plan ?? [];

  return (
    <div className="mt-2 flex flex-col gap-8 motion-safe:animate-rise">
      <EstelaSays>
        <p>{view.speech ?? view.summary}</p>
      </EstelaSays>

      <div>
        <h3 className="font-serif text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          {view.summary}
        </h3>
        <p className="mt-2 text-ink/80">{view.detail}</p>
      </div>

      {!view.found && (
        <div className="rounded-2xl border border-gold/30 bg-white/50 px-4 py-2">
          <Lesson title={EMPTY_LESSON.title} body={EMPTY_LESSON.body} initiallyOpen />
        </div>
      )}

      {primero.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="font-serif text-xl font-semibold">Empezaría por aquí</h3>
          {primero.map((breach, index) => (
            <BreachCard
              key={`${breach.title}-${breach.date}-${breach.domain}`}
              breach={breach}
              initiallyOpen={index === 0}
              delay={index * 70}
            />
          ))}
        </section>
      )}

      {tambien.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="font-serif text-xl font-semibold">
            {primero.length > 0 ? "También apareció en" : "Esto es lo que apareció"}
          </h3>
          {tambien.map((breach, index) => (
            <BreachCard
              key={`${breach.title}-${breach.date}-${breach.domain}`}
              breach={breach}
              initiallyOpen={primero.length === 0 && index === 0}
              delay={(primero.length + index) * 70}
            />
          ))}
        </section>
      )}

      {plan.length > 0 && <Plan steps={plan} />}

      <section>
        <h3 className="font-serif text-xl font-semibold">Para entenderlo con calma</h3>
        <div className="mt-2">
          {LESSONS.map((lesson) => (
            <Lesson key={lesson.title} title={lesson.title} body={lesson.body} />
          ))}
        </div>
      </section>

      {view.advice.length > 0 && (
        <details className="group rounded-2xl border border-ink/10 bg-white/40 px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 [&::-webkit-details-marker]:hidden">
            <Sparkle className="size-3.5 transition-transform duration-300 group-open:rotate-45" />
            Si quieres el detalle de cada dato
          </summary>
          <ul className="mt-4 flex flex-col gap-4">
            {view.advice.map((item) => (
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
        </details>
      )}

      {view.footnote && <p className="text-sm text-ink/60">{view.footnote}</p>}
    </div>
  );
}
