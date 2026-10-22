/**
 * The light wave of a flavor switch (direction §7.2). Shared by the halo
 * shader, the party lights and the DOM accents (ui/signalWave.ts): an accent
 * at distance D from the origin uses `--wave-delay: waveDelay(D, …)` so it
 * changes color exactly when the light reaches it. Pure module (no three);
 * the UI imports it, so its exports are a contract.
 *
 * The front runs at constant speed from WAVE.start to WAVE.end (seconds of
 * SWITCH_DURATION) and reaches the farthest viewport corner plus its band.
 * All distances are viewport CSS px.
 */
export const WAVE = { start: 0.15, end: 0.85 } as const;

/** Width of the soft front in px (the colors blend across it). */
export function waveBand(width: number, height: number): number {
  return 0.18 * Math.min(width, height);
}

/** Distance from the origin to the farthest corner of a width × height area. */
export function waveMaxDistance(ox: number, oy: number, width: number, height: number): number {
  const dx = Math.max(ox, width - ox);
  const dy = Math.max(oy, height - oy);
  return Math.hypot(dx, dy);
}

/** Front radius in px, `s` seconds after the switch started. */
export function waveRadius(s: number, maxDistance: number, band: number): number {
  const p = (s - WAVE.start) / (WAVE.end - WAVE.start);
  return (maxDistance + band) * (p < 0 ? 0 : p > 1 ? 1 : p);
}

/** Seconds after the switch start when the front reaches `distance` px. */
export function waveDelay(distance: number, maxDistance: number, band: number): number {
  const p = Math.min(1, Math.max(0, distance / (maxDistance + band)));
  return WAVE.start + (WAVE.end - WAVE.start) * p;
}

/** 0 = old flavor, 1 = new flavor at `distance` for a front at `radius`. */
export function waveMix(distance: number, radius: number, band: number): number {
  const x = (distance - (radius - band)) / band;
  const t = x < 0 ? 0 : x > 1 ? 1 : x;
  return 1 - t * t * (3 - 2 * t);
}
