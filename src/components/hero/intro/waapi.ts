"use client";

import { ease } from "@/design/tokens/motion";

/**
 * Native Web Animations scheduled on the intro clock. Only transform and
 * opacity are animated, so the bubbles stay on the compositor while the main
 * thread parses and compiles the 3D chunk.
 */

const bezier = (p: readonly [number, number, number, number]) => `cubic-bezier(${p.join(", ")})`;

/** CSS easing strings for WAAPI, identical to the --ease-* tokens. */
export const easing = {
  linear: "linear",
  outExpo: bezier(ease.outExpo),
  outQuart: bezier(ease.outQuart),
  inOutQuart: bezier(ease.inOutQuart),
} as const;

/** A keyframe at an absolute intro time (seconds since t0). */
export type TimedFrame = Keyframe & { t: number };

/**
 * Plays keyframes given in absolute intro seconds. The animation's start
 * time is pinned to the master clock (document.timeline shares the time
 * origin of performance.now()), so an element mounted late, or re-laid out
 * on resize, joins the running animation at the right point instead of
 * starting over, and no frame of pending-start drift creeps in.
 *
 * Default fill is "forwards": before its first frame the element keeps its
 * CSS base state (usually opacity 0), afterwards it holds the last frame.
 */
export function track(
  el: Element | null,
  t0: number,
  frames: TimedFrame[],
  options: { fill?: FillMode; iterations?: number } = {},
): Animation | null {
  const first = frames[0];
  const last = frames[frames.length - 1];
  if (!el || !first || !last || typeof el.animate !== "function") return null;

  const from = first.t;
  const span = Math.max(last.t - from, 0.001);
  let previous = 0;
  const keyframes = frames.map(({ t, ...frame }) => {
    // Offsets must never decrease, even if config times are tuned into overlap.
    const offset = Math.min(1, Math.max(previous, (t - from) / span));
    previous = offset;
    return { ...frame, offset };
  });

  const animation = el.animate(keyframes, {
    duration: span * 1000,
    fill: options.fill ?? "forwards",
    iterations: options.iterations ?? 1,
  });
  animation.startTime = t0 + from * 1000;
  return animation;
}

/** Cancels every animation in the list (effect cleanup). */
export function cancelAll(animations: Array<Animation | null>): void {
  for (const animation of animations) animation?.cancel();
}
