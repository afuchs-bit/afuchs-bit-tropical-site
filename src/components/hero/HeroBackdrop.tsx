import { HALO_STOPS } from "./scene/lib/halo";

/**
 * CSS night behind the canvas: the flavor's light halo, a light cone from
 * above in Signal (additive, 35 %) and a vignette. It is what shows before
 * the scene is ready and the whole fallback when WebGL fails, so it uses the
 * same center, radius and stops as the WebGL halo (haloGeometry() in
 * geometry.ts, HALO_STOPS in scene/lib/halo.ts):
 *   desktop  cx 50 %, cy 50 %, r 35vmin
 *   mobile   cx 50 %, cy 62svh × 0.52, r min(100vw, 62svh) × 0.42
 * Interpolated in OKLab like the shader; browsers without `in oklab` get
 * the same stops in sRGB (@supports, since a var() declaration cannot fall
 * back to an earlier one). Server component; the colors follow the flavor
 * switch through the registered --halo-* properties.
 */
const pct = (k: number) => `${k * 100}%`;
const stops = `var(--halo-core) ${pct(HALO_STOPS.core)}, var(--halo-mid) ${pct(HALO_STOPS.mid)}, var(--halo-deep) ${pct(
  HALO_STOPS.deep,
)}, var(--halo-edge) ${pct(HALO_STOPS.edge)}`;
const vignette =
  "radial-gradient(ellipse 120% 95% at 50% var(--halo-cy), transparent 52%, color-mix(in oklab, var(--ink) 55%, transparent) 100%)";
const halo = (space: string) => `radial-gradient(circle var(--halo-r) at 50% var(--halo-cy)${space}, ${stops})`;

const css = `.hero-backdrop{
--halo-cy:calc(62svh * 0.52);
--halo-r:calc(min(100vw, 62svh) * 0.42);
background:${vignette},${halo("")};
transition:--halo-core 700ms var(--ease-in-out-quart) 300ms,--halo-mid 700ms var(--ease-in-out-quart) 300ms,--halo-deep 700ms var(--ease-in-out-quart) 300ms,--halo-edge 700ms var(--ease-in-out-quart) 300ms;
}
.hero-cone{
position:absolute;inset:0 0 auto;height:62svh;
background:conic-gradient(from 180deg at 50% -18%, var(--signal) 0deg, color-mix(in oklab, var(--signal) 45%, transparent) 7deg, transparent 15deg, transparent 345deg, color-mix(in oklab, var(--signal) 45%, transparent) 353deg, var(--signal) 360deg);
-webkit-mask-image:linear-gradient(to bottom, #000, transparent 80%);
mask-image:linear-gradient(to bottom, #000, transparent 80%);
opacity:.35;mix-blend-mode:screen;
transition:--signal 600ms var(--ease-in-out-quart) 300ms;
}
@supports (background-image:radial-gradient(in oklab, #000, #fff)){
.hero-backdrop{background:${vignette},${halo(" in oklab")}}
}
@media (min-width:768px){
.hero-backdrop{--halo-cy:50%;--halo-r:35vmin}
.hero-cone{height:100%}
}`;

export function HeroBackdrop() {
  return (
    <div aria-hidden className="hero-backdrop pointer-events-none absolute inset-0 z-0">
      <style href="hero-backdrop" precedence="medium">
        {css}
      </style>
      <div className="hero-cone" />
    </div>
  );
}
