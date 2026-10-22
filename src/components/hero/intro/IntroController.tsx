"use client";

import { useEffect } from "react";
import { preloadScene } from "../SceneLoader";
import { heroStore } from "../store";
import { introSeen, isAgeVerified, isIntroRunning, prefersReducedMotion } from "./mode";
import { preloadIntroImages } from "./preload";
import { skipIntro } from "./skip";
import { attachController, ensureLoop, startTimeline, stopLoop } from "./timeline";
import { PRELOAD_IDLE_FALLBACK_MS, PRELOAD_IDLE_TIMEOUT_MS } from "./timing";

/**
 * Photos are fetched while the gate is up: right after mount, in the first
 * idle slot (low priority, so the gate question stays the LCP). Not after
 * the click: by then they must already be decoded.
 */
function schedulePhotoPreload(): () => void {
  const run = () => void preloadIntroImages();
  if (typeof window.requestIdleCallback === "function") {
    const idle = window.requestIdleCallback(run, { timeout: PRELOAD_IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(idle);
  }
  const timer = window.setTimeout(run, PRELOAD_IDLE_FALLBACK_MS);
  return () => window.clearTimeout(timer);
}

/**
 * Timeline driver, mounted once by the hero shell; renders nothing.
 * - Gate already answered this session: starts at once (direct or static),
 *   with fromGate false so the DOM shows its final state without a wipe.
 * - Otherwise waits in "gate" for onGateConfirmed() and preloads the photos
 *   (onGateConfirmed holds the grain phase if they are not decoded yet).
 * - Esc or a hidden tab skips a running intro (rAF pauses in background
 *   tabs, the phases would jump on return).
 */
export function IntroController(): null {
  useEffect(() => {
    const detach = attachController();
    if (heroStore.get().t0 === null && isAgeVerified()) {
      startTimeline(false);
      preloadScene();
    }
    ensureLoop();

    const unsubscribe = heroStore.subscribe(() => {
      const s = heroStore.get();
      if (s.t0 !== null && s.phase !== "rest") ensureLoop();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isIntroRunning(heroStore.get())) return;
      event.preventDefault();
      skipIntro();
    };
    const onVisibility = () => {
      if (document.hidden) skipIntro();
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibility);

    const cancelPreload =
      heroStore.get().phase === "gate" && !prefersReducedMotion() && !introSeen()
        ? schedulePhotoPreload()
        : null;

    return () => {
      detach();
      unsubscribe();
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelPreload?.();
      stopLoop();
    };
  }, []);

  return null;
}
