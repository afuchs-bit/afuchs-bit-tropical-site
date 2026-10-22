"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Framer Motion with only the DOM animation features (direction §8:
 * LazyMotion + domAnimation): animate, exit (AnimatePresence), hover/tap/
 * focus and inView. No layout projection or drag in the bundle. `strict`
 * makes a stray full `motion.*` component throw in development, so every
 * animated element uses `m.*`.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
