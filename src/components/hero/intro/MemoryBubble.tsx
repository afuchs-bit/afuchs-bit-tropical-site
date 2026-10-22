"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { T, type BubbleId, type BubbleSpec } from "@/config/intro";
import { seededRandom } from "@/lib/seededRandom";
import { getBubbleImage, onIntroImagesChange } from "./preload";
import { DROPLET_LIFE } from "./timing";
import { cancelAll, easing, track } from "./waapi";

/*
 * Memories as a POV blink: every photo fills the screen and is seen between
 * two blinks (Eyelids.tsx). DOM + native WAAPI (transform / opacity only).
 * The round, dissolving surface below (BubbleSurface) is what the final
 * memory shrinks into when it becomes the light halo.
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

/** Mono label of a memory: 12px, uppercase, full Papier, no glow. */
export const LABEL_CLASS =
  "whitespace-pre font-mono text-meta leading-4 uppercase tabular-nums text-paper";
/** Gap between the light disc and the final label (px). */
export const LABEL_GAP = 12;
/** Memory labels sit low in the frame, centered (share of the viewport height). */
export const LABEL_Y = 0.78;

/** POV vignette: the edges of the view fall off into the Tinte. */
const VIGNETTE =
  "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, color-mix(in oklab, var(--ink) 55%, transparent) 85%, var(--ink) 100%)";

/** The moment the lids start to close on a memory: its afterimage lights up. */
export function memoryCloseAt(spec: BubbleSpec): number {
  return spec.start + T.eyeHold;
}

/**
 * One memory, full screen. Visible from its start (the lids open on it,
 * the photo settles from 1.04 to 1.0) until the lids are shut again
 * (`hideAt`, default: start + eyeHold + eyeClose); behind the closed lids it
 * simply disappears, so two photos never cross-fade. The final memory passes
 * `hideAt` and `fade`: it stays open and fades out while it shrinks into the
 * halo (FinalBubble).
 */
export function MemoryFrame({
  spec,
  t0,
  hideAt,
  fade = 0,
}: {
  spec: BubbleSpec;
  t0: number;
  hideAt?: number;
  fade?: number;
}) {
  const photo = useBubbleImage(spec.id, t0 + spec.start * 1000);
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const start = spec.start;
    const opened = start + T.eyeOpen;
    const hidden = hideAt ?? memoryCloseAt(spec) + T.eyeClose;
    // A hard cut behind the closed lids, or a fade for the final memory.
    const out = Math.max(fade, 0.001);

    const animations = [
      track(frame.current, t0, [
        { t: start, opacity: 1 },
        { t: hidden, opacity: 1, easing: easing.outQuart },
        { t: hidden + out, opacity: 0 },
      ]),
      track(
        image.current,
        t0,
        [
          { t: start, transform: "scale(1.04)", easing: easing.outQuart },
          { t: opened + 0.3, transform: "scale(1)" },
        ],
        { fill: "both" },
      ),
      track(label.current, t0, [
        { t: start + T.eyeOpen * 0.5, opacity: 0, easing: easing.outQuart },
        { t: opened, opacity: 1 },
        { t: hidden, opacity: 1 },
        { t: hidden + out, opacity: 0 },
      ]),
    ];
    return () => cancelAll(animations);
  }, [t0, spec, hideAt, fade, photo]);

  return (
    <div ref={frame} className="absolute inset-0 opacity-0" style={{ background: photo ? "var(--ink)" : GLASS_FILL }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- pre-encoded AVIF/JPG, decoded up front; next/image would request another URL and miss the cache
        <img
          ref={image}
          src={photo}
          alt=""
          draggable={false}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0" style={{ background: VIGNETTE }} />
      {hideAt === undefined ? (
        <span
          ref={label}
          className={`absolute left-1/2 -translate-x-1/2 opacity-0 ${LABEL_CLASS}`}
          style={{ top: `${LABEL_Y * 100}%` }}
        >
          {spec.label}
        </span>
      ) : null}
    </div>
  );
}
