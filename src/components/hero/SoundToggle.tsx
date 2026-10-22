"use client";

import { useEffect, useRef } from "react";
import { heroCopy } from "@/content/hero";
import { cn } from "@/lib/cn";
import { setMuted } from "./audio/audioEngine";
import { controlClass } from "./intro/controlStyle";
import { prefersReducedMotion } from "./intro/mode";
import { easing } from "./intro/waapi";
import { useHero } from "./store";

/** Resting heights of the three bars (scaleY) while sound is on. */
const BARS = [0.55, 1, 0.75];
/** Muted: flat bars. */
const MUTED = 0.3;

/**
 * "TON" toggle: aria-pressed mirrors the store, the choice persists
 * (localStorage via the audio engine). The bars only move while sound is on
 * and motion is allowed; mounted in the intro (bottom right) and in the hero.
 */
export function SoundToggle({ className }: { className?: string }) {
  const sound = useHero((s) => s.sound);
  const staticMode = useHero((s) => s.mode === "static");
  const bars = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = bars.current;
    if (!el || !sound || staticMode || prefersReducedMotion()) return;
    const animations = Array.from(el.children).map((bar, i) =>
      bar.animate([{ transform: "scaleY(0.35)" }, { transform: "scaleY(1)" }], {
        duration: 900 + i * 170,
        delay: -i * 260,
        iterations: Number.POSITIVE_INFINITY,
        direction: "alternate",
        easing: easing.inOutQuart,
      }),
    );
    return () => animations.forEach((a) => a.cancel());
  }, [sound, staticMode]);

  return (
    <button
      type="button"
      aria-pressed={sound}
      onClick={() => setMuted(sound)}
      className={cn(controlClass, className)}
    >
      <span ref={bars} aria-hidden="true" className="flex h-3 items-end gap-[2px]">
        {BARS.map((height, i) => (
          <span
            key={i}
            className={cn(
              "block h-3 w-[2px] origin-bottom rounded-full transition-colors duration-300",
              sound ? "bg-paper" : "bg-paper-40",
            )}
            style={{ transform: `scaleY(${sound ? height : MUTED})` }}
          />
        ))}
      </span>
      <span>{heroCopy.sound}</span>
    </button>
  );
}
