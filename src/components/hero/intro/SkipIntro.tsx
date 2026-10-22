"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { T } from "@/config/intro";
import { heroCopy } from "@/content/hero";
import { cn } from "@/lib/cn";
import { heroStore } from "../store";
import { controlClass } from "./controlStyle";
import { skipIntro } from "./skip";
import { track } from "./waapi";

/** Progress ring: 18px, 1px stroke. */
const RING = 18;
const RADIUS = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * "INTRO ÜBERSPRINGEN", visible for the whole intro. A 1px ring fills over
 * the intro's length (T.rest) on the same clock. Takes focus when it mounts
 * right after "Ja", so Enter skips; Esc skips anywhere (IntroController).
 */
export function SkipIntro({ className }: { className?: string } = {}) {
  const button = useRef<HTMLButtonElement>(null);
  const progress = useRef<SVGCircleElement>(null);
  // The ring keeps its own t0: a skip moves the store's t0 to the end.
  const [t0] = useState(() => heroStore.get().t0 ?? performance.now());

  useEffect(() => {
    button.current?.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    const ring = track(progress.current, t0, [
      { t: 0, strokeDashoffset: `${CIRCUMFERENCE}px` },
      { t: T.rest, strokeDashoffset: "0px" },
    ]);
    return () => ring?.cancel();
  }, [t0]);

  return (
    <button ref={button} type="button" onClick={skipIntro} className={cn(controlClass, className)}>
      <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} aria-hidden="true" className="-rotate-90">
        <circle cx={RING / 2} cy={RING / 2} r={RADIUS} fill="none" strokeWidth={1} className="stroke-paper-16" />
        <circle
          ref={progress}
          cx={RING / 2}
          cy={RING / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={1}
          className="stroke-paper"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <span>{heroCopy.skip}</span>
    </button>
  );
}
