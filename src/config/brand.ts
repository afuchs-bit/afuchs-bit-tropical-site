/**
 * Brand facts. Everything in square brackets is a placeholder until the
 * partners decide on name, variant and legal entity.
 */
export const brand = {
  name: "[MARKE]",
  tagline: "[Ein Satz, der den Abend beschreibt, nicht das Produkt]",
  canSizeMl: 330,
  /** Legal entity that operates the site (Impressum). */
  legal: {
    entity: "[Firma / GbR]",
    street: "[Straße Nr.]",
    city: "[PLZ Ort]",
    email: "[hallo@marke.de]",
    representatives: "[Vorname Nachname, Vorname Nachname]",
    vatId: "[DE000000000]",
  },
  social: {
    instagram: "https://instagram.com/[handle]",
  },
} as const;
