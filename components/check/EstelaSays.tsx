"use client";

import Image from "next/image";

export default function EstelaSays({
  children,
  live = false,
}: {
  children: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <Image
        src="/brand/symbol.webp"
        alt=""
        width={256}
        height={224}
        unoptimized
        className="h-auto w-14 shrink-0 sm:w-16"
      />
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-gold/35 bg-white/75 px-4 py-3 shadow-[0_10px_30px_rgba(30,27,75,0.05)]">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand">Estela</p>
        <div className="mt-1 text-pretty text-ink/90" aria-live={live ? "polite" : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
