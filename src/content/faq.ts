export type FaqItem = { q: string; a: string };

/**
 * Objections first, SEO long-tail second. Keep answers factual; no health
 * claims, no strength talk.
 */
export const faq: FaqItem[] = [
  {
    q: "Wie viel Alkohol ist drin?",
    a: "Der Alkoholgehalt steht bei jeder Sorte in % vol. [Konkreter Wert nach Partnerentscheidung.]",
  },
  {
    q: "Ab wann kann ich bestellen?",
    a: "Der erste Drop ist limitiert. Trag dich ein, dann bekommst du Datum und Stückzahl zuerst.",
  },
  {
    q: "Versendet ihr ins Ausland?",
    a: "Vorerst nur innerhalb Deutschlands, mit Altersprüfung bei der Übergabe.",
  },
  {
    q: "Welche Allergene sind enthalten?",
    a: "[Allergene laut Zutatenliste des Abfüllers.]",
  },
  {
    q: "Gibt es Pfand auf die Dose?",
    a: "Ja, 25 Cent Einwegpfand pro Dose.",
  },
  {
    q: "Ich betreibe eine Bar. Wie bekomme ich das auf die Karte?",
    a: "Schreib uns über das Formular unter „Für Bars & Handel“. Wir liefern Set, Rezepte und Kartendesign.",
  },
];
