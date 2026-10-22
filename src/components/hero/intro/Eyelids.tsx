"use client";

import { useLayoutEffect, useRef } from "react";
import { T, bubbles } from "@/config/intro";
import { cancelAll, easing, track, type TimedFrame } from "./waapi";

/** Closing is quick and accelerating, like a real blink (inQuad). */
const IN_QUAD = "cubic-bezier(0.11, 0, 0.5, 0)";

/**
 * Lid shape: each lid is a full-height sheet of Tinte whose inner edge is a
 * wide, soft ellipse, lower in the middle than at the sides, like an
 * eyelid. The feather is broad, so there is never a hard line.
 */
const lidMask = (edge: "top" | "bottom") =>
  `radial-gradient(ellipse 140% 100% at 50% ${edge === "top" ? "0%" : "100%"}, #000 78%, rgb(0 0 0 / 0.6) 90%, transparent 100%)`;

const CLOSED = "translate3d(0, 0, 0)";

/**
 * POV blink between the memories. Starts closed (black after "Ja"), opens
 * on each memory at its start in T.eyeOpen, closes at start + T.eyeHold in
 * T.eyeClose; the next memory opens behind the closed lids. After the last
 * memory (fireworks) the eyes stay open: it becomes the light halo.
 * Transform only, on the intro clock.
 */
export function Eyelids({ t0 }: { t0: number }) {
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frames = (open: string): TimedFrame[] => {
      const list: TimedFrame[] = [{ t: 0, transform: CLOSED }];
      bubbles.forEach((spec, i) => {
        const last = i === bubbles.length - 1;
        list.push(
          { t: spec.start, transform: CLOSED, easing: easing.outQuart },
          { t: spec.start + T.eyeOpen, transform: open },
        );
        if (!last) {
          list.push(
            { t: spec.start + T.eyeHold, transform: open, easing: IN_QUAD },
            { t: spec.start + T.eyeHold + T.eyeClose, transform: CLOSED },
          );
        }
      });
      return list;
    };
    const animations = [
      track(top.current, t0, frames("translate3d(0, -100%, 0)"), { fill: "both" }),
      track(bottom.current, t0, frames("translate3d(0, 100%, 0)"), { fill: "both" }),
    ];
    return () => cancelAll(animations);
  }, [t0]);

  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div
        ref={top}
        className="absolute inset-0 bg-ink"
        style={{ maskImage: lidMask("top"), WebkitMaskImage: lidMask("top") }}
      />
      <div
        ref={bottom}
        className="absolute inset-0 bg-ink"
        style={{ maskImage: lidMask("bottom"), WebkitMaskImage: lidMask("bottom") }}
      />
    </div>
  );
}
