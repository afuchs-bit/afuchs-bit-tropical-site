"use client";

import { useLayoutEffect, useRef } from "react";
import { T } from "@/config/intro";
import { cancelAll, easing, track } from "./waapi";

/** The 6px light point: Papier core, a little Signal around it. */
const SEED = 24;
const CORE = 3;

/** Where the gate question sits; the light gathers there. Fallback: screen center. */
function questionBox(): { x: number; y: number; width: number } {
  const el = document.getElementById("age-gate-title");
  const rect = el?.getBoundingClientRect();
  if (rect && rect.width > 0) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2, width: 0 };
}

/**
 * Lichtkeim (T.gateOut): while the gate question shrinks away, its light
 * gathers on the question's center as a streak, condenses into a 6px point,
 * rises slightly and goes out. Drawn in its own layer above the fading gate
 * (the stage below is still covered by the gate's Tinte at this moment).
 * One transform list in every frame, so it interpolates without matrices.
 */
export function LightSeed({ t0 }: { t0: number }) {
  const seed = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = seed.current;
    if (!el) return;
    // Measured once, at the click: the question is about to scale away.
    const { x, y, width } = questionBox();
    el.style.left = `${x - SEED / 2}px`;
    el.style.top = `${y - SEED / 2}px`;

    const [from, to] = T.gateOut;
    const span = to - from;
    // The streak starts at half the question's width and follows it inwards.
    const streak = Math.max(1, (width * 0.5) / SEED);
    const frame = (dy: number, sx: number, sy: number) => `translate3d(0, ${dy}px, 0) scale(${sx}, ${sy})`;
    const animations = [
      track(el, t0, [
        { t: from, transform: frame(0, streak, 1), opacity: 0, easing: easing.inOutQuart },
        { t: from + span * 0.4, transform: frame(-4, Math.max(1, streak * 0.4), 1), opacity: 0.9, easing: easing.outExpo },
        { t: from + span * 0.65, transform: frame(-6, 1, 1), opacity: 1, easing: easing.outQuart },
        { t: to, transform: frame(-14, 0.6, 0.6), opacity: 0 },
      ]),
    ];
    return () => cancelAll(animations);
  }, [t0]);

  return (
    <div
      ref={seed}
      className="absolute left-1/2 top-1/2 rounded-full opacity-0"
      style={{
        width: SEED,
        height: SEED,
        background: `radial-gradient(circle closest-side, var(--paper) 0 ${CORE}px, color-mix(in oklab, var(--signal) 70%, transparent) ${
          CORE + 1.5
        }px, transparent 100%)`,
      }}
    />
  );
}
