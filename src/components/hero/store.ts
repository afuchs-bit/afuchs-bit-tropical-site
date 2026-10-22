"use client";

import { useSyncExternalStore } from "react";
import { defaultFlavor, type FlavorSlug } from "@/content/flavors";
import type { SheetId } from "@/content/hero";

/**
 * Hero state shared by the DOM layer and the R3F scene. A module store (not
 * React context) so the Canvas tree, rAF loops and plain modules read the
 * same values without a context bridge and without re-rendering per frame.
 *
 * Time is never stored per frame: read it with `introTime()`.
 */
export type Phase = "gate" | "grain" | "bubbles" | "burst" | "reveal" | "rest";

/** intro = first visit · direct = intro seen before · static = reduced motion */
export type Mode = "intro" | "direct" | "static";

export type Quality = "high" | "mid" | "low";

export type HeroState = {
  phase: Phase;
  mode: Mode;
  /** performance.now() at the start of the timeline ("Ja" click or mount). */
  t0: number | null;
  /**
   * True when the timeline started from the gate click, i.e. while the black
   * stage covered the page. Only then may DOM text start hidden and wipe in;
   * a same-session reload shows the DOM final state at once (no flash).
   */
  fromGate: boolean;
  /** Scene compiled and first frame rendered. */
  sceneReady: boolean;
  /** No WebGL2 or persistently < 30 fps: CSS backdrop + poster only. */
  sceneFailed: boolean;
  flavor: FlavorSlug;
  prevFlavor: FlavorSlug | null;
  /** performance.now() of the last flavor switch. */
  switchedAt: number | null;
  /** Viewport px where the switch started (card / chip), origin of the light wave. */
  switchOrigin: { x: number; y: number } | null;
  sound: boolean;
  quality: Quality;
  sheet: SheetId | null;
};

const initial: HeroState = {
  phase: "gate",
  mode: "intro",
  t0: null,
  fromGate: false,
  sceneReady: false,
  sceneFailed: false,
  flavor: defaultFlavor.slug,
  prevFlavor: null,
  switchedAt: null,
  switchOrigin: null,
  sound: true,
  quality: "high",
  sheet: null,
};

let state: HeroState = initial;
const listeners = new Set<() => void>();

export const heroStore = {
  get: (): HeroState => state,
  set(partial: Partial<HeroState> | ((s: HeroState) => Partial<HeroState>)): void {
    const next = typeof partial === "function" ? partial(state) : partial;
    let changed = false;
    for (const key in next) {
      if (!Object.is(next[key as keyof HeroState], state[key as keyof HeroState])) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** React hook; pass a selector that returns a primitive or stable reference. */
export function useHero<T>(selector: (s: HeroState) => T): T {
  return useSyncExternalStore(
    heroStore.subscribe,
    () => selector(state),
    () => selector(initial),
  );
}

/** Seconds since t0; 0 before the timeline started. */
export function introTime(now: number = performance.now()): number {
  return state.t0 === null ? 0 : (now - state.t0) / 1000;
}

/** Seconds since the last flavor switch; Infinity if none. */
export function switchTime(now: number = performance.now()): number {
  return state.switchedAt === null ? Number.POSITIVE_INFINITY : (now - state.switchedAt) / 1000;
}

const phaseOrder: Phase[] = ["gate", "grain", "bubbles", "burst", "reveal", "rest"];

/** True once the timeline reached (or passed) the given phase. */
export function phaseAtLeast(current: Phase, target: Phase): boolean {
  return phaseOrder.indexOf(current) >= phaseOrder.indexOf(target);
}
