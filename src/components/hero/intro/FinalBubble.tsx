"use client";

import { useLayoutEffect, useRef } from "react";
import { T, type BubbleSpec } from "@/config/intro";
import { lightGradient } from "./light";
import {
  BubbleSurface,
  Droplets,
  animateDroplets,
  dropletPaths,
  useBubbleImage,
} from "./MemoryBubble";
import { bubbleBox } from "../geometry";
import type { StageLayout } from "./stageLayout";
import { cancelAll, easing, track } from "./waapi";

/**
 * Ten droplets with seed 97: the scene starts its first party lights at the
 * same angles (scene/PartyLights dropletAngles). Change both or neither.
 */
const DROPLETS = 10;
const DROPLET_SEED = 97;

/** The inner part of the halo it becomes: at the pop the same light stays behind. */
const DISC = lightGradient("closest-side");

/**
 * The last bubble (`fireworks`, always bubbles[bubbles.length - 1]). Cuts in
 * like the others at its start, rises, but does not pop at the end of its
 * life: during T.finalToCenter it drifts to the halo center and grows to the
 * halo diameter (haloGeometry, the same center and radius as the WebGL
 * halo). Its amber light is the photo center by construction (the encoder
 * crops around the burst), so the light lands exactly in the middle. During
 * T.finalDisc the photo turns into a flat amber light disc (the inner part of
 * the halo); T.pop: rim flash for T.rimFlash, then it pops in T.bubbleOut and
 * the LightHalo underneath (same light) stays.
 *
 * The element is sized at the halo diameter and scaled down at the start,
 * so it rasterizes sharp at its largest size. Like the other memories it
 * has no rim: the photo dissolves into the black, and so does the light disc.
 */
export function FinalBubble({ spec, t0, layout }: { spec: BubbleSpec; t0: number; layout: StageLayout }) {
  const { x, y, d, rise } = bubbleBox(spec, layout.w, layout.h);
  const { cx, cy, r } = layout.halo;
  const size = r * 2;
  const s0 = d / size;
  const photo = useBubbleImage(spec.id, t0 + spec.start * 1000);

  const mover = useRef<HTMLDivElement>(null);
  const scaler = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const droplets = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const start = spec.start;
    const cut = start + T.bubbleIn;
    const [toCenter, atCenter] = T.finalToCenter;
    const risen = Math.min(start + T.bubbleLife - T.bubbleOut, toCenter);
    const [discFrom, discTo] = T.finalDisc;
    const popAt = T.pop + T.rimFlash;
    const end = popAt + T.bubbleOut;
    const place = (px: number, py: number) => `translate3d(${px - size / 2}px, ${py - size / 2}px, 0)`;
    const scale = (s: number) => `scale(${s})`;

    const animations = [
      track(
        mover.current,
        t0,
        [
          { t: start, transform: place(x, y), easing: easing.outQuart },
          { t: risen, transform: place(x, y - rise) },
          { t: toCenter, transform: place(x, y - rise), easing: easing.inOutQuart },
          { t: atCenter, transform: place(cx, cy) },
        ],
        { fill: "both" },
      ),
      track(scaler.current, t0, [
        { t: start, transform: scale(0.92 * s0), opacity: 0, easing: easing.outQuart },
        { t: cut, transform: scale(s0), opacity: 1 },
        { t: toCenter, transform: scale(s0), opacity: 1, easing: easing.inOutQuart },
        { t: atCenter, transform: scale(1), opacity: 1 },
        { t: popAt, transform: scale(1), opacity: 1, easing: easing.outQuart },
        { t: end, transform: scale(1.06), opacity: 0 },
      ]),
      track(
        image.current,
        t0,
        [
          { t: start, transform: scale(1.15), easing: easing.outQuart },
          { t: toCenter, transform: scale(1) },
        ],
        { fill: "both" },
      ),
      // Photo → flat light disc.
      track(disc.current, t0, [
        { t: discFrom, opacity: 0, easing: easing.inOutQuart },
        { t: discTo, opacity: 1 },
      ]),
      track(flash.current, t0, [
        { t: T.pop, opacity: 0, easing: easing.outQuart },
        { t: T.pop + T.rimFlash / 2, opacity: 1, easing: easing.outQuart },
        { t: popAt, opacity: 0 },
      ]),
      ...animateDroplets(droplets.current, t0, popAt, dropletPaths(DROPLETS, DROPLET_SEED, r)),
    ];
    return () => cancelAll(animations);
  }, [t0, spec, x, y, d, rise, cx, cy, r, size, s0, photo]);

  return (
    <div ref={mover} className="absolute left-0 top-0" style={{ width: size, height: size }}>
      <div ref={scaler} className="absolute inset-0 opacity-0">
        <BubbleSurface photo={photo} photoRef={image}>
          <div ref={disc} className="absolute inset-0 opacity-0" style={{ background: DISC }} />
        </BubbleSurface>
        <div
          ref={flash}
          className="absolute inset-0 rounded-full opacity-0"
          style={{
            boxShadow: `inset 0 0 ${Math.round(size * 0.05)}px color-mix(in oklab, var(--paper) 70%, transparent), 0 0 ${Math.round(size * 0.06)}px color-mix(in oklab, var(--paper) 40%, transparent)`,
          }}
        />
      </div>
      <Droplets ref={droplets} count={DROPLETS} />
    </div>
  );
}
