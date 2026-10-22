import {
  BufferAttribute,
  CircleGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  IcosahedronGeometry,
  PlaneGeometry,
  Shape,
  SphereGeometry,
  type BufferGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { ElementKind } from "@/content/flavors";

/**
 * Element geometry, normalized to a largest dimension of ≈ 1 so the
 * instance scale is the real size in scene units (1 = 100 mm). Material
 * groups: lime [rind, face, face], passion [skin, face], pineapple
 * [face, sides]; the rest use one material.
 */
function ice(): BufferGeometry {
  const g = new RoundedBoxGeometry(1, 0.9, 0.96, 3, 0.13);
  return g;
}

/** Faceted chunk: icosahedron with a position-hashed jitter (shared corners move together). */
function crushedIce(): BufferGeometry {
  const g = new IcosahedronGeometry(0.5, 1);
  const pos = g.getAttribute("position") as BufferAttribute;
  const hash = (x: number, y: number, z: number) => {
    const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return h - Math.floor(h);
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = 0.72 + 0.38 * hash(Math.round(x * 1e3), Math.round(y * 1e3), Math.round(z * 1e3));
    pos.setXYZ(i, x * k, y * k * 0.82, z * k);
  }
  g.computeVertexNormals();
  return g;
}

/** Lime wheel ≈ 5.5 cm across, 1 cm thick; faces along z. */
function lime(): BufferGeometry {
  const g = new CylinderGeometry(0.5, 0.5, 0.11, 48, 1);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Mint leaf: a cupped, arched grid (the serrated outline comes from the alpha map). */
function mint(): BufferGeometry {
  const g = new PlaneGeometry(0.5, 1, 8, 20);
  const pos = g.getAttribute("position") as BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const across = x / 0.25;
    const along = y + 0.5;
    pos.setZ(i, 0.07 * across * across - 0.12 * (along - 0.45) * (along - 0.45) + 0.03 * across * along);
  }
  g.computeVertexNormals();
  return g;
}

/** Half a yellow passion fruit: dome (skin) plus the cut face looking down -y. */
function passion(): BufferGeometry {
  const dome = new SphereGeometry(0.5, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 1.06, 1);
  const face = new CircleGeometry(0.5, 48);
  face.rotateX(Math.PI / 2);
  const g = mergeGeometries([dome, face], true);
  dome.dispose();
  face.dispose();
  if (!g) throw new Error("passion geometry");
  g.translate(0, -0.2, 0);
  return g;
}

/** Mango cube from the hedgehog cut, slightly irregular. */
function mango(): BufferGeometry {
  const g = new RoundedBoxGeometry(1, 0.88, 0.94, 3, 0.2);
  return g;
}

const RIND = new Color("#5E4A1E");
const FLESH = new Color("#E7B640");

/** Pineapple wedge with the rind on its outer arc (vertex colors on the side walls). */
function pineapple(): BufferGeometry {
  const R = 0.5;
  const r = 0.07;
  const a = 0.38;
  const shape = new Shape();
  const up = Math.PI / 2;
  shape.moveTo(Math.cos(up - a) * r, Math.sin(up - a) * r);
  shape.absarc(0, 0, R, up - a, up + a, false);
  shape.lineTo(Math.cos(up + a) * r, Math.sin(up + a) * r);
  shape.absarc(0, 0, r, up + a, up - a, true);
  const g = new ExtrudeGeometry(shape, {
    depth: 0.26,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.018,
    bevelSegments: 2,
    curveSegments: 14,
  });
  const pos = g.getAttribute("position") as BufferAttribute;
  const uv = g.getAttribute("uv") as BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Cap UVs: shape space → the cross-section texture (center 0.5, radius 0.5).
    uv.setXY(i, x + 0.5, y + 0.5);
    const c = Math.hypot(x, y) > R - 0.012 ? RIND : FLESH;
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new BufferAttribute(colors, 3));
  g.center();
  return g;
}

export function createGeometry(kind: ElementKind): BufferGeometry {
  switch (kind) {
    case "ice":
      return ice();
    case "crushedIce":
      return crushedIce();
    case "lime":
      return lime();
    case "mint":
      return mint();
    case "passion":
      return passion();
    case "mango":
      return mango();
    case "pineapple":
      return pineapple();
  }
}
