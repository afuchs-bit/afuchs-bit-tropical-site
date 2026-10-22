/**
 * Shared hero geometry. The DOM light halo (intro hand-off) and the WebGL
 * halo shader must use the same center and radius, or the switch shows a
 * jump. Everything in viewport CSS px.
 */
import { MOBILE_BUBBLE_SCALE, type BubbleSpec } from "@/config/intro";

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

/** A memory bubble in viewport px: center, diameter, rise distance. */
export type BubbleBox = { x: number; y: number; d: number; rise: number };

/** Portrait phones use the mobile positions and larger bubbles. */
export function isPortraitStage(width: number, height: number): boolean {
  return isMobileLayout(width) && height >= width;
}

export function bubbleBox(spec: BubbleSpec, width: number, height: number): BubbleBox {
  const portrait = isPortraitStage(width, height);
  const vmin = Math.min(width, height) / 100;
  return {
    x: ((portrait ? spec.mx : spec.x) / 100) * width,
    y: ((portrait ? spec.my : spec.y) / 100) * height,
    d: spec.size * vmin * (portrait ? MOBILE_BUBBLE_SCALE : 1),
    rise: spec.rise * vmin,
  };
}

/**
 * Where a bubble's amber light sits on screen at the moment it pops (fully
 * risen, photo at scale 1.0). The DOM leaves a light point there and the
 * scene starts a party light from the same pixel, so the hand-off is seamless.
 */
export function amberPoint(spec: BubbleSpec, width: number, height: number): { x: number; y: number } {
  const b = bubbleBox(spec, width, height);
  return {
    x: b.x + (spec.amber[0] / 100 - 0.5) * b.d,
    y: b.y - b.rise + (spec.amber[1] / 100 - 0.5) * b.d,
  };
}
