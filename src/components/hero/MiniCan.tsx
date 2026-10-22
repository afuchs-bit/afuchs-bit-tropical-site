import { useId } from "react";
import type { Flavor } from "@/content/flavors";

/** Can metal, the same tone as the scene's can material. */
const METAL = { dark: "#5e6167", light: "#d9dce1", mid: "#6e7177" } as const;

/**
 * Small can on the flavor cards: a flat SVG silhouette in the flavor's
 * colors with one light band. No photo and no fake label text until the
 * real label exists; tilted like the hero can.
 */
export function MiniCan({ flavor, className }: { flavor: Flavor; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const p = flavor.palette;
  return (
    <svg viewBox="0 0 40 80" aria-hidden focusable="false" className={className}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={p.haloEdge} />
          <stop offset="0.2" stopColor={p.deep} />
          <stop offset="0.44" stopColor={p.haloCore} />
          <stop offset="0.62" stopColor={p.haloMid} />
          <stop offset="0.86" stopColor={p.deep} />
          <stop offset="1" stopColor={p.haloEdge} />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={METAL.dark} />
          <stop offset="0.38" stopColor={METAL.light} />
          <stop offset="1" stopColor={METAL.mid} />
        </linearGradient>
      </defs>
      {/* lid and neck */}
      <path d="M11 3.5h18a1.5 1.5 0 0 1 1.5 1.5v1.4L33 10.5H7l2.5-4.1V5A1.5 1.5 0 0 1 11 3.5Z" fill={`url(#${id}-metal)`} />
      {/* body */}
      <rect x="7" y="10" width="26" height="63" rx="2.5" fill={`url(#${id}-body)`} />
      {/* foot */}
      <path
        d="M7.4 72.5h25.2l-1.9 4.1a1.5 1.5 0 0 1-1.4.9H10.7a1.5 1.5 0 0 1-1.4-.9Z"
        fill={`url(#${id}-metal)`}
        opacity="0.85"
      />
      {/* light band */}
      <rect x="12" y="12" width="3.2" height="59" rx="1.6" className="fill-paper" opacity="0.38" />
      <rect x="27.6" y="12" width="1" height="59" rx="0.5" className="fill-paper" opacity="0.16" />
    </svg>
  );
}
