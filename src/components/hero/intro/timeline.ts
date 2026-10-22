"use client";

import { T } from "@/config/intro";
import { playBass } from "../audio/audioEngine";
import { heroStore, introTime, phaseAtLeast } from "../store";
import { markIntroSeen, phaseAt, resolveMode } from "./mode";
import { BASS_TOLERANCE } from "./timing";

/**
 * The one master clock loop. It never stores time: it reads introTime() and
 * writes `phase` only when a threshold is crossed, so React re-renders a
 * handful of times per intro, not per frame. Stops itself at "rest".
 */
let frame = 0;
/** t0 of the timeline whose bass hit was already handled. */
let bassFor: number | null = null;
/** Mounted IntroControllers, i.e. a hero is on the page. */
let controllers = 0;

/** Called by IntroController on mount; returns the detach for its cleanup. */
export function attachController(): () => void {
  controllers += 1;
  return () => {
    controllers -= 1;
  };
}

export function hasController(): boolean {
  return controllers > 0;
}

function tick(): void {
  frame = 0;
  const s = heroStore.get();
  if (s.t0 === null || s.phase === "gate" || s.phase === "rest") return;

  const t = introTime();
  const next = phaseAt(s.mode, t);
  if (next !== s.phase && phaseAtLeast(next, s.phase)) {
    if (s.mode === "intro" && phaseAtLeast(next, "reveal") && !phaseAtLeast(s.phase, "reveal")) {
      markIntroSeen();
    }
    heroStore.set({ phase: next });
  }

  if (s.mode === "intro" && bassFor !== s.t0 && t >= T.bass) {
    bassFor = s.t0;
    // A stalled frame must not fire the hit seconds late.
    if (heroStore.get().sound && t - T.bass < BASS_TOLERANCE) playBass();
  }

  if (heroStore.get().phase !== "rest") frame = requestAnimationFrame(tick);
}

/** Idempotent: runs the loop while a timeline is between start and rest. */
export function ensureLoop(): void {
  if (frame !== 0 || typeof window === "undefined") return;
  const s = heroStore.get();
  if (s.t0 === null || s.phase === "gate" || s.phase === "rest") return;
  frame = requestAnimationFrame(tick);
}

export function stopLoop(): void {
  if (frame !== 0) cancelAnimationFrame(frame);
  frame = 0;
}

/**
 * Sets t0, mode and the first phase in one store write. `fromGate` = started
 * by the "Ja" click while the black gate still covers the page.
 */
export function startTimeline(fromGate: boolean): void {
  const mode = resolveMode(fromGate);
  heroStore.set({ t0: performance.now(), mode, fromGate, phase: phaseAt(mode, 0) });
  ensureLoop();
}
