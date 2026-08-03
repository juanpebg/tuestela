import type { CSSProperties } from "react";

// La estrella de 4 puntas de la marca. Única fuente de la geometría STAR:
// Estela.tsx y MicroEstela.tsx la importan de aquí (app/icon.svg lleva una
// copia inevitable: un SVG estático no puede importar).
export const STAR =
  "M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z";

// `style` existe para pasar retardos de animación inline: los retardos como
// clase los pisa el atajo `animation:` (aprendido a las malas — ver Hero).
export default function Sparkle({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="-8 -8 16 16" className={className} style={style} aria-hidden="true">
      <path d={STAR} fill="var(--color-gold)" />
    </svg>
  );
}
