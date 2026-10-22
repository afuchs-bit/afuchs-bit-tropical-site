import { MathUtils, type PerspectiveCamera, type Vector3 } from "three";
import { pointer } from "./pointer";
import { depthOfPlane, pxPerUnit, rayAtZ, rayFromPx, toPx, type Px, type Ray } from "./projection";
import { stage } from "./stage";
import { view } from "./viewport";

/**
 * The two forces every floating thing obeys (direction §8, Prinzip 31):
 *
 * - Cursor: the pointer ray meets each element's depth plane; inside a
 *   radius of ≈ 1.4 units (scaled with depth, so it feels the same on
 *   screen) the push is (1 − d/r)², at most ≈ 0.9 units; the way back is a
 *   frame-rate independent damp with λ 3.5. Fine hovering pointers only.
 * - Exclusion zones: nothing enters a hard zone (copy, CTAs, cards,
 *   header); soft zones (headline) admit the back band only. Pushed out
 *   along the shortest axis, every frame, no state.
 */
export const AVOID = { radius: 1.4, max: 0.9, out: 8, back: 3.5 } as const;

const ray: Ray = { ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: 1 };
const hit = { x: 0, y: 0 };
const px: Px = { x: 0, y: 0 };
let rayOn = false;
let depth0 = 1;

/** Once per frame, before the elements: the pointer ray (or none). */
export function preparePointer(camera: PerspectiveCamera): void {
  rayOn = stage.motion && pointer.fine && pointer.inside;
  depth0 = depthOfPlane(0, camera);
  if (rayOn) rayFromPx(pointer.x - view.left, pointer.y - view.top, camera, ray);
}

/** Depth scale of a plane relative to the can's plane. */
export function depthScale(z: number, camera: PerspectiveCamera): number {
  return depthOfPlane(z, camera) / depth0;
}

/**
 * Damps `offset` (x, y at index i*3) toward the cursor push for an element
 * resting at (x, y, z). Returns the push strength 0..1 (lights use it).
 */
export function avoidCursor(
  offset: Float32Array,
  i: number,
  x: number,
  y: number,
  z: number,
  scale: number,
  dt: number,
): number {
  let tx = 0;
  let ty = 0;
  let edge = 0;
  if (rayOn) {
    rayAtZ(ray, z, hit);
    const dx = x - hit.x;
    const dy = y - hit.y;
    const d = Math.hypot(dx, dy);
    const r = AVOID.radius * scale;
    if (d < r && d > 1e-5) {
      const f = (1 - d / r) ** 2;
      tx = (dx / d) * AVOID.max * scale * f;
      ty = (dy / d) * AVOID.max * scale * f;
    }
    edge = d / r;
  }
  const ox = offset[i * 3]!;
  const oy = offset[i * 3 + 1]!;
  const pushing = tx * tx + ty * ty > ox * ox + oy * oy;
  const lambda = pushing ? AVOID.out : AVOID.back;
  offset[i * 3] = MathUtils.damp(ox, tx, lambda, dt);
  offset[i * 3 + 1] = MathUtils.damp(oy, ty, lambda, dt);
  return edge;
}

/**
 * Pushes `pos` out of every zone its band may not enter. `radius` is the
 * element's world radius. Writes back into pos.
 */
export function pushOutOfZones(pos: Vector3, radius: number, back: boolean, camera: PerspectiveCamera): void {
  if (view.zones.length === 0) return;
  const depth = toPx(pos, camera, px);
  if (depth <= 0) return;
  const ppu = pxPerUnit(depth, camera);
  const r = radius * ppu;
  for (const z of view.zones) {
    if (z.soft && back) continue;
    if (px.x + r <= z.x0 || px.x - r >= z.x1 || px.y + r <= z.y0 || px.y - r >= z.y1) continue;
    const left = px.x + r - z.x0;
    const right = z.x1 - (px.x - r);
    const up = px.y + r - z.y0;
    const down = z.y1 - (px.y - r);
    const m = Math.min(left, right, up, down);
    let dx = 0;
    let dy = 0;
    if (m === left) dx = -left;
    else if (m === right) dx = right;
    else if (m === up) dy = -up;
    else dy = down;
    px.x += dx;
    px.y += dy;
    // Canvas px (y down) → world units on the element's plane (y up).
    pos.x += dx / ppu;
    pos.y -= dy / ppu;
  }
}
