"use client";

import { useEffect, type RefObject } from "react";

/**
 * Exclusion zones: DOM areas the floating elements must never cover
 * (anti-pattern "Objekte über Fließtext"). The DOM registers rects in
 * viewport CSS px (refreshed on resize, layout changes and scroll); the
 * scene converts them to its own space each frame.
 *
 * hard = no element may rest or drift inside (copy, CTAs, switch, header)
 * soft = only far-back elements may sit behind it (headline)
 */
export type ZoneKind = "hard" | "soft";
export type Zone = { kind: ZoneKind; left: number; top: number; right: number; bottom: number };

const zones = new Map<string, Zone>();

export function getZones(): ReadonlyMap<string, Zone> {
  return zones;
}

/*
 * Rects are viewport px, so they go stale whenever the page scrolls (mobile:
 * the hero is taller than the screen and scrolls). One passive scroll
 * listener for all zones, coalesced to one re-measure per frame.
 */
const updaters = new Set<() => void>();
let scrollFrame = 0;

function onScroll(): void {
  if (scrollFrame !== 0) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updaters.forEach((update) => update());
  });
}

function watchScroll(update: () => void): () => void {
  if (updaters.size === 0) window.addEventListener("scroll", onScroll, { passive: true });
  updaters.add(update);
  return () => {
    updaters.delete(update);
    if (updaters.size > 0) return;
    window.removeEventListener("scroll", onScroll);
    if (scrollFrame !== 0) cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
  };
}

/** Registers the element's bounding rect (+ padding) while mounted. */
export function useSceneExclude(
  ref: RefObject<HTMLElement | null>,
  id: string,
  kind: ZoneKind = "hard",
  padding = 48,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let alive = true;
    const update = () => {
      if (!alive) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        zones.delete(id);
        return;
      }
      zones.set(id, {
        kind,
        left: r.left - padding,
        top: r.top - padding,
        right: r.right + padding,
        bottom: r.bottom + padding,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    const unwatch = watchScroll(update);
    void document.fonts?.ready.then(update);
    return () => {
      alive = false;
      ro.disconnect();
      window.removeEventListener("resize", update);
      unwatch();
      zones.delete(id);
    };
  }, [ref, id, kind, padding]);
}
