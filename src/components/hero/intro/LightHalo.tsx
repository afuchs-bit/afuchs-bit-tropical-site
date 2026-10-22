"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { T } from "@/config/intro";
import { MOBILE_SCENE_HEIGHT } from "../geometry";
import { useHero } from "../store";
import { HALO_EXTENT, coneGradient, coneMask, lightGradient } from "./light";
import type { StageLayout } from "./stageLayout";
import { cancelAll, easing, track } from "./waapi";

const add = { mixBlendMode: "plus-lighter" } as const;

/** Share of the DOM halo left on top of the scene's halo once the Tinte is gone. */
const OVEREXPOSURE = 0.45;

/**
 * What the final bubble leaves behind at T.pop: the DOM light halo (same center,
 * radius and stops as the WebGL halo and the CSS backdrop) plus the light
 * cone from above. Rendered inside the stage's additive layer, so it adds to
 * whatever is underneath: Tinte first, then the hero as the Tinte fades.
 *
 * Cone: 0 → 1 over T.lightCone, then it hands over to the scene's own cone
 * (35 %), which shows through as the Tinte fades; the sum settles at 35 %.
 *
 * Hand-off: once the scene is ready, and not before T.pop + T.handoffAfter,
 * the halo fades and the WebGL halo underneath carries on. Without a ready
 * scene it keeps breathing until T.posterDeadline and then leaves, so the
 * UI's CSS backdrop (the same halo) is the resting state.
 */
export function LightHalo({ t0, layout }: { t0: number; layout: StageLayout }) {
  const { cx, cy, r } = layout.halo;
  const sceneReady = useHero((s) => s.sceneReady);

  const wrap = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const breath = useRef<HTMLDivElement>(null);
  const cone = useRef<HTMLDivElement>(null);
  /** Intro time the hand-off fade was scheduled for. */
  const handoffAt = useRef<number | null>(null);

  useLayoutEffect(() => {
    const [coneIn, coneFull] = T.lightCone;
    const animations = [
      // Appears under the rim flash; the popping bubble uncovers it. While the
      // Tinte fades and the scene's own halo shows through, it eases back to
      // OVEREXPOSURE, so the sum stays amber instead of clipping to yellow.
      track(halo.current, t0, [
        { t: T.pop, opacity: 0 },
        { t: T.pop + T.rimFlash, opacity: 1, easing: easing.inOutQuart },
        { t: Math.max(T.pop + T.rimFlash, T.backdrop[0]), opacity: 1, easing: easing.inOutQuart },
        { t: T.backdrop[1], opacity: OVEREXPOSURE },
      ]),
      track(cone.current, t0, [
        { t: coneIn, opacity: 0, easing: easing.outQuart },
        { t: coneFull, opacity: 1, easing: easing.inOutQuart },
        { t: coneFull + (coneFull - coneIn), opacity: 0 },
      ]),
      // One slow breath while waiting for the scene; ends at its rest values.
      track(
        breath.current,
        t0,
        [
          { t: coneFull, transform: "scale(1)", opacity: 1, easing: easing.inOutQuart },
          {
            t: (coneFull + T.posterDeadline) / 2,
            transform: "scale(1.035)",
            opacity: 0.86,
            easing: easing.inOutQuart,
          },
          { t: T.posterDeadline, transform: "scale(1)", opacity: 1 },
        ],
        { fill: "none" },
      ),
    ];
    return () => cancelAll(animations);
  }, [t0]);

  useEffect(() => {
    const now = (performance.now() - t0) / 1000;
    // A fade that already runs is never restarted (that would flash the light back).
    if (handoffAt.current !== null && handoffAt.current <= now) return;
    // Ready scene: fade now (never before T.pop + T.handoffAfter). Otherwise the
    // deadline fade is fixed on the clock and joins in progress if mounted late.
    const at = sceneReady ? Math.max(now, T.pop + T.handoffAfter) : T.posterDeadline;
    handoffAt.current = at;
    const fade = track(wrap.current, t0, [
      { t: at, opacity: 1, easing: easing.inOutQuart },
      { t: at + T.handoffFade, opacity: 0 },
    ]);
    return () => {
      // Only a fade that has not started yet is replaced (scene got ready earlier).
      if (performance.now() < t0 + at * 1000) fade?.cancel();
    };
  }, [t0, sceneReady]);

  const extent = r * HALO_EXTENT;
  const coneHeight = layout.mobile ? layout.h * MOBILE_SCENE_HEIGHT : layout.h;

  return (
    <div ref={wrap} className="absolute inset-0">
      <div
        ref={cone}
        className="absolute inset-x-0 top-0 opacity-0"
        style={{ ...add, height: coneHeight, background: coneGradient, maskImage: coneMask, WebkitMaskImage: coneMask }}
      />
      <div
        ref={halo}
        className="absolute opacity-0"
        style={{ ...add, left: cx - extent, top: cy - extent, width: extent * 2, height: extent * 2 }}
      >
        <div ref={breath} className="absolute inset-0" style={{ background: lightGradient(`${r}px`) }} />
      </div>
    </div>
  );
}
