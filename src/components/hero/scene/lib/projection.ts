import { MathUtils, Vector3, type PerspectiveCamera } from "three";
import { view } from "./viewport";

/** World ↔ canvas px helpers (allocation-free, shared temporaries). */
const tmp = new Vector3();
const dir = new Vector3();

export type Px = { x: number; y: number };

/** Projects a world point to canvas CSS px; returns its view depth. */
export function toPx(p: Vector3, camera: PerspectiveCamera, out: Px): number {
  tmp.copy(p).applyMatrix4(camera.matrixWorldInverse);
  const depth = -tmp.z;
  tmp.applyMatrix4(camera.projectionMatrix);
  out.x = (tmp.x * 0.5 + 0.5) * view.width;
  out.y = (0.5 - tmp.y * 0.5) * view.height;
  return depth;
}

/** Canvas px → point on the world plane z = planeZ (camera ray hit). */
export function fromPx(x: number, y: number, planeZ: number, camera: PerspectiveCamera, out: Vector3): Vector3 {
  const nx = (x / view.width) * 2 - 1;
  const ny = 1 - (y / view.height) * 2;
  dir.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
  const t = Math.abs(dir.z) < 1e-6 ? 0 : (planeZ - camera.position.z) / dir.z;
  return out.copy(camera.position).addScaledVector(dir, t);
}

/** CSS px per world unit at a view depth. */
export function pxPerUnit(depth: number, camera: PerspectiveCamera): number {
  return view.height / (2 * Math.max(0.01, depth) * Math.tan(MathUtils.degToRad(camera.fov) / 2));
}

/** View depth of the world plane z = planeZ along the camera axis (approx.). */
export function depthOfPlane(planeZ: number, camera: PerspectiveCamera): number {
  return Math.max(0.05, camera.position.z - planeZ);
}

/** Camera ray through a canvas px point, for cheap per-plane intersections. */
export type Ray = { ox: number; oy: number; oz: number; dx: number; dy: number; dz: number };

export function rayFromPx(x: number, y: number, camera: PerspectiveCamera, out: Ray): Ray {
  const nx = (x / view.width) * 2 - 1;
  const ny = 1 - (y / view.height) * 2;
  dir.set(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize();
  out.ox = camera.position.x;
  out.oy = camera.position.y;
  out.oz = camera.position.z;
  out.dx = dir.x;
  out.dy = dir.y;
  out.dz = dir.z;
  return out;
}

/** Where the ray meets the plane z = planeZ (writes x, y). */
export function rayAtZ(ray: Ray, planeZ: number, out: { x: number; y: number }): void {
  const t = Math.abs(ray.dz) < 1e-6 ? 0 : (planeZ - ray.oz) / ray.dz;
  out.x = ray.ox + ray.dx * t;
  out.y = ray.oy + ray.dy * t;
}
