import { brand } from "./brand";

/**
 * Launch phase drives which CTAs render. Flip this, not the sections.
 * - "prototype": no product exists; collect drop sign-ups and trade leads
 * - "pilot":     bars serve the set; "where to find it" becomes primary
 * - "live":      product ships; buy / store locator becomes primary
 */
export type LaunchPhase = "prototype" | "pilot" | "live";

export const launchPhase: LaunchPhase = "prototype";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const site = {
  name: brand.name,
  description: `${brand.name}: ${brand.tagline}`,
  locale: "de_DE",
  url: siteUrl,
} as const;

export type Cta = { label: string; href: string };

const ctas: Record<LaunchPhase, { primary: Cta; secondary: Cta }> = {
  prototype: {
    primary: { label: "Zum ersten Drop", href: "#drop" },
    secondary: { label: "Für Bars & Handel", href: "#handel" },
  },
  pilot: {
    primary: { label: "Hier gibt's das", href: "#wo" },
    secondary: { label: "Zum ersten Drop", href: "#drop" },
  },
  live: {
    primary: { label: "Jetzt kaufen", href: "#kaufen" },
    secondary: { label: "Für Bars & Handel", href: "#handel" },
  },
};

export const cta = ctas[launchPhase];

export const nav = [
  { label: "Sorten", href: "#sorten" },
  { label: "Der Abend", href: "#abend" },
  { label: "Für Bars & Handel", href: "#handel" },
] as const;
