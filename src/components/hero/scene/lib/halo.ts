/**
 * The CSS night of HeroBackdrop.tsx, as numbers for the WebGL halo shader.
 * The canvas covers that CSS layer, so both must draw the same light: the
 * same stops (multiples of haloGeometry().r), the same vignette ellipse and
 * the same cone. Pure module (no three); HeroBackdrop imports HALO_STOPS,
 * so the CSS and the shader read one source.
 *
 *   halo      core 0 → mid 0.75 → deep 1.4 → edge 2.6, interpolated in OKLab
 *   vignette  ellipse 120 % × 95 % at the halo center, Tinte 0 → 55 % from 52 % to 100 %
 *   cone      apex 50 % / −18 %, Signal 100 % → 45 % at ±7°, gone at ±15°,
 *             masked to 0 at 80 % of the height, opacity 35 %, screen
 */
export const HALO_STOPS = { core: 0, mid: 0.75, deep: 1.4, edge: 2.6 } as const;

export const VIGNETTE = { rx: 1.2, ry: 0.95, from: 0.52, alpha: 0.55 } as const;

export const CONE = {
  apexY: -0.18,
  innerDeg: 7,
  innerAlpha: 0.45,
  outerDeg: 15,
  maskEnd: 0.8,
  /** Opacity, always (the intro's 0 → 1 → 0 flash is the DOM light added on top). */
  rest: 0.35,
} as const;

/**
 * The last bubble's light disc (intro/light.ts), which the DOM halo shows at T.pop.
 * The WebGL halo starts from it (uBurst) so the hand-off has no jump.
 * Stops in multiples of r; the disc then falls off to transparent at 1.5 r.
 */
export const DISC = { signalMix: 0.42, coreAt: 0.62, edgeMix: 0.68, knee: 1.175, end: 1.5, kneeAlpha: 0.55 } as const;
