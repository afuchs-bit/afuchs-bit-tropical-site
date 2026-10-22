"use client";

import { m } from "framer-motion";
import { useLayoutEffect, useRef, type ReactNode, type Ref } from "react";
import { ease } from "@/design/tokens/motion";
import { cn } from "@/lib/cn";
import { cancelAll, easing, track } from "../intro/waapi";

/**
 * Light wipe (Prinzip 11, adapted from design/patterns/LineReveal): a bar
 * sweeps across and the text appears behind its trailing edge. `Wipe` runs
 * the intro reveals (headline: Signal bar, copy: Papier 16 % bar);
 * `SwitchWipe` below re-runs the copy on a flavor switch.
 *
 * final  = plain markup, no motion (SSR, return visits, reduced motion)
 * hidden = masked until its time on the intro clock
 * play   = full sweep: bar in, text follows in the second half
 * fade   = cross-fade instead of a sweep (skip, reduced motion)
 */
export type WipeState = "final" | "hidden" | "play" | "fade";

type Direction = "left" | "right";

const SHOWN = "inset(0% 0% 0% 0%)";
const HIDDEN_FROM: Record<Direction, string> = {
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
};
const GONE_TO: Record<Direction, string> = {
  left: "inset(0% 0% 0% 100%)",
  right: "inset(0% 100% 0% 0%)",
};
/** Share of the sweep in which the bar grows; the text follows after it. */
const COVER = 0.45;

type WipeProps = {
  state: WipeState;
  /** A new key remounts the animated layers (replay, new content). */
  playKey?: string | number;
  direction?: Direction;
  /** Full sweep in seconds. */
  duration?: number;
  fadeDuration?: number;
  delay?: number;
  barClassName: string;
  /** Must position the element (relative or absolute): the bar is inset-0. */
  className?: string;
  /** Padding for the clip box, e.g. italic overhang. */
  innerClassName?: string;
  ref?: Ref<HTMLSpanElement>;
  children: ReactNode;
};

export function Wipe({
  state,
  playKey = 0,
  direction = "left",
  duration = 0.5,
  fadeDuration = 0.4,
  delay = 0,
  barClassName,
  className = "relative",
  innerClassName,
  ref,
  children,
}: WipeProps) {
  if (state === "final") {
    return (
      <span ref={ref} className={className}>
        <span className={cn("block", innerClassName)}>{children}</span>
      </span>
    );
  }

  const half = { cover: duration * COVER, reveal: duration * (1 - COVER) };
  const curve = ease.inOutQuart;

  const text = (() => {
    switch (state) {
      case "hidden":
        return {
          initial: { clipPath: HIDDEN_FROM[direction], opacity: 1 },
          animate: { clipPath: HIDDEN_FROM[direction], opacity: 1 },
          transition: { duration: 0 },
        };
      case "play":
        return {
          initial: { clipPath: HIDDEN_FROM[direction], opacity: 1 },
          animate: { clipPath: [HIDDEN_FROM[direction], SHOWN], opacity: 1 },
          transition: { duration: half.reveal, ease: curve, delay: delay + half.cover },
        };
      case "fade":
        return {
          initial: { clipPath: SHOWN, opacity: 0 },
          animate: { clipPath: SHOWN, opacity: [0, 1] },
          transition: { clipPath: { duration: 0 }, opacity: { duration: fadeDuration, ease: ease.outQuart, delay } },
        };
    }
  })();

  const bar = (() => {
    switch (state) {
      case "hidden":
        return { from: HIDDEN_FROM[direction], animate: { clipPath: HIDDEN_FROM[direction] }, transition: { duration: 0 } };
      case "play":
        return {
          from: HIDDEN_FROM[direction],
          animate: { clipPath: [HIDDEN_FROM[direction], SHOWN, GONE_TO[direction]] },
          transition: { duration, ease: curve, times: [0, COVER, 1], delay },
        };
      case "fade":
        return null;
    }
  })();

  return (
    <span ref={ref} className={className}>
      <m.span
        key={`text-${playKey}`}
        className={cn("block", innerClassName)}
        initial={text.initial}
        animate={text.animate}
        transition={text.transition}
      >
        {children}
      </m.span>
      {bar && (
        <m.span
          key={`bar-${playKey}`}
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", barClassName)}
          initial={{ clipPath: bar.from }}
          animate={bar.animate}
          transition={bar.transition}
        />
      )}
    </span>
  );
}

type SwitchWipeProps = {
  /** performance.now() origin of the cue: the switch's `switchedAt`. */
  origin: number;
  /** Seconds after `origin` when the bar starts to cover. */
  start: number;
  /** Full sweep in seconds (cover + reveal). */
  duration: number;
  direction?: Direction;
  barClassName: string;
  /** Must position the element (relative or absolute): the bar is inset-0. */
  className?: string;
  /** Text before the switch; the bar covers it. */
  from: ReactNode;
  /** Text after the switch; appears behind the bar's trailing edge. */
  to: ReactNode;
};

/**
 * The copy wipe of a flavor switch, pinned to the switch clock: old and new
 * text are stacked in one cell, and the bar, the old text's exit and the new
 * text's entry are native animations whose start time is the switch time
 * itself (`track`, as in the intro). No React state hop or animation-complete
 * callback sits between the cues, so a slow or throttled frame can delay a
 * paint, but never shift the wipe off the switch's 0.5–1.0 s window.
 * The cell is as tall as the taller text until the switch has settled.
 */
export function SwitchWipe({
  origin,
  start,
  duration,
  direction = "left",
  barClassName,
  className = "relative",
  from,
  to,
}: SwitchWipeProps) {
  const oldRef = useRef<HTMLSpanElement>(null);
  const newRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const covered = start + duration * COVER;
    const end = start + duration;
    const animations = [
      track(
        oldRef.current,
        origin,
        [
          { t: start, clipPath: SHOWN, easing: easing.inOutQuart },
          { t: covered, clipPath: GONE_TO[direction] },
        ],
        { fill: "both" },
      ),
      track(
        newRef.current,
        origin,
        [
          { t: covered, clipPath: HIDDEN_FROM[direction], easing: easing.inOutQuart },
          { t: end, clipPath: SHOWN },
        ],
        { fill: "both" },
      ),
      track(
        barRef.current,
        origin,
        [
          { t: start, clipPath: HIDDEN_FROM[direction], easing: easing.inOutQuart },
          { t: covered, clipPath: SHOWN, easing: easing.inOutQuart },
          { t: end, clipPath: GONE_TO[direction] },
        ],
        { fill: "both" },
      ),
    ];
    // No WAAPI: show the new text at once instead of leaving it masked.
    if (!animations[1] && newRef.current) newRef.current.style.clipPath = "none";
    return () => cancelAll(animations);
  }, [origin, start, duration, direction]);

  return (
    <span className={className}>
      <span className="grid">
        <span ref={oldRef} aria-hidden className="col-start-1 row-start-1 block">
          {from}
        </span>
        <span ref={newRef} className="col-start-1 row-start-1 block" style={{ clipPath: HIDDEN_FROM[direction] }}>
          {to}
        </span>
      </span>
      <span
        ref={barRef}
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", barClassName)}
        style={{ clipPath: HIDDEN_FROM[direction] }}
      />
    </span>
  );
}
