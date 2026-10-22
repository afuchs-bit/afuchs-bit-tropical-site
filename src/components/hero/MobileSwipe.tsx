"use client";

import { useRef } from "react";
import { DIRECT, T } from "@/config/intro";
import { flavors } from "@/content/flavors";
import { switchFlavor } from "./flavor/switchFlavor";
import { heroStore } from "./store";
import { useIntroReveal } from "./ui/introReveal";

/** Horizontal travel (px) that counts as a swipe. */
const THRESHOLD = 40;

/**
 * Mobile scene area (0–62svh) in the copy layer: keeps the rest zone below
 * the canvas and turns a horizontal swipe over the can into a flavor switch.
 * touch-action pan-y keeps vertical scrolling native. The chips are the
 * accessible way to do the same, so this layer is aria-hidden.
 */
export function MobileSwipe() {
  const start = useRef<{ x: number; y: number } | null>(null);
  const enabled = useIntroReveal(T.header, DIRECT.ui) !== "hidden";

  return (
    <div
      aria-hidden
      className="h-[62svh] shrink-0 touch-pan-y md:hidden"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        start.current = enabled && touch && event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
      }}
      onTouchCancel={() => {
        start.current = null;
      }}
      onTouchEnd={(event) => {
        const from = start.current;
        start.current = null;
        const touch = event.changedTouches[0];
        if (!from || !touch) return;
        const dx = touch.clientX - from.x;
        const dy = touch.clientY - from.y;
        if (Math.abs(dx) < THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        const index = flavors.findIndex((f) => f.slug === heroStore.get().flavor);
        const next = flavors[(index + (dx < 0 ? 1 : -1) + flavors.length) % flavors.length];
        if (next) switchFlavor(next.slug, { x: touch.clientX, y: touch.clientY });
      }}
    />
  );
}
