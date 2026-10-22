/**
 * Intro micro-timings that src/config/intro.ts does not carry. The bubble
 * cut (T.bubbleIn / T.bubbleOut), the pop and the intro/scene hand-off live
 * in T, both sides read them there; these are DOM-only details. Kept in one
 * place so tuning stays a one-line change.
 */
import { T } from "@/config/intro";

/** Droplets of a memory bubble: as quick as the cut. */
export const MEMORY_DROPLET_LIFE = 0.24;
/** Droplets of the final bubble fly out and fade (the scene turns its own into party lights). */
export const DROPLET_LIFE = 0.36;
/** Overlay fade on skip and at the end of the intro. */
export const STAGE_FADE = 0.4;

/** Final label: columns roll "07 · 00:00" → FINAL_LABEL right after the pop … */
export const LABEL_ROLL = 0.38;
/** … each column in this long … */
export const LABEL_ROLL_COLUMN = 0.2;
/** … while it glides to the hero's 07 ring, starting this long after the pop … */
export const LABEL_FLIGHT_DELAY = 0.12;
export const LABEL_FLIGHT = 0.6;
/** … and fades out while the UI's ring fades in (T.header). */
export const LABEL_FADE = 0.4;

/**
 * Amber trail: the six light points go out in place once the scene takes
 * them over. The Tinte still covers the canvas until the end of T.backdrop,
 * so the points cross-fade with it (inOutQuart) instead of blinking off and
 * reappearing as WebGL lights; the scene holds each light on its pixel for
 * that span …
 */
export const TRAIL_FADE = T.backdrop[1] - (T.pop + T.rimFlash);
/** … or, without a ready scene, drift into the halo while they fade. */
export const TRAIL_DRIFT = 0.6;

/** Photos not decoded at "Ja": the grain phase waits for them, at most this long. */
export const DECODE_HOLD_MAX = 1.2;
/** The wait takes effect this long before the first bubble (timer slack). */
export const DECODE_HOLD_LEAD = 0.2;

/** A bass hit that is later than this (rAF stalled) is dropped. */
export const BASS_TOLERANCE = 0.25;
/** Idle fallback for the photo preload where requestIdleCallback is missing. */
export const PRELOAD_IDLE_FALLBACK_MS = 300;
/** requestIdleCallback timeout: the photos must be in before anyone clicks "Ja". */
export const PRELOAD_IDLE_TIMEOUT_MS = 800;
