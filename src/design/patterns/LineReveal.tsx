"use client";

/**
 * LineReveal · Signatur-Reveal nach Prinzip 11 (Referenz: 003 Lando Norris)
 *
 * Pro Zeile fährt ein Farbbalken über den Text und legt ihn dabei frei.
 * Richtung, Balkenfarbe und Verzögerung sind pro Einsatz wählbar, das System bleibt gleich.
 *
 * <LineReveal as="h2" className="font-display text-display-l"
 *   lines={["Wir bauen Gärten,", "die bleiben."]} direction="left" />
 *
 * Zeilen werden bewusst von Hand übergeben: So bestimmt das Design den Umbruch,
 * nicht der Zufall der Bildschirmbreite. Auf Mobil dürfen Zeilen trotzdem umbrechen.
 */
import { m, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ElementType, type ReactNode } from "react";
import { duration, ease, inView } from "../tokens/motion";

type Direction = "left" | "right";

type LineRevealProps = {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  /** Von welcher Seite der Balken kommt */
  direction?: Direction;
  /** Tailwind-Klasse für die Balkenfarbe, z. B. "bg-signal" oder "bg-deep" */
  barClassName?: string;
  /** Startverzögerung in Sekunden (Fließtext nach Headline: followDelay) */
  delay?: number;
  /** Abstand zwischen den Zeilen in Sekunden */
  lineStep?: number;
};

const hiddenText: Record<Direction, string> = {
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};
const barFrames: Record<Direction, string[]> = {
  left: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 100%)"],
  right: ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)", "inset(0% 100% 0% 0%)"],
};

export function LineReveal({
  lines,
  as: Tag = "p",
  className,
  direction = "left",
  barClassName = "bg-signal",
  delay = 0,
  lineStep = 0.12,
}: LineRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, inView);
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => {
        const start = delay + i * lineStep;
        return (
          <span key={i} className="relative block">
            <m.span
              className="block"
              initial={{ clipPath: hiddenText[direction] }}
              animate={isInView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
              transition={{ duration: duration.wipe * 0.5, ease: ease.inOutQuart, delay: start + duration.wipe * 0.45 }}
            >
              {line}
            </m.span>
            <m.span
              aria-hidden
              className={`pointer-events-none absolute inset-0 ${barClassName}`}
              initial={{ clipPath: barFrames[direction][0] }}
              animate={isInView ? { clipPath: barFrames[direction] } : undefined}
              transition={{ duration: duration.wipe, ease: ease.inOutQuart, times: [0, 0.45, 1], delay: start }}
            />
          </span>
        );
      })}
    </Tag>
  );
}
