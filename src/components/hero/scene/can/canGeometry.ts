import {
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Path,
  Shape,
  TorusGeometry,
  Vector2,
  type BufferGeometry,
} from "three";
import type { CanPreset } from "@/config/can";

/**
 * Can geometry from a preset (src/config/can.ts; 1 unit = 100 mm), centered
 * on its mid-height. Body: LatheGeometry from the bottom dome over the
 * standing ring, the straight wall, the neck and the double seam to the
 * countersunk lid. The label is a separate open cylinder (Lathe UVs follow
 * the point index, not the arc length) whose u = 0.5 faces the camera and
 * whose seam sits at the back.
 */
export type CanParts = {
  body: BufferGeometry;
  label: BufferGeometry;
  rim: BufferGeometry;
  tab: BufferGeometry;
  /** Lip height and radius (rim glow), lid panel height (tab), all centered. */
  lipY: number;
  lipRadius: number;
  lidY: number;
};

export function canProfile(p: CanPreset): Vector2[] {
  const R = p.radius;
  const H = p.height;
  const lid = R * 0.86;
  const bodyTop = p.labelY + p.labelHeight;
  const neckTop = H - 0.028;
  const pts: Array<[number, number]> = [
    [0, 0.072],
    [R * 0.42, 0.06],
    [R * 0.68, 0.034],
    [R * 0.78, 0.008],
    [R * 0.83, 0],
    [R * 0.9, 0.004],
    [R * 0.965, 0.022],
    [R, 0.058],
    [R, bodyTop],
    [R * 0.994, bodyTop + 0.014],
    [lid + (R - lid) * 0.5, bodyTop + (neckTop - bodyTop) * 0.55],
    [lid + 0.005, neckTop - 0.008],
    [lid + 0.007, neckTop],
    [lid + 0.008, H - 0.007],
    [lid + 0.003, H],
    [lid - 0.005, H - 0.004],
    [lid - 0.009, H - 0.02],
    [lid - 0.016, H - 0.027],
    [lid - 0.024, H - 0.021],
    [0, H - 0.021],
  ];
  return pts.map(([r, y]) => new Vector2(r, y - H / 2));
}

/** Stay-on tab: rounded plate with the finger hole, lying on the lid. */
function stayTab(R: number): BufferGeometry {
  const w = R * 0.38;
  const l = R * 0.72;
  const r = w * 0.48;
  const shape = new Shape();
  shape.moveTo(-w / 2 + r, -l / 2);
  shape.lineTo(w / 2 - r, -l / 2);
  shape.quadraticCurveTo(w / 2, -l / 2, w / 2, -l / 2 + r);
  shape.lineTo(w / 2, l / 2 - r);
  shape.quadraticCurveTo(w / 2, l / 2, w / 2 - r, l / 2);
  shape.lineTo(-w / 2 + r, l / 2);
  shape.quadraticCurveTo(-w / 2, l / 2, -w / 2, l / 2 - r);
  shape.lineTo(-w / 2, -l / 2 + r);
  shape.quadraticCurveTo(-w / 2, -l / 2, -w / 2 + r, -l / 2);
  const hole = new Path();
  hole.absellipse(0, -l * 0.18, w * 0.3, l * 0.2, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const g = new ExtrudeGeometry(shape, {
    depth: 0.004,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 1,
    curveSegments: 10,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}

export function createCanParts(p: CanPreset, segments: number): CanParts {
  const H = p.height;
  const lidR = p.radius * 0.86;
  const body = new LatheGeometry(canProfile(p), segments);

  const label = new CylinderGeometry(
    p.radius * 1.002,
    p.radius * 1.002,
    p.labelHeight,
    segments,
    1,
    true,
    -Math.PI,
    Math.PI * 2,
  );
  label.translate(0, p.labelY + p.labelHeight / 2 - H / 2, 0);

  const lipY = H / 2 - 0.004;
  const lipRadius = lidR + 0.004;
  const rim = new TorusGeometry(lipRadius, 0.0055, 8, Math.max(48, segments));
  rim.rotateX(Math.PI / 2);
  rim.translate(0, lipY, 0);

  const lidY = H / 2 - 0.021;
  const tab = stayTab(p.radius);
  // Rivet at the lid center, the tab reaching toward the front edge.
  tab.translate(0, lidY + 0.003, p.radius * 0.72 * 0.18);

  return { body, label, rim, tab, lipY, lipRadius, lidY };
}

export function disposeCanParts(parts: CanParts): void {
  parts.body.dispose();
  parts.label.dispose();
  parts.rim.dispose();
  parts.tab.dispose();
}
