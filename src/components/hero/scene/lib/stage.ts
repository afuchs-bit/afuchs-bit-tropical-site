import { DIRECT, T } from "@/config/intro";
import type { FlavorSlug } from "@/content/flavors";
import { SWITCH_DURATION } from "../../flavor/switchFlavor";
import { heroStore, introTime, switchTime, type Mode } from "../../store";
import { inOutQuart, mix, outExpo, outQuart, progress } from "./easing";
import { view } from "./viewport";
import { waveBand, waveMaxDistance, waveRadius } from "./wave";

/**
 * Everything the scene animates, derived once per frame from the master
 * clock (introTime) and the switch clock (switchTime). Components read these
 * values in their own useFrame; nothing here is React state, nothing stores
 * time. Updated by <Director/> before every other frame callback.
 */

/** Rim glow HDR multiplier at rest; the bloom threshold is 1.0. */
export const RIM_REST = 2.2;

/**
 * Bubble 07 pops after its rim flash (T.rimFlash, shared with the DOM intro).
 * From here its droplets and the six amber points the memories left behind
 * become party lights.
 */
export const DROPLET_START = T.pop + T.rimFlash;
/** Hand-off lights travel from where the DOM left them to their places. */
export const DROPLET_FLIGHT = 1.4;

/**
 * First visit, on time. Everything derives from T: the loop runs from
 * T.sceneStart, but the Tinte covers the canvas until T.backdrop, so the
 * scene only has to be in its burst state by T.pop.
 */
const INTRO = {
  /**
   * A loop that goes live after this is late: the can should already be
   * rising, so the scene reveals like a return visit instead. Until then
   * the Tinte still covers the canvas and the cut is invisible.
   */
  lateAfter: T.can[0],
  /** The halo holds the over-bright disc from T.pop and settles while the can rises. */
  burst: T.can,
  /** Can opacity 0 → 1 over the first part of its rise. */
  canFadeIn: 0.18,
  rimPeak: 7,
  /** Rim glow back at rest this long after the can arrived. */
  rimSettle: 0.4,
  bloomBoost: 0.9,
  /** The other party lights fade in once the DOM light starts handing over, until the can is up. */
  lightsIn: [T.pop + T.handoffAfter, T.can[1]],
} as const;

/** Return visit (or a late intro): seconds since the loop went live, from DIRECT. */
const RETURN = {
  burst: 0.6,
  overBright: 0.8,
  canFadeIn: 0.12,
  rimPeak: 4,
  /** Rim peak this long after the can starts. */
  rimPeakAfter: 0.2,
  rimSettle: 0.3,
  bloomBoost: 0.6,
} as const;

/** Can turn and label mask within the 1.0 s switch (direction §7.4). */
const TURN: readonly [number, number] = [0.1, 0.9];
/** Reduced motion: the switch is a 200 ms cross-fade (direction §7). */
const STATIC_FADE = 0.2;

export const stage = {
  /** performance.now() of this frame. */
  now: 0,
  /** Seconds since the last frame (clamped, 0 in static mode). */
  dt: 0,
  /** Accumulated motion time for idle float and breathing; frozen in static mode. */
  elapsed: 0,
  mode: "intro" as Mode,
  motion: true,
  /** performance.now() of the first live frame (null while warming up). */
  liveAt: null as number | null,
  /** The loop went live after INTRO.lateAfter (slow load, or skipped early): reveal like a return visit. */
  late: false,

  /** Halo over-bright state left by bubble 07: 1 at the pop → 0. */
  burst: 0,
  /** Can reveal: eased rise 0 → 1, opacity 0 → 1, emissive white 1 → 0. */
  canRise: 1,
  canOpacity: 1,
  overBright: 0,
  rim: RIM_REST,
  /** Bloom intensity multiplier (boosted while the can steps out of the light). */
  bloom: 1,
  /** Seconds since the elements started their flight out of the light (Infinity = at rest). */
  elementsT: Number.POSITIVE_INFINITY,
  elementsSpan: 1,
  /** Party lights fade-in 0..1; seconds since the hand-off lights left the DOM (Infinity = none). */
  lightsIn: 1,
  dropletsT: Number.POSITIVE_INFINITY,

  /** Flavor before / after the current switch (equal at rest). */
  from: heroStore.get().flavor as FlavorSlug,
  to: heroStore.get().flavor as FlavorSlug,
  /** Seconds since the current switch started (Infinity = none). */
  switchS: Number.POSITIVE_INFINITY,
  /** Number of switches since mount; the can's base yaw is π per switch. */
  switches: 0,
  /** Eased can turn of the current switch 0 → 1. */
  turn: 1,
  /** Global light color mix old → new (OKLab), and the key light dim (1 → 0.7 → 1). */
  colorMix: 1,
  keyDim: 1,
  /** Label masks: far half ramps in, then the whole label (see Can). */
  labelHalf: 0,
  labelFill: 1,
  /** Environment cubemap follows the new flavor from mid-switch on. */
  envFlavor: heroStore.get().flavor as FlavorSlug,
  /** Wave front in canvas px; `waveOn` 0 when no wave runs. */
  wave: { x: 0, y: 0, radius: 0, band: 1, on: 0 },
  /** Reduced motion: the halo cross-fades globally instead of the wave. */
  haloFade: 1,
};

let last = 0;
let seenSwitch: number | null = null;

/** Called once on mount: a switch that ended before the scene existed is not replayed. */
export function resetStage(): void {
  const s = heroStore.get();
  last = performance.now();
  stage.elapsed = 0;
  stage.liveAt = null;
  stage.late = false;
  stage.switches = 0;
  stage.from = s.flavor;
  stage.to = s.flavor;
  stage.envFlavor = s.flavor;
  seenSwitch = switchTime() > SWITCH_DURATION ? s.switchedAt : null;
}

/** Marks the first live frame (after warm-up). */
export function markLive(now: number): void {
  if (stage.liveAt !== null) return;
  stage.liveAt = now;
  const s = heroStore.get();
  stage.late = s.mode === "intro" && introTime(now) > INTRO.lateAfter;
}

/*
 * The light cone is not animated here: the scene's cone is the CSS
 * backdrop's (CONE.rest), and the intro's 0 → 1 → 0 flash is the DOM light
 * on top of it (intro/LightHalo), so the two add up to 35 % at rest instead
 * of doubling during the hand-off.
 */
function reveal(now: number): void {
  const s = stage;
  if (s.mode === "static") {
    s.burst = 0;
    s.canRise = 1;
    s.canOpacity = 1;
    s.overBright = 0;
    s.rim = RIM_REST;
    s.bloom = 1;
    s.elementsT = Number.POSITIVE_INFINITY;
    s.lightsIn = 1;
    s.dropletsT = Number.POSITIVE_INFINITY;
    return;
  }

  if (s.mode === "intro" && !s.late) {
    const t = introTime(now);
    const [can0, can1] = T.can;
    const p = progress(t, can0, can1);
    s.burst = 1 - outQuart(progress(t, INTRO.burst[0], INTRO.burst[1]));
    s.canRise = outExpo(p);
    s.canOpacity = progress(t, can0, can0 + INTRO.canFadeIn);
    s.overBright = 1 - outQuart(p);
    s.rim =
      t < T.rimPeak
        ? RIM_REST + (INTRO.rimPeak - RIM_REST) * outQuart(progress(t, can0, T.rimPeak))
        : mix(INTRO.rimPeak, RIM_REST, inOutQuart(progress(t, T.rimPeak, can1 + INTRO.rimSettle)));
    s.bloom = 1 + INTRO.bloomBoost * Math.max(s.burst, s.overBright);
    s.elementsT = t - T.elements[0];
    s.elementsSpan = T.elements[1] - T.elements[0];
    s.lightsIn = outQuart(progress(t, INTRO.lightsIn[0], INTRO.lightsIn[1]));
    s.dropletsT = t - DROPLET_START;
    return;
  }

  // Return visit (or a late start): light on at once, can and elements out of the light.
  const d = s.liveAt === null ? 0 : (now - s.liveAt) / 1000;
  const [can0, can1] = DIRECT.can;
  const p = progress(d, can0, can1);
  s.burst = RETURN.burst * (1 - outQuart(p));
  s.canRise = outExpo(p);
  s.canOpacity = progress(d, can0, can0 + RETURN.canFadeIn);
  s.overBright = RETURN.overBright * (1 - outQuart(p));
  const peak = can0 + RETURN.rimPeakAfter;
  s.rim =
    d < peak
      ? RIM_REST + (RETURN.rimPeak - RIM_REST) * outQuart(progress(d, can0, peak))
      : mix(RETURN.rimPeak, RIM_REST, inOutQuart(progress(d, peak, can1 + RETURN.rimSettle)));
  s.bloom = 1 + RETURN.bloomBoost * s.overBright;
  s.elementsT = d - DIRECT.elements[0];
  s.elementsSpan = DIRECT.elements[1] - DIRECT.elements[0];
  s.lightsIn = outQuart(progress(d, DIRECT.elements[0], DIRECT.elements[1]));
  s.dropletsT = Number.POSITIVE_INFINITY;
}

function flavorSwitch(now: number): void {
  const st = heroStore.get();
  const s = stage;
  if (st.switchedAt !== seenSwitch && st.switchedAt !== null) {
    seenSwitch = st.switchedAt;
    s.switches++;
    s.from = st.prevFlavor ?? st.flavor;
    s.to = st.flavor;
  } else if (st.switchedAt === null) {
    s.from = st.flavor;
    s.to = st.flavor;
  }

  const sw = seenSwitch === null ? Number.POSITIVE_INFINITY : (now - seenSwitch) / 1000;
  s.switchS = sw;
  const done = sw >= SWITCH_DURATION;

  if (s.mode === "static") {
    const f = progress(sw, 0, STATIC_FADE);
    s.turn = 1;
    s.colorMix = f;
    s.keyDim = 1;
    s.labelHalf = 0;
    s.labelFill = f;
    s.haloFade = f;
    s.wave.on = 0;
    s.envFlavor = f >= 0.5 ? s.to : s.from;
  } else {
    s.turn = inOutQuart(progress(sw, TURN[0], TURN[1]));
    const light = progress(sw, 0.15, 0.85);
    s.colorMix = inOutQuart(light);
    s.keyDim = 1 - 0.3 * Math.sin(Math.PI * light);
    s.labelHalf = progress(sw, 0, TURN[0]);
    s.labelFill = progress(sw, TURN[1], SWITCH_DURATION);
    s.haloFade = done ? 1 : 0;
    s.envFlavor = sw >= 0.5 ? s.to : s.from;

    // Same front as the DOM accents (ui/signalWave.ts): viewport px.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ox = st.switchOrigin ? st.switchOrigin.x : view.left + view.halo.cx;
    const oy = st.switchOrigin ? st.switchOrigin.y : view.top + view.halo.cy;
    s.wave.x = ox - view.left;
    s.wave.y = oy - view.top;
    s.wave.band = waveBand(vw, vh);
    s.wave.radius = waveRadius(sw, waveMaxDistance(ox, oy, vw, vh), s.wave.band);
    s.wave.on = done ? 0 : 1;
  }

  if (done) {
    s.from = s.to;
    s.labelFill = 1;
    s.labelHalf = 0;
    s.colorMix = 1;
    s.keyDim = 1;
    s.turn = 1;
  }
}

/** Advances the stage to `now` (performance.now()). */
export function updateStage(now: number): void {
  const st = heroStore.get();
  stage.now = now;
  stage.mode = st.mode;
  stage.motion = st.mode !== "static";
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  stage.dt = stage.motion ? dt : 0;
  stage.elapsed += stage.dt;
  reveal(now);
  flavorSwitch(now);
}
