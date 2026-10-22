/**
 * design-taste · Schriftpaarung A (Editorial Warm), umgestellt für die
 * Stadtnacht (tropical-site, Direction v2).
 * Alle Schriften: SIL Open Font License (kostenlos, kommerziell nutzbar).
 *
 * Display: Instrument Serif Italic (harte Haarstriche, urban; wirkt optisch
 * kleiner, darum ×1.06 in der Hero-Größe). Text: Geist. Meta: Geist Mono.
 */
import type { CSSProperties } from "react";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  variable: "--nf-display",
  display: "swap",
});
const text = Geist({ subsets: ["latin"], variable: "--nf-text", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--nf-mono", display: "swap" });

export const fontClassName = [display.variable, text.variable, mono.variable].join(" ");
export const fontStyle = { "--nf-accent": "var(--nf-display)" } as CSSProperties;
