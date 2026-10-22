"use client";

import { DIRECT, INTRO_VERSION, T, bubbles, storageKeys } from "@/config/intro";
import { readStorage, writeStorage } from "@/lib/storage";
import type { HeroState, Mode, Phase } from "../store";

/**
 * Which timeline runs, and which phase belongs to a point in time. Pure
 * reads of storage and media queries; the store is written elsewhere.
 */

/** Dev overrides (?intro=1|0, ?motion=reduce) never reach production. */
function devParam(name: string): string | null {
  if (process.env.NODE_ENV === "production") return null;
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

export function prefersReducedMotion(): boolean {
  if (devParam("motion") === "reduce") return true;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** Blocked storage counts as a first visit: skip is always possible. */
export function introSeen(): boolean {
  const forced = devParam("intro");
  if (forced === "1") return false;
  if (forced === "0") return true;
  const value = readStorage("local", storageKeys.introSeen);
  return value !== null && value.startsWith(`${INTRO_VERSION}:`);
}

/** Written on entering "reveal" or on skip: closing the tab mid-bubbles replays it. */
export function markIntroSeen(): void {
  writeStorage("local", storageKeys.introSeen, `${INTRO_VERSION}:${new Date().toISOString()}`);
}

/** Gate already answered in this session (head script or provider wrote it). */
export function isAgeVerified(): boolean {
  return (
    readStorage("session", storageKeys.ageGate) === "verified" ||
    document.documentElement.dataset.age === "verified"
  );
}

/**
 * Reduced motion → static. Without the gate click there is no black stage
 * to hide the DOM behind, so a timeline started on mount is never "intro".
 */
export function resolveMode(fromGate: boolean): Mode {
  if (prefersReducedMotion()) return "static";
  if (!fromGate || introSeen()) return "direct";
  return "intro";
}

const firstBubble = bubbles[0]?.start ?? T.grain;

export function phaseAt(mode: Mode, t: number): Phase {
  if (mode === "static") return "rest";
  if (mode === "direct") return t >= DIRECT.rest ? "rest" : "reveal";
  if (t >= T.rest) return "rest";
  if (t >= T.can[0]) return "reveal";
  if (t >= T.pop) return "burst";
  if (t >= firstBubble) return "bubbles";
  return "grain";
}

/** True while the intro overlay owns the screen (grain … reveal). */
export function isIntroRunning(s: HeroState): boolean {
  return s.mode === "intro" && s.phase !== "gate" && s.phase !== "rest";
}
