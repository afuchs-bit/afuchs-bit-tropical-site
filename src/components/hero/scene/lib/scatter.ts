import { Vector3, type PerspectiveCamera } from "three";
import { seededRandom } from "@/lib/seededRandom";
import { depthOfPlane, fromPx, pxPerUnit } from "./projection";
import { blockedAt, view } from "./viewport";

/**
 * Home positions on an elliptic ring around the can, in depth bands.
 * Candidates are drawn in canvas px (seeded, so a layout is stable between
 * visits), rejected against the exclusion zones (hard: never; soft: only the
 * back band), the can and each other, then projected onto their depth plane.
 */
export type Band = "back" | "mid" | "front";

export const BANDS: Record<Band, { z: [number, number]; ring: [number, number] }> = {
  back: { z: [-2.6, -1.4], ring: [0.05, 0.85] },
  mid: { z: [-0.8, 0.4], ring: [0.12, 0.9] },
  front: { z: [0.6, 1.1], ring: [0.45, 1] },
};

export type ScatterItem = { band: Band; size: number };

export type CanBox = { halfWidth: number; halfHeight: number };

const TRIES = 48;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const tmp = new Vector3();

export function scatter(
  items: readonly ScatterItem[],
  seed: number,
  camera: PerspectiveCamera,
  can: CanBox,
  out: Float32Array,
  options: { spacing: boolean; avoidCan: boolean; spread?: number } = { spacing: true, avoidCan: true },
): void {
  const rand = seededRandom(seed);
  const { cx, cy } = view.halo;
  const W = view.width;
  const H = view.height;
  const spread = options.spread ?? 1;
  // Outer ellipse fills the canvas; inner ellipse hugs the can.
  const ex = W * 0.48 * spread;
  const ey = H * 0.47 * spread;
  const ix = can.halfWidth * 1.25;
  const iy = can.halfHeight * 0.8;
  const placed: Array<{ x: number; y: number; r: number }> = [];

  items.forEach((item, i) => {
    const band = BANDS[item.band];
    let best: { x: number; y: number; z: number; r: number; score: number } | null = null;
    for (let k = 0; k < TRIES; k++) {
      const z = band.z[0] + rand() * (band.z[1] - band.z[0]);
      const ppu = pxPerUnit(depthOfPlane(z, camera), camera);
      const r = (item.size / 2) * ppu;
      const theta = i * GOLDEN + (rand() - 0.5) * 1.2 + k * 0.37;
      const rho = band.ring[0] + rand() * (band.ring[1] - band.ring[0]);
      const x = cx + Math.cos(theta) * (ix + (ex - ix) * rho);
      const y = cy + Math.sin(theta) * (iy + (ey - iy) * rho);

      let score = 0;
      const margin = item.band === "front" ? -0.3 * r : r;
      if (x < margin || x > W - margin || y < margin || y > H - margin) score += 4;
      if (blockedAt(x, y, r, item.band === "back")) score += 100;
      if (
        options.avoidCan &&
        Math.abs(x - cx) < can.halfWidth + r * 0.6 &&
        Math.abs(y - cy) < can.halfHeight + r * 0.4
      ) {
        score += 8;
      }
      if (options.spacing) {
        for (const p of placed) {
          const d = Math.hypot(p.x - x, p.y - y);
          const need = (p.r + r) * 1.2;
          if (d < need) score += 2 * (1 - d / need);
        }
      }
      if (!best || score < best.score) best = { x, y, z, r, score };
      if (score === 0) break;
    }
    const b = best!;
    placed.push({ x: b.x, y: b.y, r: b.r });
    fromPx(b.x, b.y, b.z, camera, tmp);
    out[i * 3] = tmp.x;
    out[i * 3 + 1] = tmp.y;
    out[i * 3 + 2] = tmp.z;
  });
}

/** Can extent in canvas px (for layouts), from its world size at z = 0. */
export function canBox(camera: PerspectiveCamera, radius: number, height: number): CanBox {
  const ppu = pxPerUnit(depthOfPlane(0, camera), camera);
  // Tilt (≈ 9°) widens the silhouette a little.
  return { halfWidth: (radius + height * 0.08) * ppu, halfHeight: height * 0.5 * ppu };
}
