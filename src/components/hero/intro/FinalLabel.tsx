"use client";

import { useLayoutEffect, useRef } from "react";
import { FINAL_LABEL, T, type BubbleSpec } from "@/config/intro";
import { bubbleBox } from "../geometry";
import { LABEL_CLASS, LABEL_GAP } from "./MemoryBubble";
import type { StageLayout } from "./stageLayout";
import { LABEL_FADE, LABEL_FLIGHT, LABEL_FLIGHT_DELAY, LABEL_ROLL, LABEL_ROLL_COLUMN } from "./timing";
import { cancelAll, easing, track, type TimedFrame } from "./waapi";

/** The hero's 07 ring shows its text in Papier 72 %: the label lands at that strength. */
const RING_OPACITY = 0.72;

/**
 * Where the hero's 07 ring text sits (Clock07 marks it with
 * `data-intro-clock`). Only a ring that is on screen counts: portrait phones
 * show the bottom row below the fold.
 */
function clockTarget(layout: StageLayout, lineHeight: number): { x: number; y: number } | null {
  const el = document.querySelector<HTMLElement>("[data-intro-clock]");
  const rect = el?.getBoundingClientRect();
  if (!rect || rect.width === 0 || rect.top < 0 || rect.bottom > layout.h) return null;
  return { x: rect.left, y: rect.top + (rect.height - lineHeight) / 2 };
}

/**
 * Label of the final bubble. Shows its own occasion label ("07 · 00:00"),
 * follows the bubble to the halo and stays under the light disc. After the
 * pop (T.pop + T.rimFlash) it rolls column by column to FINAL_LABEL
 * ("07 · HEUTE NACHT") while it glides to the hero's 07 ring at the bottom
 * left, and fades out there while the ring fades in (T.header). Monospace,
 * so the columns line up through the roll and on the ring.
 * Without a visible ring (portrait phones) it rolls in place and fades.
 */
export function FinalLabel({ spec, t0, layout }: { spec: BubbleSpec; t0: number; layout: StageLayout }) {
  const from = spec.label;
  const columns = Array.from({ length: Math.max(from.length, FINAL_LABEL.length) }, (_, i) => ({
    a: (from[i] ?? " ").replace(" ", " "),
    b: (FINAL_LABEL[i] ?? " ").replace(" ", " "),
  }));

  const wrap = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const width = el.offsetWidth;
    const lineHeight = el.offsetHeight;
    const { x, y, d, rise } = bubbleBox(spec, layout.w, layout.h);
    const { cx, cy, r } = layout.halo;
    const [toCenter, atCenter] = T.finalToCenter;
    const risen = Math.min(spec.start + T.bubbleLife - T.bubbleOut, toCenter);
    const popped = T.pop + T.rimFlash;
    // The box is as wide as the longer label; center what is visible before the roll.
    const visible = (width * from.length) / columns.length;
    const below = (px: number, py: number) => `translate3d(${px - visible / 2}px, ${py + LABEL_GAP}px, 0)`;

    const path: TimedFrame[] = [
      { t: spec.start, transform: below(x, y + d / 2), easing: easing.outQuart },
      { t: risen, transform: below(x, y - rise + d / 2) },
      { t: toCenter, transform: below(x, y - rise + d / 2), easing: easing.inOutQuart },
      { t: atCenter, transform: below(cx, cy + r) },
    ];
    const target = clockTarget(layout, lineHeight);
    const flight = popped + LABEL_FLIGHT_DELAY;
    const landed = flight + LABEL_FLIGHT;
    if (target) {
      path.push(
        { t: flight, transform: below(cx, cy + r), easing: easing.inOutQuart },
        { t: landed, transform: `translate3d(${target.x}px, ${target.y}px, 0)` },
      );
    }
    const fadeAt = target ? Math.max(T.header, landed) : popped + LABEL_ROLL + 0.25;

    // The roll starts with the pop, column after column.
    const rolling = Array.from(el.querySelectorAll<HTMLElement>("[data-roll]"));
    const step = (LABEL_ROLL - LABEL_ROLL_COLUMN) / Math.max(1, rolling.length - 1);

    const opacity: TimedFrame[] = [
      { t: spec.start + T.bubbleIn * 0.5, opacity: 0, easing: easing.outExpo },
      { t: spec.start + T.bubbleIn, opacity: 1 },
    ];
    if (target) {
      opacity.push(
        { t: flight, opacity: 1, easing: easing.inOutQuart },
        { t: landed, opacity: RING_OPACITY },
      );
    }
    const held = target ? RING_OPACITY : 1;
    opacity.push(
      { t: fadeAt, opacity: held, easing: easing.outQuart },
      { t: fadeAt + LABEL_FADE, opacity: 0 },
    );

    const animations = [
      track(el, t0, path, { fill: "both" }),
      track(text.current, t0, opacity),
      ...rolling.map((column, i) => {
        const at = popped + i * step;
        return track(column, t0, [
          { t: at, transform: "translate3d(0, 0, 0)", easing: easing.inOutQuart },
          { t: at + LABEL_ROLL_COLUMN, transform: "translate3d(0, -50%, 0)" },
        ]);
      }),
    ];
    return () => cancelAll(animations);
  }, [t0, spec, layout, from.length, columns.length]);

  return (
    <div ref={wrap} className="absolute left-0 top-0">
      <span ref={text} className={`block opacity-0 ${LABEL_CLASS}`}>
        {columns.map(({ a, b }, i) =>
          a === b ? (
            <span key={i}>{a}</span>
          ) : (
            <span key={i} className="inline-block h-4 overflow-hidden align-top">
              <span data-roll="" className="block">
                <span className="block">{a}</span>
                <span className="block">{b}</span>
              </span>
            </span>
          ),
        )}
      </span>
    </div>
  );
}
