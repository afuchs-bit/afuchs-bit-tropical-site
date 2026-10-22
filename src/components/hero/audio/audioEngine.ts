"use client";

import { storageKeys } from "@/config/intro";
import { readStorage, writeStorage } from "@/lib/storage";
import { heroStore } from "../store";

/**
 * WebAudio singleton (no React). The intro has exactly one sound: a
 * synthesized bass hit at T.bass, 0 KB of assets. Shorter than 3 s, so
 * WCAG 1.4.2 does not apply; the "TON" toggle still mutes it for good.
 */

/** Safari ≥ 16.4 (iOS): "ambient" respects the silent switch and mixes with music. */
type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };
type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Master level −12 dB. */
const MASTER_GAIN = 10 ** (-12 / 20);
/** Time constant of the mute ramp (s). */
const MUTE_RAMP = 0.05;

/** Bass hit: sine sweep 150 → 45 Hz with a short noise transient. */
const BASS = { from: 150, to: 45, length: 0.6, attack: 0.006, click: 0.03 } as const;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let suspendTimer: number | null = null;

// The stored preference wins over the store default (sound on).
if (typeof window !== "undefined") {
  muted = readStorage("local", storageKeys.sound) === "off";
  if (muted) heroStore.set({ sound: false });
}

export function isMuted(): boolean {
  return muted;
}

/**
 * Must run synchronously inside a user gesture (the "Ja" click, the TON
 * toggle): creating and resuming the context there is what unlocks output.
 */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  try {
    const session = (navigator as AudioSessionNavigator).audioSession;
    if (session) session.type = "ambient";

    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor({ latencyHint: "interactive" });
      master = ctx.createGain();
      master.gain.value = muted ? 0 : MASTER_GAIN;
      master.connect(ctx.destination);
    }

    if (muted) {
      void ctx.suspend().catch(() => {});
      return;
    }
    void ctx.resume().catch(() => {});
    // Old iOS only unlocks after a buffer actually starts inside the gesture.
    const silent = ctx.createBufferSource();
    silent.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    silent.connect(ctx.destination);
    silent.start(0);
  } catch {
    // No audio is fine: the intro is complete without it.
  }
}

/** The bass hit at T.bass. Silent when muted or never unlocked. */
export function playBass(): void {
  if (!ctx || !master || muted) return;
  try {
    if (ctx.state !== "running") void ctx.resume().catch(() => {});
    const now = ctx.currentTime + 0.01;
    const end = now + BASS.length;

    // Body: sine sweep with a fast attack and an exponential tail.
    const body = ctx.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(BASS.from, now);
    body.frequency.exponentialRampToValueAtTime(BASS.to, end);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(1, now + BASS.attack);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, end);
    body.connect(bodyGain).connect(master);

    // Second harmonic, quiet: keeps the hit audible on laptop and phone speakers.
    const overtone = ctx.createOscillator();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(BASS.from * 2, now);
    overtone.frequency.exponentialRampToValueAtTime(BASS.to * 2, end);
    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.18, now + BASS.attack);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + BASS.length * 0.5);
    overtone.connect(overtoneGain).connect(master);

    // Transient: a few ms of low-passed noise, the "click" of the hit.
    const frames = Math.max(1, Math.floor(ctx.sampleRate * BASS.click));
    const noise = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
    const click = ctx.createBufferSource();
    click.buffer = noise;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2200;
    const clickGain = ctx.createGain();
    clickGain.gain.value = 0.35;
    click.connect(lowpass).connect(clickGain).connect(master);

    body.start(now);
    overtone.start(now);
    click.start(now);
    body.stop(end + 0.05);
    overtone.stop(end + 0.05);

    body.onended = () => {
      for (const node of [body, bodyGain, overtone, overtoneGain, click, lowpass, clickGain]) {
        node.disconnect();
      }
    };
  } catch {
    /* ignore */
  }
}

/**
 * Persists the choice and mirrors it into the store. Unmuting is a click, so
 * it may create the context if the visitor never passed the gate this session.
 */
export function setMuted(next: boolean): void {
  muted = next;
  writeStorage("local", storageKeys.sound, next ? "off" : "on");
  heroStore.set({ sound: !next });

  if (!next && !ctx) {
    unlockAudio();
    return;
  }
  if (!ctx || !master) return;

  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setTargetAtTime(next ? 0 : MASTER_GAIN, t, MUTE_RAMP);

  if (suspendTimer !== null) window.clearTimeout(suspendTimer);
  suspendTimer = null;
  if (next) {
    // Suspend after the ramp has settled (5 time constants), saves battery.
    suspendTimer = window.setTimeout(() => {
      suspendTimer = null;
      if (muted) void ctx?.suspend().catch(() => {});
    }, MUTE_RAMP * 5 * 1000);
  } else {
    void ctx.resume().catch(() => {});
  }
}
