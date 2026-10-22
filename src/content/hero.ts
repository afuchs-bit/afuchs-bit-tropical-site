/**
 * Hero copy. German, no strength as an argument, no health claims.
 * Headline and copy go to the advertising lawyer before launch.
 */
export const heroCopy = {
  headline: ["Heute", "Nacht"] as const,
  /** The full stop of "Nacht." is rendered as a light point in Signal. */
  headlineLabel: "Heute Nacht.",
  gate: {
    question: "Bist du mindestens 18?",
    yes: "Ja",
    no: "Nein",
    denied: "Diese Seite ist nur für Erwachsene.",
  },
  skip: "Intro überspringen",
  sound: "Ton",
  legal: ["Verantwortungsvoll genießen", "18+"],
  cta: {
    primary: { label: "Zum ersten Drop", href: "#drop" },
    secondary: { label: "Für Bars & Handel", href: "#handel" },
    contact: { label: "Kontakt", href: "#handel" },
  },
  nav: [
    { label: "Sorten", sheet: "sorten" },
    { label: "Drop", sheet: "drop" },
    { label: "Handel", sheet: "handel" },
  ],
} as const;

export type SheetId = "sorten" | "drop" | "handel";
