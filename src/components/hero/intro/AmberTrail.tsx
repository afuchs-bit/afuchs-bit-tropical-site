"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { T, bubbles } from "@/config/intro";
import { seededRandom } from "@/lib/seededRandom";
import { amberPoint } from "../geometry";
import { useHero } from "../store";
import { memoryPopAt } from "./MemoryBubble";
import type { StageLayout } from "./stageLayout";
import { TRAIL_DRIFT, TRAIL_FADE } from "./timing";
import { cancelAll, easing, track } from "./waapi";

/** Bubbles 1–6; the last one becomes the halo itself. */
const memories = bubbles.slice(0, -1);

/** The scene starts six party lights from these pixels at this moment. */
const HANDOFF = T.pop + T.rimFlash;

/** 4px Signal point; the glow is its own amber light, nothing else glows. */
const CORE = 4;
const GLOW =
  "0 0 3px 1px color-mix(in oklab, var(--signal) 85%, transparent), 0 0 12px 3px color-mix(in oklab, var(--signal) 30%, transparent)";

type Point = { id: string; at: number; x: number; y: number };

function trailPoints(w: number, h: number): Point[] {
  return memories.map((spec) => ({ id: spec.id, at: memoryPopAt(spec), ...amberPoint(spec, w, h) }));
}

/**
 * "Was bleibt, ist das Licht" (direction §6). When a memory bubble pops, its
 * photo is gone but its single amber light stays: a 4px point exactly where
 * that light sat in the photo at the pop (amberPoint() in geometry.ts: rise
 * and the measured amber coordinates). After six bubbles six points hang in
 * the dark, a trail through the night. They stay lit (a faint flicker, no
 * movement) until T.pop + T.rimFlash; then the scene starts six WebGL party
 * lights from the same pixels and the points go out over TRAIL_FADE, so the
 * hand-off reads as the lights flying to the can. Without a ready scene the
 * points drift into the halo instead and fade there.
 *
 * Structure per point: place (static position) › handoff (fade or drift)
 * › light (lights up at the pop) › core (flicker). Transform and opacity only.
 */
export function AmberTrail({ t0, layout }: { t0: number; layout: StageLayout }) {
  const sceneReady = useHero((s) => s.sceneReady);
  const root = useRef<HTMLDivElement>(null);
  /** Hand-off variant once it is scheduled; a running hand-off is never swapped. */
  const handoff = useRef<"fade" | "drift" | null>(null);
  const points = trailPoints(layout.w, layout.h);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const pts = trailPoints(layout.w, layout.h);
    const random = seededRandom(31);
    const lights = Array.from(el.querySelectorAll<HTMLElement>("[data-trail-light]"));
    const cores = Array.from(el.querySelectorAll<HTMLElement>("[data-trail-core]"));
    const animations = [
      // Lights up with the pop: a short flare that settles into the point.
      ...lights.map((light, i) => {
        const at = pts[i]?.at ?? HANDOFF;
        return track(light, t0, [
          { t: at, opacity: 0, transform: "scale(2.2)", easing: easing.outExpo },
          { t: at + 0.35, opacity: 1, transform: "scale(1)" },
        ]);
      }),
      // A city light, not a LED: a slow, uneven flicker per point.
      ...cores.map((core) =>
        typeof core.animate === "function"
          ? core.animate(
              [
                { opacity: 1, offset: 0 },
                { opacity: 0.78, offset: 0.18 + random() * 0.1 },
                { opacity: 1, offset: 0.45 },
                { opacity: 0.88, offset: 0.7 + random() * 0.1 },
                { opacity: 1, offset: 1 },
              ],
              { duration: 1100 + random() * 700, iterations: Number.POSITIVE_INFINITY },
            )
          : null,
      ),
    ];
    return () => cancelAll(animations);
  }, [t0, layout]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const now = (performance.now() - t0) / 1000;
    if (handoff.current !== null && now >= HANDOFF) return;
    const variant = sceneReady ? "fade" : "drift";
    handoff.current = variant;
    const pts = trailPoints(layout.w, layout.h);
    const { cx, cy } = layout.halo;
    const movers = Array.from(el.querySelectorAll<HTMLElement>("[data-trail-handoff]"));
    const animations = movers.map((mover, i) => {
      const p = pts[i];
      if (!p) return null;
      if (variant === "fade") {
        return track(mover, t0, [
          { t: HANDOFF, opacity: 1, easing: easing.inOutQuart },
          { t: HANDOFF + TRAIL_FADE, opacity: 0 },
        ]);
      }
      const dx = (cx - p.x) * 0.85;
      const dy = (cy - p.y) * 0.85;
      return track(mover, t0, [
        { t: HANDOFF, transform: "translate3d(0, 0, 0) scale(1)", opacity: 1, easing: easing.inOutQuart },
        { t: HANDOFF + TRAIL_DRIFT, transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.5)`, opacity: 0 },
      ]);
    });
    return () => {
      // Replace only a hand-off that has not started (the scene got ready in time).
      if (performance.now() >= t0 + HANDOFF * 1000) return;
      cancelAll(animations);
      handoff.current = null;
    };
  }, [t0, sceneReady, layout]);

  return (
    <div ref={root} aria-hidden="true" className="absolute inset-0">
      {points.map((p) => (
        <div
          key={p.id}
          className="absolute left-0 top-0"
          style={{ transform: `translate3d(${p.x - CORE / 2}px, ${p.y - CORE / 2}px, 0)` }}
        >
          <div data-trail-handoff="">
            <div data-trail-light="" className="opacity-0">
              <div
                data-trail-core=""
                className="rounded-full bg-signal"
                style={{ width: CORE, height: CORE, boxShadow: GLOW }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
