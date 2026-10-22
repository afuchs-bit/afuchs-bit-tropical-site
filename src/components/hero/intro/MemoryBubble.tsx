"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { T, type BubbleId, type BubbleSpec } from "@/config/intro";
import { seededRandom } from "@/lib/seededRandom";
import { bubbleBox } from "../geometry";
import { getBubbleImage, onIntroImagesChange } from "./preload";
import type { StageLayout } from "./stageLayout";
import { DROPLET_LIFE } from "./timing";
import { cancelAll, easing, track } from "./waapi";

/*
 * One memory: DOM + native WAAPI (transform / opacity only). Not a clean
 * bubble: the photo dissolves into the black from the middle outwards, like
 * a half-remembered moment. Structure: mover (position, rise) › scaler (fade
 * in, fade out) › surface, plus the label as a sibling of the scaler so it
 * does not scale. Positions and sizes from bubbleBox() (geometry.ts).
 */

/** No photo: a faint graphite glow, no edge. */
const GLASS_FILL = "color-mix(in oklab, var(--halo-deep) 70%, transparent)";
/**
 * Flowing transition into the black: the inner half of the radius stays
 * fully visible so the photo is recognizable, the outer half fades out.
 * There is no rim.
 */
const DISSOLVE =
  "radial-gradient(circle closest-side, #000 50%, rgb(0 0 0 / 0.85) 62%, rgb(0 0 0 / 0.5) 76%, rgb(0 0 0 / 0.15) 89%, transparent 100%)";


/**
 * Decoded photo URL for a bubble. A photo that arrives after the bubble's
 * start would pop in mid-life, so from then on the bubble stays glass.
 * `lockAt` follows the stage clock (a photo hold moves it).
 */
export function useBubbleImage(id: BubbleId, lockAt: number): string | null {
  const [url, setUrl] = useState(() => getBubbleImage(id));
  useEffect(() => {
    if (url !== null) return;
    return onIntroImagesChange(() => {
      if (performance.now() < lockAt) setUrl(getBubbleImage(id));
    });
  }, [id, lockAt, url]);
  return url;
}

/** Photo (or faint glass) that dissolves into the black, plus optional layers on top. */
export function BubbleSurface({
  photo,
  photoRef,
  children,
}: {
  photo: string | null;
  photoRef?: Ref<HTMLImageElement>;
  children?: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-full"
      style={{ background: photo ? "var(--ink)" : GLASS_FILL, maskImage: DISSOLVE, WebkitMaskImage: DISSOLVE }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- pre-encoded AVIF/JPG, decoded up front; next/image would request another URL and miss the cache
        <img
          ref={photoRef}
          src={photo}
          alt=""
          draggable={false}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      {children}
    </div>
  );
}

/** Droplet paths: evenly spread, seeded jitter, flying `min`–`max` px out of the rim. */
export function dropletPaths(count: number, seed: number, radius: number, min = 20, max = 40) {
  const random = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (random() - 0.5) * 0.6 + seed;
    const distance = min + random() * (max - min);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      from: { x: cos * radius, y: sin * radius },
      to: { x: cos * (radius + distance), y: sin * (radius + distance) },
    };
  });
}

/** Animates every child of `container` along its droplet path from `at`, over `life` seconds. */
export function animateDroplets(
  container: HTMLElement | null,
  t0: number,
  at: number,
  paths: ReturnType<typeof dropletPaths>,
  life: number = DROPLET_LIFE,
): Array<Animation | null> {
  if (!container) return [];
  return Array.from(container.children).map((el, i) => {
    const path = paths[i];
    if (!path) return null;
    return track(el, t0, [
      {
        t: at,
        transform: `translate3d(${path.from.x}px, ${path.from.y}px, 0) scale(1)`,
        opacity: 0.9,
        easing: easing.outExpo,
      },
      {
        t: at + life,
        transform: `translate3d(${path.to.x}px, ${path.to.y}px, 0) scale(0.4)`,
        opacity: 0,
      },
    ]);
  });
}

export function Droplets({ count, ref }: { count: number; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="absolute inset-0">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 -ml-0.5 -mt-0.5 size-1 rounded-full bg-paper opacity-0"
        />
      ))}
    </div>
  );
}

/** Mono label under a bubble: 12px, uppercase, full Papier, no glow. */
export const LABEL_CLASS =
  "whitespace-pre font-mono text-meta leading-4 uppercase tabular-nums text-paper";
/** Gap between bubble and label (px). */
export const LABEL_GAP = 12;
/** Memory labels sit inside the lower visible part of the image (% of its box height). */
const LABEL_TOP = "83%";


/** The moment a memory starts to fade out: fully risen, photo at scale 1.0. */
export function memoryPopAt(spec: BubbleSpec): number {
  return spec.start + T.bubbleLife - T.bubbleOut;
}

/**
 * Memories 1–6: fades in out of the black over T.bubbleIn (0.92 → 1.0), rises
 * by spec.rise while the photo settles from 1.08 to 1.0, and dissolves back
 * over T.bubbleOut (a touch larger, gone). Its amber light stays (AmberTrail).
 */
export function MemoryBubble({
  spec,
  t0,
  layout,
}: {
  spec: BubbleSpec;
  t0: number;
  layout: StageLayout;
}) {
  const { x, y, d, rise } = bubbleBox(spec, layout.w, layout.h);
  const photo = useBubbleImage(spec.id, t0 + spec.start * 1000);

  const mover = useRef<HTMLDivElement>(null);
  const scaler = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const start = spec.start;
    const cut = start + T.bubbleIn;
    const popAt = memoryPopAt(spec);
    const end = popAt + T.bubbleOut;
    const place = (cy: number) => `translate3d(${x - d / 2}px, ${cy - d / 2}px, 0)`;
    const labelAt = (dy: number) => `translate3d(-50%, ${dy}px, 0)`;

    const animations = [
      track(
        mover.current,
        t0,
        [
          { t: start, transform: place(y), easing: easing.outQuart },
          { t: popAt, transform: place(y - rise) },
        ],
        { fill: "both" },
      ),
      track(scaler.current, t0, [
        { t: start, transform: "scale(0.92)", opacity: 0, easing: easing.outQuart },
        { t: cut, transform: "scale(1)", opacity: 1 },
        { t: popAt, transform: "scale(1)", opacity: 1, easing: easing.inOutQuart },
        { t: end, transform: "scale(1.04)", opacity: 0 },
      ]),
      track(
        image.current,
        t0,
        [
          { t: start, transform: "scale(1.08)", easing: easing.outQuart },
          { t: popAt, transform: "scale(1)" },
        ],
        { fill: "both" },
      ),
      track(label.current, t0, [
        { t: start + T.bubbleIn * 0.5, transform: labelAt(4), opacity: 0, easing: easing.outExpo },
        { t: cut, transform: labelAt(0), opacity: 1 },
        { t: popAt, transform: labelAt(0), opacity: 1, easing: easing.outQuart },
        { t: end, transform: labelAt(0), opacity: 0 },
      ]),
    ];
    return () => cancelAll(animations);
  }, [t0, spec, x, y, d, rise, photo]);

  return (
    <div ref={mover} className="absolute left-0 top-0" style={{ width: d, height: d }}>
      <div ref={scaler} className="absolute inset-0 opacity-0">
        <BubbleSurface photo={photo} photoRef={image} />
      </div>
      <span
        ref={label}
        className={`absolute left-1/2 opacity-0 ${LABEL_CLASS}`}
        style={{ top: LABEL_TOP }}
      >
        {spec.label}
      </span>
    </div>
  );
}
