"use client";

import { flavorCssVars, getFlavor, type FlavorSlug } from "@/content/flavors";
import { heroStore, switchTime } from "../store";
import { scheduleAt } from "../ui/introReveal";

/** Length of one flavor switch; inputs during a switch are buffered. */
export const SWITCH_DURATION = 1.0;

let pending: { slug: FlavorSlug; origin: { x: number; y: number } | null } | null = null;
let pendingJob: (() => void) | null = null;

/** Writes the flavor's palette onto <html> (Signal, Tiefe, halo colors). */
export function applyFlavorCss(slug: FlavorSlug): void {
  const style = document.documentElement.style;
  for (const [key, value] of Object.entries(flavorCssVars(getFlavor(slug)))) {
    style.setProperty(key, value);
  }
}

type Point = { x: number; y: number };

/** Marks a card or chip as the visible control for a flavor (wave origin fallback). */
export const FLAVOR_OPTION_ATTR = "data-flavor-option";

/**
 * Center of the visible card or chip for `slug`. Used when the caller has
 * no origin (programmatic switch) or only a synthetic one: keyboard and
 * `el.click()` events carry clientX/Y 0, which would start the wave in the
 * top left corner.
 */
function optionCenter(slug: FlavorSlug): Point | null {
  for (const el of document.querySelectorAll<HTMLElement>(`[${FLAVOR_OPTION_ATTR}="${slug}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return null;
}

/**
 * Switches the whole world (Prinzip 32). `origin` is the viewport point the
 * light wave starts from (center of the clicked card or chip, or the touch
 * point of a swipe); unknown or (0, 0) falls back to the card / chip center.
 */
export function switchFlavor(slug: FlavorSlug, origin: Point | null = null): void {
  if (!origin || (origin.x === 0 && origin.y === 0)) origin = optionCenter(slug);
  const elapsed = switchTime();
  if (elapsed < SWITCH_DURATION) {
    // Buffered: the latest input runs when this switch ends, on the switch clock.
    pending = { slug, origin };
    pendingJob ??= scheduleAt(switchTime, SWITCH_DURATION, () => {
      pendingJob = null;
      const next = pending;
      pending = null;
      if (next) switchFlavor(next.slug, next.origin);
    });
    return;
  }
  const { flavor } = heroStore.get();
  if (flavor === slug) return;
  heroStore.set({
    prevFlavor: flavor,
    flavor: slug,
    switchedAt: performance.now(),
    switchOrigin: origin,
  });
  applyFlavorCss(slug);
}
