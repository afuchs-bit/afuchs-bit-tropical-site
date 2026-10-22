"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { T, type BubbleId, type BubbleSpec } from "@/config/intro";
import { seededRandom } from "@/lib/seededRandom";
import { bubbleBox } from "../geometry";
import { getBubbleImage, onIntroImagesChange } from "./preload";
import type { StageLayout } from "./stageLayout";
import { DROPLET_LIFE, MEMORY_DROPLET_LIFE } from "./timing";
import { cancelAll, easing, track } from "./waapi";

/*
 * One memory bubble: DOM + native WAAPI (transform / opacity only).
 * Structure: mover (position, rise) › scaler (cut in, pop) › surface, plus
 * the pop ring, droplets and the label as siblings of the scaler so they do
 * not scale with it. Positions and sizes from bubbleBox() (geometry.ts).
 */

const paper = (alpha: number) => `color-mix(in oklab, var(--paper) ${alpha}%, transparent)`;

/** No photo: dark translucent glass, graphite like the night behind it. */
const GLASS_FILL = "color-mix(in oklab, var(--halo-deep) 55%, transparent)";
const GLASS_FRESNEL = `radial-gradient(circle closest-side, transparent 70%, ${paper(8)} 94%, ${paper(14)} 100%)`;
/** Photo: edge darkening that starts early and runs into the feathered mask. */
const EDGE_DARKENING =
  "radial-gradient(circle closest-side, transparent 52%, color-mix(in oklab, var(--ink) 38%, transparent) 90%)";
/**
 * Feathered edge instead of a hard clip: the outer ≈ 14 % of the radius fade
 * into the Tinte behind, so a memory has a soft, slightly blurry border.
 */
const FEATHER = "radial-gradient(circle closest-side, #000 86%, rgb(0 0 0 / 0.55) 94%, transparent 100%)";

/**
 * Soft rim of a bubble with diameter `d` (px): a blurred inner glow plus a
 * faint outer haze instead of a 1px line. Scales with the bubble, so it
 * reads the same on the final bubble when that one is scaled down.
 */
export const softRim = (d: number) =>
  `inset 0 0 ${Math.round(d * 0.05)}px ${paper(14)}, 0 0 ${Math.round(d * 0.04)}px ${paper(8)}`;

/** Ring that expands when a bubble pops: soft light, no hard line. */
export const softRing = (d: number) =>
  `0 0 ${Math.round(d * 0.03)}px ${Math.max(1, Math.round(d * 0.006))}px ${paper(36)}, inset 0 0 ${Math.round(d * 0.03)}px ${paper(24)}`;

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

/** Specular crescent top-left: an offset inset shadow, masked to that corner. */
export function Specular({ size, ref }: { size: number; ref?: Ref<HTMLDivElement> }) {
  const mask = "radial-gradient(circle at 26% 22%, #000 20%, transparent 60%)";
  return (
    <div
      ref={ref}
      className="absolute inset-[4%] rounded-full"
      style={{
        boxShadow: `inset ${size * 0.045}px ${size * 0.055}px ${size * 0.06}px -${size * 0.012}px ${paper(34)}`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: "20%",
          top: "15%",
          width: size * 0.06,
          height: size * 0.04,
          transform: "rotate(-38deg)",
          background: `radial-gradient(closest-side, ${paper(70)}, transparent)`,
        }}
      />
    </div>
  );
}

/** Round, feathered mask with photo (or glass), edge darkening and optional layers on top. */
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
      style={{ background: photo ? "var(--ink)" : GLASS_FILL, maskImage: FEATHER, WebkitMaskImage: FEATHER }}
    >
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-encoded AVIF/JPG, decoded up front; next/image would request another URL and miss the cache */}
          <img
            ref={photoRef}
            src={photo}
            alt=""
            draggable={false}
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: EDGE_DARKENING }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: GLASS_FRESNEL }} />
      )}
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


const DROPLETS = 6;

/** The moment a memory bubble starts to pop: fully risen, photo at scale 1.0. */
export function memoryPopAt(spec: BubbleSpec): number {
  return spec.start + T.bubbleLife - T.bubbleOut;
}

/**
 * Memory bubbles 1–6: a hard cut, like a reel. Grows from a point in
 * T.bubbleIn (outExpo), rises by spec.rise while the photo settles from 1.15
 * to 1.0 inside the round mask, and pops in T.bubbleOut: a little larger and
 * gone, with a quick ring and droplets. Its amber light stays (AmberTrail).
 */
export function MemoryBubble({
  spec,
  index,
  t0,
  layout,
}: {
  spec: BubbleSpec;
  index: number;
  t0: number;
  layout: StageLayout;
}) {
  const { x, y, d, rise } = bubbleBox(spec, layout.w, layout.h);
  const photo = useBubbleImage(spec.id, t0 + spec.start * 1000);

  const mover = useRef<HTMLDivElement>(null);
  const scaler = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const droplets = useRef<HTMLDivElement>(null);
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
        { t: start, transform: "scale(0.02)", opacity: 1, easing: easing.outExpo },
        { t: cut, transform: "scale(1)", opacity: 1 },
        { t: popAt, transform: "scale(1)", opacity: 1, easing: easing.outQuart },
        { t: end, transform: "scale(1.08)", opacity: 0 },
      ]),
      track(
        image.current,
        t0,
        [
          { t: start, transform: "scale(1.15)", easing: easing.outQuart },
          { t: popAt, transform: "scale(1)" },
        ],
        { fill: "both" },
      ),
      track(ring.current, t0, [
        { t: popAt, transform: "scale(1)", opacity: 0.6, easing: easing.outQuart },
        { t: popAt + T.bubbleOut * 1.5, transform: "scale(1.3)", opacity: 0 },
      ]),
      ...animateDroplets(droplets.current, t0, popAt, dropletPaths(DROPLETS, index + 1, d / 2), MEMORY_DROPLET_LIFE),
      track(label.current, t0, [
        { t: start + T.bubbleIn * 0.5, transform: labelAt(4), opacity: 0, easing: easing.outExpo },
        { t: cut, transform: labelAt(0), opacity: 1 },
        { t: popAt, transform: labelAt(0), opacity: 1, easing: easing.outQuart },
        { t: end, transform: labelAt(0), opacity: 0 },
      ]),
    ];
    return () => cancelAll(animations);
  }, [t0, spec, index, x, y, d, rise, photo]);

  return (
    <div ref={mover} className="absolute left-0 top-0" style={{ width: d, height: d }}>
      <div ref={scaler} className="absolute inset-0 opacity-0">
        <BubbleSurface photo={photo} photoRef={image} />
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: softRim(d) }} />
        <Specular size={d} />
      </div>
      <div ref={ring} className="absolute inset-0 rounded-full opacity-0" style={{ boxShadow: softRing(d) }} />
      <Droplets ref={droplets} count={DROPLETS} />
      <span
        ref={label}
        className={`absolute left-1/2 top-full opacity-0 ${LABEL_CLASS}`}
        style={{ marginTop: LABEL_GAP }}
      >
        {spec.label}
      </span>
    </div>
  );
}
