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
  /** Visible life of one memory bubble (cut in, rise, pop). */
  bubbleLife: 0.7,
  /** A bubble cuts in from a point (outExpo) … */
  bubbleIn: 0.12,
  /** … and pops just as fast: it should read as a cut, not a fade. */
  bubbleOut: 0.12,
  /** The last bubble (fireworks) drifts to the halo center and grows to the halo size. */
  finalToCenter: [5.0, 5.35],
  /** Its photo turns into a flat light disc. */
  finalDisc: [5.3, 5.5],
  /** Rim flash of the light disc starts; it pops at pop + rimFlash. */
  pop: 5.5,
  /** Length of the rim flash (80 ms). Droplets and amber points become party lights at pop + rimFlash. */
  rimFlash: 0.08,
  /** The DOM light may hand over to the WebGL halo from pop + handoffAfter … */
  handoffAfter: 0.2,
  /** … in a cross-fade of this length (or to the CSS fallback at posterDeadline). */
  handoffFade: 0.35,
  /** Light cone from above: 0 → 1 in 400 ms, then settles at 35 %. */
  lightCone: [5.5, 5.9],
  /** Background runs from Tinte into the flavor gradient. */
  backdrop: [5.5, 6.0],
  /** WebGL render loop starts (frameloop "never" before); ready before the pop. */
  sceneStart: 5.0,
  /** Can rises out of the light; rim bloom peaks at 5.8. */
  can: [5.6, 6.5],
  rimPeak: 5.8,
  bass: 5.6,
  /** Floating elements fly from the light to their rest positions. */
  elements: [5.65, 6.65],
  /** If the scene is not ready by then, the CSS halo holds until the can is there. */
  posterDeadline: 6.2,
  headline: [6.4, 6.45],
  header: 6.55,
  copy: 6.6,
  ctas: 6.7,
  legal: 6.8,
  rest: 7.0,
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
export const BUBBLE_STEP = 0.6;
export const FIRST_BUBBLE = 0.8;

/**
 * Layout per slug, in dramaturgy order. Consecutive bubbles always switch
 * the screen half (left/right), so no two cuts land on the same side. On
 * portrait phones every amber point stays above 62svh, inside the canvas
 * that takes the points over as party lights.
 */
const layout: Record<OccasionSlug, Omit<BubbleSpec, "id" | "label" | "start">> = {
  towers: { x: 24, y: 30, mx: 32, my: 22, size: 22, rise: 5, amber: [58, 52] },
  yacht: { x: 74, y: 66, mx: 68, my: 56, size: 20, rise: 5, amber: [68, 67] },
  storm: { x: 28, y: 70, mx: 30, my: 54, size: 18, rise: 4, amber: [86, 71] },
  water: { x: 70, y: 28, mx: 70, my: 30, size: 24, rise: 6, amber: [80, 73] },
  terrace: { x: 20, y: 50, mx: 30, my: 46, size: 16, rise: 4, amber: [52, 63] },
  rooftop: { x: 78, y: 46, mx: 70, my: 50, size: 22, rise: 5, amber: [48, 48] },
  // Cropped around the burst by scripts/optimize-intro.mjs: amber sits in the middle.
  fireworks: { x: 40, y: 62, mx: 42, my: 66, size: 20, rise: 3, amber: [50, 50] },
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
