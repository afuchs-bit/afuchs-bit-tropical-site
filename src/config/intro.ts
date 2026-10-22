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
  /** POV blink per memory: the lids open in this long (outQuart) … */
  eyeOpen: 0.22,
  /** … stay open until this long after the memory's start … */
  eyeHold: 1.2,
  /** … and close in this long; the next memory opens behind them. */
  eyeClose: 0.15,
  /** The last memory (fireworks) drifts to the halo center and grows to the halo size. */
  finalToCenter: [9.8, 10.15],
  /** Its photo turns into a flat light disc. */
  finalDisc: [10.1, 10.35],
  /** Light flash of the disc starts; it pops at pop + rimFlash. */
  pop: 10.35,
  /** Length of the rim flash (80 ms). Droplets and amber points become party lights at pop + rimFlash. */
  rimFlash: 0.08,
  /** The DOM light may hand over to the WebGL halo from pop + handoffAfter … */
  handoffAfter: 0.2,
  /** … in a cross-fade of this length (or to the CSS fallback at posterDeadline). */
  handoffFade: 0.35,
  /** Light cone from above: 0 → 1 in 400 ms, then settles at 35 %. */
  lightCone: [10.35, 10.75],
  /** Background runs from Tinte into the flavor gradient. */
  backdrop: [10.35, 10.85],
  /** WebGL render loop starts (frameloop "never" before); ready before the pop. */
  sceneStart: 9.8,
  /** Can rises out of the light; rim bloom peaks at 10.65. */
  can: [10.45, 11.35],
  rimPeak: 10.65,
  bass: 10.45,
  /** Floating elements fly from the light to their rest positions. */
  elements: [10.5, 11.5],
  /** If the scene is not ready by then, the CSS halo holds until the can is there. */
  posterDeadline: 11.05,
  headline: [11.25, 11.3],
  header: 11.4,
  copy: 11.45,
  ctas: 11.55,
  legal: 11.65,
  rest: 12.0,
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
  /** Shown under the memory, Geist Mono 12px, Papier (from content/occasions). */
  label: string;
  /** Start in seconds since t0: the lids open on this memory. */
  start: number;
  /**
   * Where the photo's single amber light sits, in % of the square photo
   * (measured: centroid of the amber pixels). When the lids close, this light
   * stays as an afterimage ("Was bleibt, ist das Licht").
   */
  amber: [number, number];
};

/** Seconds between two memories (one blink each). */
export const BUBBLE_STEP = 1.4;
export const FIRST_BUBBLE = 0.8;

/**
 * Per slug, in dramaturgy order. Every memory fills the screen (POV), so
 * only the measured amber light is left to configure: amberPoint()
 * (geometry.ts) maps it onto the viewport for the afterimage and the scene.
 */
const layout: Record<OccasionSlug, Pick<BubbleSpec, "amber">> = {
  // Two amber windows: the brighter one (right tower), not their centroid.
  towers: { amber: [64, 52] },
  yacht: { amber: [68, 67] },
  storm: { amber: [86, 71] },
  water: { amber: [80, 73] },
  terrace: { amber: [52, 63] },
  rooftop: { amber: [48, 48] },
  // Cropped around the burst by scripts/optimize-intro.mjs: amber sits in the middle.
  fireworks: { amber: [50, 50] },
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
