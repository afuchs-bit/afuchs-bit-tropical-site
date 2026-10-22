"use client";

import { useEffect, useState } from "react";
import { heroStore, introTime, useHero, type HeroState } from "../store";

/**
 * DOM side of the master clock. Every UI reveal waits for a point on the
 * intro clock (`introTime`) or the switch clock (`switchTime`); one shared
 * scheduler checks all pending jobs, so a skip that moves t0 moves every
 * reveal with it.
 *
 * It wakes on two sources: a rAF loop (follows clock jumps such as a skip)
 * and one timer aimed at the earliest due job, derived from the same clock.
 * rAF alone is not enough: it runs at 1–2 fps in a throttled or busy page,
 * and every hop on it made a 0.5 s cue land seconds late.
 */
type Clock = () => number;
type Job = { clock: Clock; at: number; run: () => void };

const jobs = new Set<Job>();
let frame = 0;
let timer = 0;

function check(): void {
  for (const job of jobs) {
    if (job.clock() >= job.at) {
      jobs.delete(job);
      job.run();
    }
  }
}

function arm(): void {
  if (timer !== 0) window.clearTimeout(timer);
  timer = 0;
  if (jobs.size === 0) {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
    return;
  }
  if (frame === 0) frame = requestAnimationFrame(onFrame);
  let wait = Number.POSITIVE_INFINITY;
  for (const job of jobs) wait = Math.min(wait, job.at - job.clock());
  // A clock that is not running yet (t0 null → 0) still gets a finite wait;
  // NaN or Infinity never arms the timer, the rAF loop covers those.
  if (Number.isFinite(wait)) timer = window.setTimeout(onTimer, Math.max(0, wait * 1000) + 1);
}

function onFrame(): void {
  frame = 0;
  check();
  arm();
}

function onTimer(): void {
  timer = 0;
  check();
  arm();
}

/** Runs `run` once `clock()` reaches `at` (seconds). Returns a cancel function. */
export function scheduleAt(clock: Clock, at: number, run: () => void): () => void {
  const job: Job = { clock, at, run };
  jobs.add(job);
  arm();
  return () => {
    if (jobs.delete(job)) arm();
  };
}

/**
 * final  = render the end state, no motion (SSR, reloads, reduced motion)
 * hidden = waiting for its time, the black stage still covers the page
 * play   = its time came: run the signature motion
 * skip   = the intro was skipped before its time: 400 ms cross-fade
 */
export type RevealState = "final" | "hidden" | "play" | "skip";

/** Skipping only exists in intro mode: rest arrived before this reveal's time. */
function wasSkipped(s: HeroState): boolean {
  return s.mode === "intro" && s.phase === "rest";
}

/**
 * Reveal state for one UI group. `at` is its time in the intro (T.*),
 * `directAt` its time on a return visit (DIRECT.*). Only a timeline that
 * started from the gate click hides anything. Once revealed it stays
 * revealed: a skip moves t0, but must not restart what already played.
 *
 * Only a group that was mounted before the timeline started can be hidden:
 * one that mounts later (client navigation back to "/", a sheet opened after
 * the intro) renders final at once instead of fading in. The check runs in
 * the state initializer, which reads the live store on the client; during
 * hydration t0 is still null there, so SSR and the first render agree.
 */
export function useIntroReveal(at: number, directAt: number): RevealState {
  const fromGate = useHero((s) => s.fromGate);
  const mode = useHero((s) => s.mode);
  const t0 = useHero((s) => s.t0);
  const skipped = useHero(wasSkipped);
  const [mountedBeforeStart] = useState(() => heroStore.get().t0 === null);
  const armed = mountedBeforeStart && fromGate && t0 !== null && mode !== "static";
  const target = mode === "direct" ? directAt : at;
  const [fired, setFired] = useState<"play" | "skip" | null>(null);

  useEffect(() => {
    if (!armed) return;
    return scheduleAt(introTime, target, () => {
      setFired((prev) => prev ?? (wasSkipped(heroStore.get()) ? "skip" : "play"));
    });
  }, [armed, t0, target]);

  if (!armed) return "final";
  if (fired) return fired;
  return skipped ? "skip" : "hidden";
}
