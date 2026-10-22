"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Points,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  type PerspectiveCamera,
} from "three";
import { activeCan, canPresets } from "@/config/can";
import { bubbles } from "@/config/intro";
import { seededRandom } from "@/lib/seededRandom";
import { amberPoint } from "../geometry";
import { avoidCursor, depthScale, pushOutOfZones } from "./lib/avoid";
import { inOutQuart, mix, outQuart, progress } from "./lib/easing";
import { scenePalette } from "./lib/palette";
import { depthOfPlane, fromPx, pxPerUnit, toPx, type Px } from "./lib/projection";
import { canBox, scatter, type Band, type ScatterItem } from "./lib/scatter";
import { DROPLET_FLIGHT, stage } from "./lib/stage";
import { view } from "./lib/viewport";

/**
 * Party lights (direction §4, §8): crisp discs of 2–14 px in amber and cold
 * white (flavor.scene.lights, the same for both flavors), additive and HDR
 * so the bloom turns them into bokeh. They make room for the cursor and
 * gather again, ≈ 30 % brighter at the edge of its radius. The wave of a
 * switch passes through them as a brief lift of light.
 *
 * Intro hand-off ("Was bleibt, ist das Licht", direction §6), mode "intro"
 * only, from DROPLET_START:
 * - the six amber points the memory bubbles left in the DOM become amber
 *   lights: they start on exactly that pixel (amberPoint() in geometry.ts,
 *   unprojected at the light's depth) at the DOM point's 4 px and display
 *   brightness, hold while the Tinte lifts (inOutQuart), then are drawn to
 *   their places around the can, growing to their own size and brightness;
 * - the last bubble's droplets (Papier in the DOM) become cold-white lights
 *   that leave the halo ring;
 * - all others fade in.
 * Exclusion zones take hold along the flight, so a light never jumps off
 * the pixel the DOM handed over.
 */
const CAPACITY = 110;
/** The last bubble's droplets (intro/FinalBubble: 10 on the halo ring, seed 97). */
const DROPLETS = 10;
const DROPLET_SEED = 97;
/** The memories before it; each left its amber light behind as a DOM point. */
const MEMORIES = bubbles.slice(0, -1);
/** Diameter of the DOM amber point in CSS px. */
const AMBER_POINT_PX = 4;
/** Extra light at the front of a switch wave (the backdrop draws the same front). */
const WAVE_LIFT = 0.4;
const SEED = 7741;

/**
 * Where a memory's light comes to rest: the amber light whose home is
 * nearest to this share of the way from its point toward the can.
 */
const AMBER_PULL = 0.45;
/** Droplets settle around this multiple of the halo radius (just outside the ring). */
const DROPLET_REACH = 1.45;

const ROLE_NONE = 0;
const ROLE_DROPLET = 1;
const ROLE_AMBER = 2;
/** aTone: 0 = flavor.scene.lights[0] (amber), 1 = lights[1] (cold white). */
const TONE_AMBER = 0;
const TONE_WHITE = 1;

const p = new Vector3();
const free = new Vector3();
const tmp = new Vector3();

const vertexShader = /* glsl */ `
uniform float uDpr;
uniform vec2 uRes;
uniform vec3 uOld0;
uniform vec3 uOld1;
uniform vec3 uNew0;
uniform vec3 uNew1;
uniform vec4 uWave;
uniform float uWaveOn;
uniform float uFade;
attribute float aSize;
attribute float aTone;
attribute float aGain;
attribute float aAlpha;
varying vec3 vColor;
varying float vSize;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec2 px = (gl_Position.xy / gl_Position.w * vec2(0.5, -0.5) + 0.5) * uRes;
  float dw = distance(px, uWave.xy);
  float x = clamp((dw - (uWave.z - uWave.w)) / uWave.w, 0.0, 1.0);
  float m = max(uFade, uWaveOn * (1.0 - x * x * (3.0 - 2.0 * x)));
  float front = uWaveOn * exp(-pow((dw - uWave.z) / (0.12 * uWave.w), 2.0));
  vColor = mix(mix(uOld0, uOld1, aTone), mix(uNew0, uNew1, aTone), m) * aGain * aAlpha * (1.0 + ${WAVE_LIFT.toFixed(2)} * front);
  vSize = max(1.0, aSize * uDpr);
  gl_PointSize = aAlpha > 0.0 ? vSize + 1.0 : 0.0;
}
`;

const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vSize;
void main() {
  // Crisp disc with a one-pixel anti-aliased edge (no soft glow: bloom does that).
  float r = length(gl_PointCoord - 0.5) * (vSize + 1.0);
  float edge = 1.0 - smoothstep(vSize * 0.5 - 0.5, vSize * 0.5 + 0.5, r);
  if (edge <= 0.0) discard;
  gl_FragColor = vec4(vColor * edge, 1.0);
}
`;

type Light = { band: Band; size: number; tone: number; gain: number; phase: number; delay: number; amp: number };

function createLights(): Light[] {
  const rand = seededRandom(SEED);
  return Array.from({ length: CAPACITY }, () => {
    const r = rand();
    const band: Band = r < 0.5 ? "back" : r < 0.85 ? "mid" : "front";
    const sizeRange = band === "back" ? [2, 7] : band === "mid" ? [3, 10] : [6, 14];
    return {
      band,
      size: sizeRange[0]! + rand() ** 1.6 * (sizeRange[1]! - sizeRange[0]!),
      tone: rand() < 0.62 ? TONE_AMBER : TONE_WHITE,
      gain: 1.25 + rand() * 1.35,
      phase: rand() * Math.PI * 2,
      delay: rand() * 0.55,
      amp: 0.03 + rand() * 0.05,
    };
  });
}

/** The last bubble's droplets (same angles as the DOM droplets of the intro). */
function dropletAngles(): number[] {
  const rand = seededRandom(DROPLET_SEED);
  return Array.from({ length: DROPLETS }, (_, i) => {
    const a = (i / DROPLETS) * Math.PI * 2 + (rand() - 0.5) * 0.6 + DROPLET_SEED;
    rand();
    return a;
  });
}

type Handoff = {
  role: Uint8Array;
  /** Start per light in canvas px (x, y): where the DOM left it. */
  from: Float32Array;
  /** Home per light in canvas px (scratch). */
  homePx: Float32Array;
};

const homeTmp = new Vector3();
const homePx: Px = { x: 0, y: 0 };

/**
 * Which lights carry the hand-off, per layout. Each start claims the free
 * light of its tone (amber point → amber, droplet, Papier in the DOM → cold
 * white) whose home lies nearest to where it should go: amber points a share
 * of the way toward the can, droplets just outside the ring. So the six are
 * drawn in toward the can and the droplets fly outward, instead of crossing
 * the scene. No light changes its tone or home: the resting field is the
 * same in every mode.
 */
function assignHandoff(
  h: Handoff,
  lights: readonly Light[],
  home: Float32Array,
  n: number,
  angles: readonly number[],
  camera: PerspectiveCamera,
): void {
  h.role.fill(ROLE_NONE);
  for (let i = 0; i < n; i++) {
    toPx(homeTmp.fromArray(home, i * 3), camera, homePx);
    h.homePx[i * 2] = homePx.x;
    h.homePx[i * 2 + 1] = homePx.y;
  }
  const claim = (role: number, tone: number, sx: number, sy: number, tx: number, ty: number) => {
    let best = -1;
    let bestD = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      if (h.role[i] !== ROLE_NONE || lights[i]!.tone !== tone) continue;
      const d = (h.homePx[i * 2]! - tx) ** 2 + (h.homePx[i * 2 + 1]! - ty) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best < 0) return;
    h.role[best] = role;
    h.from[best * 2] = sx;
    h.from[best * 2 + 1] = sy;
  };
  const { cx, cy, r } = view.halo;
  for (const spec of MEMORIES) {
    const at = amberPoint(spec, window.innerWidth, window.innerHeight);
    const sx = at.x - view.left;
    const sy = at.y - view.top;
    claim(ROLE_AMBER, TONE_AMBER, sx, sy, sx + (cx - sx) * AMBER_PULL, sy + (cy - sy) * AMBER_PULL);
  }
  for (const a of angles) {
    const c = Math.cos(a);
    const s = Math.sin(a);
    claim(ROLE_DROPLET, TONE_WHITE, cx + c * r, cy + s * r, cx + c * r * DROPLET_REACH, cy + s * r * DROPLET_REACH);
  }
}

export function PartyLights({ count }: { count: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const dpr = useThree((s) => s.viewport.dpr);
  const preset = canPresets[activeCan];
  const lights = useMemo(createLights, []);
  const angles = useMemo(dropletAngles, []);
  const state = useRef({
    stamp: "",
    home: new Float32Array(CAPACITY * 3),
    offset: new Float32Array(CAPACITY * 3),
    handoff: {
      role: new Uint8Array(CAPACITY),
      from: new Float32Array(CAPACITY * 2),
      homePx: new Float32Array(CAPACITY * 2),
    } satisfies Handoff,
    /** Hand-off start per light (world): the DOM's pixel at the light's depth. */
    start: new Float32Array(CAPACITY * 3),
  });

  const { points, material, position, alpha, size } = useMemo(() => {
    const geometry = new BufferGeometry();
    const position = new BufferAttribute(new Float32Array(CAPACITY * 3), 3).setUsage(DynamicDrawUsage);
    const alpha = new BufferAttribute(new Float32Array(CAPACITY), 1).setUsage(DynamicDrawUsage);
    const size = new BufferAttribute(Float32Array.from(lights, (l) => l.size), 1).setUsage(DynamicDrawUsage);
    geometry.setAttribute("position", position);
    geometry.setAttribute("aSize", size);
    geometry.setAttribute("aTone", new BufferAttribute(Float32Array.from(lights, (l) => l.tone), 1));
    geometry.setAttribute("aGain", new BufferAttribute(Float32Array.from(lights, (l) => l.gain), 1));
    geometry.setAttribute("aAlpha", alpha);
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uDpr: { value: 1 },
        uRes: { value: new Vector2(1, 1) },
        uOld0: { value: new Vector3() },
        uOld1: { value: new Vector3() },
        uNew0: { value: new Vector3() },
        uNew1: { value: new Vector3() },
        uWave: { value: new Vector4(0, 0, 0, 1) },
        uWaveOn: { value: 0 },
        uFade: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    return { points, material, position, alpha, size };
  }, [lights]);

  useEffect(
    () => () => {
      points.geometry.dispose();
      material.dispose();
    },
    [points, material],
  );

  useFrame(() => {
    const st = state.current;
    const n = Math.min(CAPACITY, count);
    points.geometry.setDrawRange(0, n);

    // view.fit bumps on every window resize, so the amber points follow the DOM layout.
    const stamp = `${view.fit}|${view.zonesStable}|${n}`;
    if (stamp !== st.stamp) {
      st.stamp = stamp;
      const items: ScatterItem[] = lights.slice(0, n).map((l) => ({ band: l.band, size: 0.02 }));
      scatter(items, SEED, camera, canBox(camera, preset.radius, preset.height), st.home, {
        spacing: false,
        avoidCan: false,
        spread: 1.08,
      });
      // Hand-off starts in canvas px, unprojected at each light's own depth.
      const h = st.handoff;
      assignHandoff(h, lights, st.home, n, angles, camera);
      for (let i = 0; i < n; i++) {
        if (h.role[i] === ROLE_NONE) continue;
        fromPx(h.from[i * 2]!, h.from[i * 2 + 1]!, st.home[i * 3 + 2]!, camera, tmp);
        st.start[i * 3] = tmp.x;
        st.start[i * 3 + 1] = tmp.y;
        st.start[i * 3 + 2] = tmp.z;
      }
    }

    const t = stage.elapsed;
    const dt = stage.dt;
    const pos = position.array as Float32Array;
    const al = alpha.array as Float32Array;
    const sz = size.array as Float32Array;
    const handoff = stage.dropletsT !== Number.POSITIVE_INFINITY;
    const shown = stage.dropletsT >= 0 ? 1 : 0;
    const flight = progress(stage.dropletsT, 0, DROPLET_FLIGHT);
    const dropletTravel = outQuart(flight);
    const amberTravel = inOutQuart(flight);
    let resized = false;

    for (let i = 0; i < n; i++) {
      const l = lights[i]!;
      const i3 = i * 3;
      const role = handoff ? st.handoff.role[i]! : ROLE_NONE;
      let x = st.home[i3]!;
      let y = st.home[i3 + 1]!;
      const z = st.home[i3 + 2]!;
      let a: number;
      let travel = 1;
      let lift = 1;
      let px = Math.fround(l.size);
      let breath = 0.9 + 0.1 * Math.sin(t * 0.9 + l.phase);
      if (role !== ROLE_NONE) {
        travel = role === ROLE_AMBER ? amberTravel : dropletTravel;
        x = st.start[i3]! + (x - st.start[i3]!) * travel;
        y = st.start[i3 + 1]! + (y - st.start[i3 + 1]!) * travel;
        a = shown;
        if (role === ROLE_AMBER) {
          // From the DOM point (4 px, exactly #FFA647, steady) to its own size and HDR gain.
          px = Math.fround(mix(AMBER_POINT_PX, l.size, travel));
          lift = mix(1 / l.gain, 1, travel);
          breath = mix(1, breath, travel);
        }
      } else {
        a = progress(stage.lightsIn, l.delay * 0.8, l.delay * 0.8 + 0.45);
      }
      if (sz[i] !== px) {
        sz[i] = px;
        resized = true;
      }
      x += Math.sin(t * 0.21 + l.phase) * l.amp * travel;
      y += Math.cos(t * 0.17 + l.phase * 1.7) * l.amp * travel;

      // Cursor and zones take hold along the flight: the hand-off starts on the DOM's pixel.
      const edge = avoidCursor(st.offset, i, x, y, z, depthScale(z, camera), dt);
      p.set(x + st.offset[i3]! * travel, y + st.offset[i3 + 1]! * travel, z);
      const ppu = pxPerUnit(depthOfPlane(z, camera), camera);
      free.copy(p);
      pushOutOfZones(p, (px * 0.5 + 2) / ppu, l.band === "back", camera);
      if (travel < 1) p.lerpVectors(free, p, travel);
      pos[i3] = p.x;
      pos[i3 + 1] = p.y;
      pos[i3 + 2] = p.z;

      // Brighter at the rim of the cursor's radius; a slow breath otherwise.
      const ring = edge > 0 ? 0.3 * Math.exp(-(((edge - 1) / 0.22) ** 2)) : 0;
      al[i] = a * lift * (1 + ring) * breath;
    }
    position.needsUpdate = true;
    alpha.needsUpdate = true;
    if (resized) size.needsUpdate = true;

    const u = material.uniforms;
    const from = scenePalette(stage.from);
    const to = scenePalette(stage.to);
    u.uDpr!.value = dpr;
    (u.uRes!.value as Vector2).set(view.width, view.height);
    (u.uOld0!.value as Vector3).fromArray(from.lights[0]);
    (u.uOld1!.value as Vector3).fromArray(from.lights[1]);
    (u.uNew0!.value as Vector3).fromArray(to.lights[0]);
    (u.uNew1!.value as Vector3).fromArray(to.lights[1]);
    (u.uWave!.value as Vector4).set(stage.wave.x, stage.wave.y, stage.wave.radius, stage.wave.band);
    u.uWaveOn!.value = stage.wave.on;
    u.uFade!.value = stage.haloFade;
  });

  return <primitive object={points} />;
}
