/**
 * Shared hero geometry. The DOM light halo (intro hand-off) and the WebGL
 * halo shader must use the same center and radius, or the switch shows a
 * jump. Everything in viewport CSS px.
 */
import type { BubbleSpec } from "@/config/intro";

export const MOBILE_BREAKPOINT = 768;

/** Portrait mobile: the scene ends at 62svh, the DOM rest zone follows. */
export const MOBILE_SCENE_HEIGHT = 0.62;

export function isMobileLayout(width: number): boolean {
  return width < MOBILE_BREAKPOINT;
}

export type HaloGeometry = { cx: number; cy: number; r: number };

export function haloGeometry(width: number, height: number): HaloGeometry {
  if (isMobileLayout(width)) {
    const sceneH = height * MOBILE_SCENE_HEIGHT;
    return { cx: width / 2, cy: sceneH * 0.52, r: Math.min(width, sceneH) * 0.42 };
  }
  // 70vmin diameter, centered behind the can.
  return { cx: width / 2, cy: height / 2, r: Math.min(width, height) * 0.35 };
}

/** Portrait phones (used for the stage layout). */
export function isPortraitStage(width: number, height: number): boolean {
  return isMobileLayout(width) && height >= width;
}

/** Afterimages stay this far inside the viewport (share of each side). */
const AMBER_MARGIN = 0.06;

/**
 * Where a memory's amber light sits on screen. Memories are full-screen POV
 * photos: the square photo covers the viewport (side max(w, h), centered).
 * A light that falls outside the visible part (phones crop left and right)
 * is pulled to the edge; on portrait phones it also stays above 62svh,
 * inside the canvas that takes the afterimages over as party lights. The DOM
 * draws the afterimage here and the scene starts a party light from the same
 * pixel, so the hand-off is seamless.
 */
export function amberPoint(spec: BubbleSpec, width: number, height: number): { x: number; y: number } {
  const side = Math.max(width, height);
  const x = width / 2 + (spec.amber[0] / 100 - 0.5) * side;
  const y = height / 2 + (spec.amber[1] / 100 - 0.5) * side;
  const maxY = isMobileLayout(width) ? height * MOBILE_SCENE_HEIGHT - 12 : height * (1 - AMBER_MARGIN);
  return {
    x: Math.min(width * (1 - AMBER_MARGIN), Math.max(width * AMBER_MARGIN, x)),
    y: Math.min(maxY, Math.max(height * AMBER_MARGIN, y)),
  };
}
