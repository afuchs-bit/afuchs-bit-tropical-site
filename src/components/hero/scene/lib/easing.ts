import { ease } from "@/design/tokens/motion";

/**
 * The motion tokens as plain functions for per-frame use. Same control
 * points as the CSS --ease-* tokens and Framer Motion, so canvas and DOM
 * move on identical curves. No bounce, no elastic (anti-patterns).
 */
export type Curve = (t: number) => number;

function cubicBezier([x1, y1, x2, y2]: readonly [number, number, number, number]): Curve {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Newton first (fast), bisection if the slope is too flat to trust.
    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-5) return sampleY(t);
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
      if (t < 0 || t > 1) break;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-5) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

export const outExpo = cubicBezier(ease.outExpo);
export const outQuart = cubicBezier(ease.outQuart);
export const inOutQuart = cubicBezier(ease.inOutQuart);

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Linear 0..1 progress of `t` through [start, end]. */
export function progress(t: number, start: number, end: number): number {
  return end <= start ? (t >= end ? 1 : 0) : clamp01((t - start) / (end - start));
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
