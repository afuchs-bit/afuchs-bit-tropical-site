"use client";

import { unlockAudio } from "../audio/audioEngine";
import { preloadScene } from "../SceneLoader";
import { heroStore } from "../store";
import { holdForPhotos } from "./hold";
import { preloadIntroImages } from "./preload";
import { hasController, startTimeline } from "./timeline";

/**
 * Called synchronously inside the "Ja" click handler: the click is the user
 * gesture that unlocks audio, and it starts the one master clock (t0).
 * Mode: reduced motion → static · intro seen → direct · else intro.
 *
 * The photos have been loading since the gate mounted; any that are still
 * missing get high priority now, and the grain phase waits for them
 * (holdForPhotos, at most DECODE_HOLD_MAX).
 *
 * Without a hero on the page (the gate also guards e.g. a 404) nothing
 * starts: the controller begins a direct timeline when the hero mounts, and
 * an intro nobody saw is never marked as seen.
 */
export function onGateConfirmed(): void {
  unlockAudio();
  // A second click (or a timeline already started on mount) keeps its t0.
  if (hasController() && heroStore.get().t0 === null) {
    startTimeline(true);
    if (heroStore.get().mode === "intro") {
      void preloadIntroImages({ urgent: true });
      holdForPhotos();
    }
  }
  preloadScene();
}
