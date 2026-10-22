import {
  Color,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Material,
  type PerspectiveCamera,
} from "three";
import type { ElementKind, Flavor, FlavorSlug } from "@/content/flavors";
import { seededRandom } from "@/lib/seededRandom";
import { avoidCursor, depthScale, pushOutOfZones } from "../lib/avoid";
import { outExpo, outQuart, progress } from "../lib/easing";
import { canBox, scatter, type Band, type ScatterItem } from "../lib/scatter";
import { stage } from "../lib/stage";
import { view } from "../lib/viewport";
import { KINDS } from "./kinds";

/**
 * One flavor's floating elements: an InstancedMesh per kind plus the
 * simulation state. Both flavors' sets stay mounted; `presence` (0..1 per
 * element) carries a switch: the old set drifts outward and fades in 300 ms,
 * the new one comes from depth in 700 ms with a 20 ms stagger (§7.5).
 */
type Item = {
  kind: ElementKind;
  slot: number;
  band: Band;
  size: number;
  axis: Vector3;
  base: Quaternion;
  angle: number;
  spin: number;
  phase: number;
  amp: number;
};

export type FieldSet = {
  slug: FlavorSlug;
  seed: number;
  items: Item[];
  meshes: Map<ElementKind, InstancedMesh>;
  /** Smoothed home, layout target, cursor offset (xyz per item). */
  home: Float32Array;
  target: Float32Array;
  offset: Float32Array;
  presence: Float32Array;
  active: boolean[];
  laidOut: boolean;
  layoutStamp: string;
};

const LEAVE = 0.3;
const ENTER = 0.7;
const ENTER_AT = 0.25;
const STAGGER = 0.02;
/** Intro / return visit flight out of the light: 15 ms apart (direction §6). */
const FLIGHT_STAGGER = 0.015;
const DEPTH_FROM = 2.4;
const DRIFT_OUT = 0.7;
const FLOAT = { back: 0.05, mid: 0.07, front: 0.09 } as const;
const BAND_SHADE = { back: 0.72, mid: 0.92, front: 1 } as const;
const HOME_FOLLOW = 2.5;
/** Can center (the reveal rises from slightly below). */
const ORIGIN = new Vector3(0, -0.15, 0);

const m4 = new Matrix4();
const q = new Quaternion();
const pos = new Vector3();
const scl = new Vector3();
const col = new Color();

export function createFieldSet(
  flavor: Flavor,
  geometries: Map<ElementKind, BufferGeometry>,
  materials: Map<ElementKind, Material | Material[]>,
): FieldSet {
  const rand = seededRandom(flavor.seed * 7 + 3);
  const remaining = new Map(flavor.elements.map((e) => [e.kind, e.count]));
  const slots = new Map<ElementKind, number>();
  const items: Item[] = [];
  // Round-robin over kinds, so a reduced count keeps the mix.
  while ([...remaining.values()].some((n) => n > 0)) {
    for (const [kind, n] of remaining) {
      if (n <= 0) continue;
      remaining.set(kind, n - 1);
      const slot = slots.get(kind) ?? 0;
      slots.set(kind, slot + 1);
      const spec = KINDS[kind];
      const r = rand();
      const band: Band = r < 0.22 * spec.front ? "front" : r < 0.22 * spec.front + 0.4 ? "back" : "mid";
      const axis = new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      const base = new Quaternion().setFromAxisAngle(
        new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
        rand() * Math.PI * 2,
      );
      items.push({
        kind,
        slot,
        band,
        size: spec.size[0] + rand() * (spec.size[1] - spec.size[0]),
        axis,
        base,
        angle: rand() * Math.PI * 2,
        spin: (spec.spin[0] + rand() * (spec.spin[1] - spec.spin[0])) * (rand() > 0.5 ? 1 : -1),
        phase: rand() * Math.PI * 2,
        amp: FLOAT[band] * (0.7 + rand() * 0.6),
      });
    }
  }

  const meshes = new Map<ElementKind, InstancedMesh>();
  for (const [kind, count] of slots) {
    const mesh = new InstancedMesh(geometries.get(kind)!, materials.get(kind)!, count);
    mesh.frustumCulled = false;
    mesh.name = `${flavor.slug}-${kind}`;
    // instanceColor must exist before the first compile (USE_INSTANCING_COLOR).
    for (let i = 0; i < count; i++) mesh.setColorAt(i, col.setRGB(1, 1, 1));
    meshes.set(kind, mesh);
  }

  const n = items.length;
  return {
    slug: flavor.slug,
    seed: flavor.seed,
    items,
    meshes,
    home: new Float32Array(n * 3),
    target: new Float32Array(n * 3),
    offset: new Float32Array(n * 3),
    presence: new Float32Array(n).fill(flavor.slug === stage.to ? 1 : 0),
    active: items.map(() => true),
    laidOut: false,
    layoutStamp: "",
  };
}

/** Which items are shown at this quality (`factor` × flavor counts, ≥ 1 per kind). */
function activeCounts(set: FieldSet, factor: number): Map<ElementKind, number> {
  const totals = new Map<ElementKind, number>();
  for (const it of set.items) totals.set(it.kind, (totals.get(it.kind) ?? 0) + 1);
  const out = new Map<ElementKind, number>();
  for (const [kind, total] of totals) out.set(kind, Math.max(1, Math.round(total * factor)));
  return out;
}

function layout(set: FieldSet, camera: PerspectiveCamera, counts: Map<ElementKind, number>, canRadius: number, canHeight: number): void {
  const list: ScatterItem[] = [];
  const index: number[] = [];
  set.items.forEach((it, i) => {
    set.active[i] = it.slot < (counts.get(it.kind) ?? 0);
    if (set.active[i]) {
      list.push({ band: it.band, size: it.size });
      index.push(i);
    }
  });
  const out = new Float32Array(list.length * 3);
  scatter(list, set.seed, camera, canBox(camera, canRadius, canHeight), out);
  index.forEach((i, k) => {
    set.target[i * 3] = out[k * 3]!;
    set.target[i * 3 + 1] = out[k * 3 + 1]!;
    set.target[i * 3 + 2] = out[k * 3 + 2]!;
  });
  if (!set.laidOut) set.home.set(set.target);
  set.laidOut = true;
  for (const [kind, mesh] of set.meshes) mesh.count = counts.get(kind) ?? 0;
}

/** Presence target of item `rank` for this set at the current switch time. */
function presenceTarget(slug: FlavorSlug, rank: number): number {
  const s = stage.switchS;
  if (stage.from === stage.to) return slug === stage.to ? 1 : 0;
  if (!stage.motion) {
    const f = progress(s, 0, 0.2);
    return slug === stage.to ? f : slug === stage.from ? 1 - f : 0;
  }
  if (slug === stage.to) {
    const at = ENTER_AT + rank * STAGGER;
    return outExpo(progress(s, at, at + ENTER));
  }
  if (slug === stage.from) {
    const at = rank * STAGGER * 0.5;
    return 1 - outQuart(progress(s, at, at + LEAVE));
  }
  return 0;
}

export function updateFieldSet(
  set: FieldSet,
  camera: PerspectiveCamera,
  factor: number,
  canRadius: number,
  canHeight: number,
  zonesStable: number,
): void {
  const counts = activeCounts(set, factor);
  const stamp = `${view.fit}|${zonesStable}|${[...counts.values()].join(",")}`;
  if (stamp !== set.layoutStamp) {
    set.layoutStamp = stamp;
    layout(set, camera, counts, canRadius, canHeight);
  }

  const dt = stage.dt;
  const t = stage.elapsed;
  const entering = stage.from !== stage.to && set.slug === stage.to;
  const leaving = stage.from !== stage.to && set.slug === stage.from;
  let anyVisible = false;
  let rank = 0;
  let flightRank = 0;
  const activeTotal = set.active.filter(Boolean).length;
  const flightStep = Math.min(FLIGHT_STAGGER, 0.3 / Math.max(1, activeTotal - 1));

  for (let i = 0; i < set.items.length; i++) {
    if (!set.active[i]) continue;
    const it = set.items[i]!;
    const mesh = set.meshes.get(it.kind)!;
    const i3 = i * 3;

    // Presence: monotonic per direction, so a reversed switch never jumps.
    const target = presenceTarget(set.slug, rank++);
    const prev = set.presence[i]!;
    const p = set.slug === stage.to ? Math.max(prev, target) : Math.min(prev, target);
    set.presence[i] = p;

    // Home follows a new layout softly.
    for (let k = 0; k < 3; k++) {
      set.home[i3 + k] = dt > 0 ? set.home[i3 + k]! + (set.target[i3 + k]! - set.home[i3 + k]!) * (1 - Math.exp(-HOME_FOLLOW * dt)) : set.target[i3 + k]!;
    }
    const hx = set.home[i3]!;
    const hy = set.home[i3 + 1]!;
    const hz = set.home[i3 + 2]!;

    // Flight out of the light (intro / return visit).
    const at = flightRank++ * flightStep;
    const span = Math.max(0.3, stage.elementsSpan - 0.3);
    const fl = stage.elementsT === Number.POSITIVE_INFINITY ? 1 : outExpo(progress(stage.elementsT, at, at + span));

    let x = ORIGIN.x + (hx - ORIGIN.x) * fl;
    let y = ORIGIN.y + (hy - ORIGIN.y) * fl;
    let z = ORIGIN.z + (hz - ORIGIN.z) * fl;

    // Gentle float.
    x += Math.sin(t * 0.31 + it.phase) * it.amp;
    y += Math.cos(t * 0.23 + it.phase * 1.3) * it.amp * 1.3;
    z += Math.sin(t * 0.17 + it.phase * 0.7) * it.amp * 0.6;

    // Switch: the old set drifts outward, the new one arrives from depth.
    if (stage.motion && p < 1) {
      if (leaving) {
        const len = Math.hypot(hx, hy) || 1;
        x += (hx / len) * DRIFT_OUT * (1 - p);
        y += (hy / len) * DRIFT_OUT * (1 - p);
      } else if (entering) {
        z -= DEPTH_FROM * (1 - p);
      }
    }

    // Cursor.
    const ds = depthScale(z, camera);
    avoidCursor(set.offset, i, x, y, z, ds, dt);
    pos.set(x + set.offset[i3]!, y + set.offset[i3 + 1]!, z);

    const s = it.size * fl * (p >= 1 ? 1 : 0.15 + 0.85 * p);
    pushOutOfZones(pos, s * 0.5, it.band === "back", camera);

    q.setFromAxisAngle(it.axis, it.angle + it.spin * t + (set.offset[i3]! - set.offset[i3 + 1]!) * 0.6);
    q.premultiply(it.base);
    scl.setScalar(p > 0.001 && fl > 0.001 ? s : 0);
    m4.compose(pos, q, scl);
    mesh.setMatrixAt(it.slot, m4);
    const shade = BAND_SHADE[it.band] * p;
    mesh.setColorAt(it.slot, col.setRGB(shade, shade, shade));
    if (p > 0.001) anyVisible = true;
  }

  for (const mesh of set.meshes.values()) {
    mesh.visible = anyVisible;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
}

export function disposeFieldSet(set: FieldSet): void {
  for (const mesh of set.meshes.values()) mesh.dispose();
}
