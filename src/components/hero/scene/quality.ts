import type { Quality } from "../store";

/**
 * Quality ladder (direction §8). The scene starts on a level guessed from
 * the device and steps down while the PerformanceMonitor reports drops:
 * resolution first, then instances and bloom levels, then bloom off.
 * No GPU detection service (useDetectGPU fetches from a CDN).
 */
export type QualityLevel = {
  tier: Quality;
  /** Max device pixel ratio (desktop / mobile layout). */
  dpr: [number, number];
  /** Composer MSAA samples on desktop (mobile always 0). */
  msaa: number;
  /** 0 = bloom off. */
  bloomLevels: number;
  /** Multiplies flavor.elements counts and the party lights. */
  instances: number;
  lights: number;
  envResolution: number;
  /** Radial segments of the can body. */
  segments: number;
};

export const LEVELS: readonly QualityLevel[] = [
  { tier: "high", dpr: [1.75, 1.5], msaa: 4, bloomLevels: 7, instances: 1, lights: 1, envResolution: 256, segments: 96 },
  { tier: "high", dpr: [1.25, 1.25], msaa: 4, bloomLevels: 7, instances: 1, lights: 1, envResolution: 256, segments: 96 },
  { tier: "mid", dpr: [1.25, 1.25], msaa: 0, bloomLevels: 5, instances: 0.6, lights: 0.75, envResolution: 128, segments: 64 },
  { tier: "low", dpr: [1, 1], msaa: 0, bloomLevels: 0, instances: 0.35, lights: 0.5, envResolution: 64, segments: 48 },
];

export const LOWEST = LEVELS.length - 1;

/** Index into LEVELS. saveData → low; coarse pointer or ≤ 4 cores → mid; else high. */
export function startLevel(): number {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return LOWEST;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency || 4;
  if (coarse || cores <= 4) return 2;
  return 0;
}

export function level(index: number): QualityLevel {
  return LEVELS[Math.min(LOWEST, Math.max(0, index))] ?? LEVELS[0]!;
}

/** Mobile layout shows fewer objects (≈ 10 instead of ≈ 22 at mid). */
export const MOBILE_INSTANCES = 0.75;

/** Party lights at full quality (direction §5, §8). */
export const LIGHT_COUNT = { desktop: 110, mobile: 40 } as const;

/** First live frames measured for the "persistently < 30 fps" fallback. */
export const PROBE_FRAMES = 30;
export const PROBE_MIN_FPS = 30;
