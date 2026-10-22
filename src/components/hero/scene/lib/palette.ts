import { flavors, getFlavor, type FlavorSlug } from "@/content/flavors";
import { agxInverse } from "./agx";
import { DISC } from "./halo";
import { hexToOklab, oklabToLinear, type Lab } from "./oklab";
import { Color } from "three";

/**
 * Per-flavor scene colors, derived once from src/content/flavors.ts.
 *
 * - Halo stops are OKLab (the CSS halo interpolates `in oklab`); cone, disc
 *   and ink are display sRGB (gamma-encoded 0..1), the space CSS composites
 *   in. The halo shader blends like CSS and only converts at the end.
 * - Light colors are OKLab, so a flavor switch mixes them in OKLab.
 * - HDR colors (party lights, rim glow) are AgX-compensated scene-linear
 *   values: their cores read as the palette color, not as AgX's pale cream.
 *
 * City night (direction v2): everything is cold graphite except one light,
 * the amber Signal. Signal, rim and party lights are the same for both
 * flavors; a switch changes the halo (temperature, Tiefe), never the light.
 */
export type Rgb = [number, number, number];

export type ScenePalette = {
  /** Halo core, mid, deep, edge in OKLab (the CSS gradient interpolates in OKLab). */
  halo: [Lab, Lab, Lab, Lab];
  signal: Rgb;
  /** The last bubble's disc: center, core, rim (display gamma). */
  disc: [Rgb, Rgb, Rgb];
  ink: Rgb;
  /** Cool key light from above. */
  key: Lab;
  /** The amber light behind the can. */
  rim: Lab;
  /** Party light colors (amber, cold white) as AgX-compensated linear, at display brightness 1. */
  lights: [Rgb, Rgb];
  /** Rim glow on the lip: the amber light caught on the metal, compensated like the lights. */
  glow: Rgb;
};

/** Tinte and Papier of the "stadtnacht" palette (src/styles/theme.css --ink, --paper). */
const TINTE = "#05090C";
const PAPIER = "#EEEBE5";

/**
 * The lip catches the amber light from behind; toward Papier so the glow
 * reads as a warm highlight on metal, not as orange paint.
 */
const GLOW_PAPIER = 0.45;

function hexToGamma(hex: string): Rgb {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const toGamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055);
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const tmp = new Color();

function labToGamma(lab: Lab): Rgb {
  oklabToLinear(lab, tmp);
  return [toGamma(tmp.r), toGamma(tmp.g), toGamma(tmp.b)];
}

/** CSS `color-mix(in oklab, a p, b)`. */
function mixHex(a: string, b: string, p: number): Rgb {
  const la = hexToOklab(a);
  const lb = hexToOklab(b);
  return labToGamma({ L: lb.L + (la.L - lb.L) * p, a: lb.a + (la.a - lb.a) * p, b: lb.b + (la.b - lb.b) * p });
}

/** Display sRGB (gamma) → the scene-linear value AgX maps back onto it. */
function compensated(gamma: Rgb): Rgb {
  return agxInverse(toLinear(gamma[0]), toLinear(gamma[1]), toLinear(gamma[2]));
}

function build(slug: FlavorSlug): ScenePalette {
  const f = getFlavor(slug);
  const p = f.palette;
  return {
    halo: [hexToOklab(p.haloCore), hexToOklab(p.haloMid), hexToOklab(p.haloDeep), hexToOklab(p.haloEdge)],
    signal: hexToGamma(p.signal),
    disc: [
      mixHex(p.signal, p.haloCore, DISC.signalMix),
      hexToGamma(p.haloCore),
      mixHex(p.haloCore, p.haloMid, DISC.edgeMix),
    ],
    ink: hexToGamma(TINTE),
    key: hexToOklab(f.scene.keyLight),
    rim: hexToOklab(f.scene.rim),
    lights: [compensated(hexToGamma(f.scene.lights[0])), compensated(hexToGamma(f.scene.lights[1]))],
    glow: compensated(mixHex(PAPIER, f.scene.rim, GLOW_PAPIER)),
  };
}

const palettes = new Map<FlavorSlug, ScenePalette>(flavors.map((f) => [f.slug, build(f.slug)]));

export function scenePalette(slug: FlavorSlug): ScenePalette {
  return palettes.get(slug) ?? build(slug);
}
