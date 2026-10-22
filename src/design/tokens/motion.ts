/**
 * design-taste · Motion-Presets (Tokens v0) für Framer Motion
 *
 * Orientierung statt Vorschrift: Diese Presets geben den Grundcharakter vor
 * (ruhig, präzise, keine Bounces). Eigene Bewegungen sind erlaubt, wenn sie
 * dazu passen. Pro Seite 2–3 Signatur-Effekte (Prinzip 16).
 */
import type { Transition, Variants } from "framer-motion";

/* Kurven: identisch zu den --ease-* Tokens in tailwind/theme.css */
export const ease = {
  /** Standard für Einblendungen: schneller Start, sehr weiches Ende */
  outExpo: [0.16, 1, 0.3, 1],
  /** Etwas ruhiger, für Hover und kleine UI-Bewegungen */
  outQuart: [0.25, 1, 0.5, 1],
  /** Für Bewegungen, die starten UND stoppen (Wipes, Seitenübergänge) */
  inOutQuart: [0.76, 0, 0.24, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/* Dauern in Sekunden */
export const duration = {
  hover: 0.35,
  ui: 0.5,
  reveal: 0.9,
  wipe: 1.1,
  scene: 1.6,
} as const;

/* Verzögerung zwischen Headline und Fließtext (Prinzip 11) */
export const followDelay = 0.2;

/* Federn für Dinge, die der Maus folgen (Cursor, Parallax) */
export const spring = {
  /** Cursor-Ring: folgt knapp, ohne zu wackeln */
  cursor: { stiffness: 400, damping: 40, mass: 0.6 },
  /** Parallax-Ebenen: träge und weich */
  parallax: { stiffness: 80, damping: 20, mass: 1 },
  /** Fortschritt (Scroll-Ring, Zähler) */
  progress: { stiffness: 120, damping: 30, restDelta: 0.001 },
} as const;

export const transition = {
  reveal: { duration: duration.reveal, ease: ease.outExpo },
  hover: { duration: duration.hover, ease: ease.outQuart },
  wipe: { duration: duration.wipe, ease: ease.inOutQuart },
} as const satisfies Record<string, Transition>;

/* Bewusst KEIN generisches "fadeUp für alles" (Anti-Pattern).
   Diese Varianten sind für Fälle, in denen kein Signatur-Reveal passt. */

/** Leise Einblendung ohne Bewegung, z. B. für Bilder */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.reveal, ease: ease.outQuart } },
};

/** Maske von unten, wirkt wie ein Vorhang: für Bilder und Karten */
export const maskUp: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)", transition: transition.wipe },
};

/** Container, der Kinder nacheinander zeigt */
export const stagger = (step = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren } },
});

/** Standard-Viewport für whileInView: einmal, wenn 30 % sichtbar */
export const inView = { once: true, amount: 0.3 } as const;
