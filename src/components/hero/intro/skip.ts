"use client";

import { T } from "@/config/intro";
import { heroStore } from "../store";
import { isIntroRunning, markIntroSeen } from "./mode";

/**
 * Jumps the timeline to its end: t0 moves back so introTime() === T.rest.
 * Every consumer then renders its final state; the IntroStage overlay fades
 * out over STAGE_FADE to hide the jump. Esc, the skip button and a hidden tab
 * all land here.
 */
export function skipIntro(): void {
  const s = heroStore.get();
  if (!isIntroRunning(s)) return;
  markIntroSeen();
  heroStore.set({ t0: performance.now() - T.rest * 1000, phase: "rest" });
}
