"use client";

import { useEffect, type RefObject } from "react";
import { WAVE, waveBand, waveDelay, waveMaxDistance } from "../scene/lib/wave";
import { heroStore } from "../store";

/**
 * Flavor switch light wave in the DOM (direction §7.3). The halo shader runs
 * the wave from the clicked card between WAVE.start and WAVE.end; accent
 * elements with the `signal-wave` utility get a `--wave-delay` from their
 * distance to that origin, computed with the shader's own front
 * (scene/lib/wave.ts), so their Signal turns exactly when the light reaches
 * them. Viewport px on both sides.
 */
export function waveDelayMs(el: Element, origin: { x: number; y: number } | null): number {
  if (!origin) return WAVE.start * 1000;
  const r = el.getBoundingClientRect();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const distance = Math.hypot(r.left + r.width / 2 - origin.x, r.top + r.height / 2 - origin.y);
  return waveDelay(distance, waveMaxDistance(origin.x, origin.y, w, h), waveBand(w, h)) * 1000;
}

/**
 * Keeps `--wave-delay` on the element current. The store notifies before
 * switchFlavor() writes the new palette onto <html>, so the delay is in
 * place when the transition starts.
 */
export function useSignalWave(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    let last = heroStore.get().switchedAt;
    const unsubscribe = heroStore.subscribe(() => {
      const { switchedAt, switchOrigin } = heroStore.get();
      if (switchedAt === last) return;
      last = switchedAt;
      const el = ref.current;
      if (!el) return;
      el.style.setProperty("--wave-delay", `${Math.round(waveDelayMs(el, switchOrigin))}ms`);
    });
    return () => {
      unsubscribe();
    };
  }, [ref]);
}
