/**
 * Intro timeline: the single source for every timing in the hero.
 * Seconds since the "Ja" click (t0). Tuning ("Blasen 20 % schneller") means
 * changing numbers here, nothing else.
 */
import { occasions, type OccasionSlug } from "@/content/occasions";

/** Bumped with the city-night image world: everyone sees the new intro once. */
export const INTRO_VERSION = "v2";

export const T = {
  /** Gate question collapses into a 6px light seed and goes out. */
  gateOut: [0, 0.3],
  /** Black with grain is fully there. */
  grain: 0.4,
  /** Visible life of one memory (fade in, rise, fade out). */
  bubbleLife: 1.0,
  /** A memory fades in out of the black … */
  bubbleIn: 0.3,
  /** … and dissolves back into it. */
  bubbleOut: 0.3,
  /** The last memory (fireworks) drifts to the halo center and grows to the halo size. */
  finalToCenter: [5.9, 6.25],
  /** Its photo turns into a flat light disc. */
  finalDisc: [6.2, 6.45],
  /** Light flash of the disc starts; it pops at pop + rimFlash. */
  pop: 6.45,
  /** Length of the rim flash (80 ms). Droplets and amber points become party lights at pop + rimFlash. */
  rimFlash: 0.08,
  /** The DOM light may hand over to the WebGL halo from pop + handoffAfter … */
  handoffAfter: 0.2,
  /** … in a cross-fade of this length (or to the CSS fallback at posterDeadline). */
  handoffFade: 0.35,
  /** Light cone from above: 0 → 1 in 400 ms, then settles at 35 %. */
  lightCone: [6.45, 6.85],
  /** Background runs from Tinte into the flavor gradient. */
  backdrop: [6.45, 6.95],
  /** WebGL render loop starts (frameloop "never" before); ready before the pop. */
  sceneStart: 5.9,
  /** Can rises out of the light; rim bloom peaks at 6.75. */
  can: [6.55, 7.45],
  rimPeak: 6.75,
  bass: 6.55,
  /** Floating elements fly from the light to their rest positions. */
  elements: [6.6, 7.6],
  /** If the scene is not ready by then, the CSS halo holds until the can is there. */
  posterDeadline: 7.15,
  headline: [7.35, 7.4],
  header: 7.5,
  copy: 7.55,
  ctas: 7.65,
  legal: 7.75,
  rest: 8.0,
} as const;

/** Return visit (intro already seen): light on, can out of the light, wipe. */
export const DIRECT = {
  can: [0.1, 0.7],
  elements: [0.15, 0.75],
  headline: [0.3, 0.35],
  ui: 0.5,
  rest: 1.2,
} as const;

export type BubbleId = OccasionSlug;

export type BubbleSpec = {
  id: BubbleId;
  /** Shown next to the bubble, Geist Mono 12px, Papier (from content/occasions). */
  label: string;
  /** Start in seconds since t0. */
  start: number;
  /** Center in % of the viewport (desktop / mobile portrait). */
  x: number;
  y: number;
  mx: number;
  my: number;
  /** Diameter in vmin; portrait mobile multiplies by MOBILE_BUBBLE_SCALE. */
  size: number;
  /** Rise distance in vmin. */
  rise: number;
  /**
   * Where the photo's single amber light sits, in % of the square photo
   * (measured: centroid of the amber pixels). When the bubble pops, this is
   * the point that stays behind ("Was bleibt, ist das Licht").
   */
  amber: [number, number];
};

export const MOBILE_BUBBLE_SCALE = 1.6;

/** Seconds between two bubble starts. */
export const BUBBLE_STEP = 0.75;
export const FIRST_BUBBLE = 0.8;

/**
 * Layout per slug, in dramaturgy order. Memories are large (42–56vmin,
 * phones ×1.6 ≈ 67–90 % of the width) and dissolve into the black from the
 * middle outwards, so an image may run past the screen edge: only its label
 * and its amber point must stay visible. On desktop consecutive memories
 * switch the screen half (left/right); on portrait phones every amber point
 * stays above 62svh, inside the canvas that takes the points over as party
 * lights. Checked at 1280×720, 1440×900, 1920×1080, 390×844 and 375×667.
 */
const layout: Record<OccasionSlug, Omit<BubbleSpec, "id" | "label" | "start">> = {
  towers: { x: 27, y: 36, mx: 40, my: 27, size: 54, rise: 5, amber: [58, 52] },
  yacht: { x: 70, y: 56, mx: 60, my: 44, size: 50, rise: 5, amber: [68, 67] },
  storm: { x: 30, y: 62, mx: 38, my: 25, size: 46, rise: 4, amber: [86, 71] },
  water: { x: 69, y: 38, mx: 58, my: 42, size: 56, rise: 6, amber: [80, 73] },
  terrace: { x: 26, y: 48, mx: 38, my: 26, size: 42, rise: 4, amber: [52, 63] },
  rooftop: { x: 73, y: 46, mx: 60, my: 44, size: 52, rise: 5, amber: [48, 48] },
  // Cropped around the burst by scripts/optimize-intro.mjs: amber sits in the middle.
  fireworks: { x: 44, y: 58, mx: 48, my: 32, size: 48, rise: 3, amber: [50, 50] },
};

/** Seven memories; the last one (fireworks) becomes the light halo. */
export const bubbles: BubbleSpec[] = occasions.map((o, i) => ({
  id: o.slug,
  label: o.label,
  start: FIRST_BUBBLE + i * BUBBLE_STEP,
  ...layout[o.slug],
}));

/** What the label of the last bubble rolls to after the pop; also the 07 ring of the hero. */
export const FINAL_LABEL = "07 · HEUTE NACHT";

export const storageKeys = {
  ageGate: "age-gate", // sessionStorage, written by AgeGateProvider
  introSeen: "intro-seen", // localStorage, `${INTRO_VERSION}:<ISO>`
  sound: "sound", // localStorage, "on" | "off"
} as const;
