import { getZones } from "../../exclusion";
import { haloGeometry, isMobileLayout, MOBILE_SCENE_HEIGHT } from "../../geometry";

/**
 * Where the canvas sits in the viewport, and everything the scene derives
 * from DOM space: the halo in canvas px and the exclusion zones in canvas
 * px. Module singleton: one hero, one canvas.
 */
export type PxZone = { soft: boolean; x0: number; y0: number; x1: number; y1: number };

export const view = {
  /** Canvas rect in viewport CSS px (follows scroll). */
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  mobile: false,
  /** Halo center and radius in canvas-local CSS px (haloGeometry). */
  halo: { cx: 0.5, cy: 0.5, r: 1 },
  /** Bumps when size or halo changed (camera fit, layouts). */
  version: 0,
  /** Bumps after every camera fit; layouts that project through the camera follow it. */
  fit: 0,
  /** Exclusion zones in canvas-local CSS px, refreshed per frame. */
  zones: [] as PxZone[],
  /** Changes whenever a zone moved by ≥ 2 px. */
  zonesKey: 0,
  /** zonesKey once it held still for ZONES_SETTLE ms (layouts follow this one). */
  zonesStable: 0,
};

const ZONES_SETTLE = 250;
let zonesChangedAt = 0;

function measure(el: HTMLElement, sizeChanged: boolean): void {
  const r = el.getBoundingClientRect();
  view.left = r.left;
  view.top = r.top;
  if (!sizeChanged && r.width === view.width && r.height === view.height) return;
  view.width = Math.max(1, r.width);
  view.height = Math.max(1, r.height);
  const vw = window.innerWidth;
  view.mobile = isMobileLayout(vw);
  // Mobile: the canvas is 62svh; derive svh from it so the URL bar does not
  // shift the halo. Desktop: the viewport, exactly what the DOM halo uses.
  const vh = view.mobile ? view.height / MOBILE_SCENE_HEIGHT : window.innerHeight;
  const g = haloGeometry(vw, vh);
  // Halo is laid out in page space (hero at the page top), so it stays put
  // relative to the canvas while the page scrolls.
  const pageLeft = r.left + window.scrollX;
  const pageTop = r.top + window.scrollY;
  view.halo.cx = g.cx - pageLeft;
  view.halo.cy = g.cy - pageTop;
  view.halo.r = g.r;
  view.version++;
}

/** Tracks the canvas element; returns the cleanup. */
export function attachViewport(el: HTMLElement): () => void {
  const onSize = () => measure(el, true);
  const onScroll = () => measure(el, false);
  onSize();
  const ro = new ResizeObserver(onSize);
  ro.observe(el);
  window.addEventListener("resize", onSize);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    ro.disconnect();
    window.removeEventListener("resize", onSize);
    window.removeEventListener("scroll", onScroll);
  };
}

/** Converts the registered DOM zones (viewport px) into canvas px. */
export function refreshZones(now: number): void {
  const before = view.zonesKey;
  const out = view.zones;
  let i = 0;
  let key = 17;
  for (const z of getZones().values()) {
    const zone = out[i] ?? { soft: false, x0: 0, y0: 0, x1: 0, y1: 0 };
    zone.soft = z.kind === "soft";
    zone.x0 = z.left - view.left;
    zone.y0 = z.top - view.top;
    zone.x1 = z.right - view.left;
    zone.y1 = z.bottom - view.top;
    out[i] = zone;
    key = (key * 31 + (zone.soft ? 7 : 3)) | 0;
    key = (key * 31 + Math.round(zone.x0 / 2)) | 0;
    key = (key * 31 + Math.round(zone.y0 / 2)) | 0;
    key = (key * 31 + Math.round(zone.x1 / 2)) | 0;
    key = (key * 31 + Math.round(zone.y1 / 2)) | 0;
    i++;
  }
  out.length = i;
  view.zonesKey = (key * 31 + i) | 0;
  if (view.zonesKey !== before) zonesChangedAt = now;
  if (view.zonesStable !== view.zonesKey && now - zonesChangedAt >= ZONES_SETTLE) view.zonesStable = view.zonesKey;
}

/** True if (x, y) with radius r lies in a zone the given depth band may not enter. */
export function blockedAt(x: number, y: number, r: number, backBand: boolean): boolean {
  for (const z of view.zones) {
    if (z.soft && backBand) continue;
    if (x + r > z.x0 && x - r < z.x1 && y + r > z.y0 && y - r < z.y1) return true;
  }
  return false;
}
