"use client";

import { FIRST_BUBBLE } from "@/config/intro";
import { heroStore, introTime } from "../store";
import { introImagesSettled, preloadIntroImages } from "./preload";
import { DECODE_HOLD_LEAD, DECODE_HOLD_MAX } from "./timing";

/** Intro time at which an undecoded photo set holds the timeline: deep in the grain. */
const HOLD_AT = FIRST_BUBBLE - DECODE_HOLD_LEAD;

/**
 * Called right after "Ja" started an intro. If the photos are not all decoded
 * by HOLD_AT, the timeline stays in the grain phase (black with grain, nothing
 * moves) by moving t0 forward: once by DECODE_HOLD_MAX, then back to "now at
 * HOLD_AT" the moment the last photo is decoded. Net shift = the wait, capped
 * at DECODE_HOLD_MAX; after the cap the bubbles start anyway and every photo
 * that is still missing at its bubble's start stays a glass bubble.
 *
 * Everything on the intro clock follows a t0 shift (scene, UI reveals, the
 * stage's bubble layers); only the gate-out (light seed, Skip/TON fade-in)
 * keeps the click time. A skip or a late timer leaves t0 alone.
 */
export function holdForPhotos(): void {
  if (introImagesSettled()) return;
  const t0 = heroStore.get().t0;
  if (t0 === null) return;
  let held: number | null = null;
  let timer = 0;

  const engage = () => {
    timer = 0;
    const s = heroStore.get();
    if (introImagesSettled() || s.t0 !== t0 || s.phase !== "grain") return;
    // A starved main thread fired the timer too late: bubbles run, glass fallback.
    if (introTime() >= FIRST_BUBBLE) return;
    held = t0 + DECODE_HOLD_MAX * 1000;
    heroStore.set({ t0: held });
  };

  const release = () => {
    if (timer !== 0) window.clearTimeout(timer);
    timer = 0;
    if (held === null || heroStore.get().t0 !== held) return;
    const now = performance.now();
    // Past the cap the timeline already runs on its own.
    if (introTime(now) >= HOLD_AT) return;
    heroStore.set({ t0: now - HOLD_AT * 1000 });
  };

  timer = window.setTimeout(engage, Math.max(0, t0 + HOLD_AT * 1000 - performance.now()));
  void preloadIntroImages({ urgent: true }).then(release);
}
