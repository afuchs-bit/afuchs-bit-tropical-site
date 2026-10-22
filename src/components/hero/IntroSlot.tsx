"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { DIRECT } from "@/config/intro";
import { ease } from "@/design/tokens/motion";
import { useIntroReveal } from "./ui/introReveal";

type IntroSlotProps = {
  /** Seconds on the intro clock (T.header, T.copy, T.ctas …). */
  at: number;
  /** Seconds on a return visit; DIRECT.ui by default. */
  directAt?: number;
  /** Rise in px; 0 for a pure fade (the 07 ring takes over the intro label in place). */
  rise?: number;
  /** Positioning lives here when the slot is the fixed/absolute element. */
  className?: string;
  children: ReactNode;
};

/** Skip: a 400 ms cross-fade into the final state, no rise (direction §6). */
const SKIP = { opacity: { duration: 0.4, ease: ease.outQuart }, y: { duration: 0 } } as const;
const REVEAL = { duration: 0.4, ease: ease.outExpo } as const;

/**
 * Reveals one UI group at its time in the intro: 12px rise and fade in
 * 400 ms (outExpo). Until then it is inert and hidden from assistive tech.
 * Whenever the timeline did not start from the gate click (SSR, reloads,
 * reduced motion, legal pages) it renders its final state, so nothing ever
 * flashes in.
 */
export function IntroSlot({ at, directAt = DIRECT.ui, rise = 12, className, children }: IntroSlotProps) {
  const state = useIntroReveal(at, directAt);
  const hidden = state === "hidden";
  return (
    <m.div
      className={className}
      initial={false}
      animate={hidden ? { opacity: 0, y: rise } : { opacity: 1, y: 0 }}
      transition={hidden ? { duration: 0 } : state === "skip" ? SKIP : REVEAL}
      inert={hidden}
      aria-hidden={hidden || undefined}
    >
      {children}
    </m.div>
  );
}
