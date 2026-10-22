/**
 * The intro's DOM light. The final bubble's light disc, the halo it leaves
 * behind and the light cone share their geometry with the hero's CSS backdrop
 * (HeroBackdrop) and the WebGL halo: center and radius from haloGeometry(),
 * stops in multiples of r (core 0 → mid 0.75 → deep 1.4 → edge 2.6, plus the
 * backdrop's core/mid midpoint at 0.38). Keep the stops in sync with
 * HeroBackdrop.
 *
 * The DOM light is added on top of the scene (plus-lighter) with its core
 * lifted toward Signal, so it reads as the scene's own light overexposed;
 * fading it out is the exposure settling, never a jump.
 */

/** Core lifted toward Signal: a light source, brighter than the resting halo. */
const CORE = "color-mix(in oklab, var(--signal) 40%, var(--halo-core))";

/** How far the halo reaches, in multiples of r (the backdrop's edge stop). */
export const HALO_EXTENT = 2.6;

/**
 * Radial light with ray length `size` (CSS length or `closest-side`). The
 * edge stop is transparent instead of Tinte: added light, not a background.
 */
export function lightGradient(size: string): string {
  return `radial-gradient(circle ${size} at 50% 50%, ${CORE} 0%, color-mix(in oklab, var(--halo-core) 50%, var(--halo-mid)) 38%, var(--halo-mid) 75%, var(--halo-deep) 140%, transparent ${
    HALO_EXTENT * 100
  }%)`;
}

/**
 * The backdrop's light cone (HeroBackdrop `.hero-cone`): apex above the top
 * edge, ±15°, fading out at 80 % of its height. Desktop: one viewport high;
 * portrait mobile: the scene height (62svh).
 */
export const coneGradient =
  "conic-gradient(from 180deg at 50% -18%, var(--signal) 0deg, color-mix(in oklab, var(--signal) 45%, transparent) 7deg, transparent 15deg, transparent 345deg, color-mix(in oklab, var(--signal) 45%, transparent) 353deg, var(--signal) 360deg)";

export const coneMask = "linear-gradient(to bottom, #000, transparent 80%)";
