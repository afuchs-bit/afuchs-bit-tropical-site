"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { BufferAttribute, BufferGeometry, Mesh, ShaderMaterial, Vector2, Vector3, Vector4 } from "three";
import { AGX_INVERSE_GLSL } from "./lib/agx";
import { CONE, DISC, HALO_STOPS, VIGNETTE } from "./lib/halo";
import { scenePalette, type Rgb } from "./lib/palette";
import { stage } from "./lib/stage";
import { view } from "./lib/viewport";

/**
 * The night behind the can: a screen-space halo with exactly the center,
 * radius, stops, vignette and cone of the CSS backdrop (HeroBackdrop.tsx)
 * and the DOM halo of the intro, so neither hand-off jumps.
 *
 * Composed like CSS: the halo interpolates in OKLab, the vignette and the
 * cone (CONE.rest, like the CSS layer; the intro's flash is the DOM light on
 * top) composite in display sRGB; dithered against banding, then run
 * through the inverse of the composer's AgX tone mapping so the screen
 * shows the palette colors exactly.
 *
 * Flavor switch: a wave from the clicked card mixes the halo old → new in
 * OKLab (Tropical's mango amber → Limette Minze's yellower amber over a
 * greener graphite) and dims the mixing band to 70 %. The light itself
 * (Signal: cone, wave front) is the same amber for both flavors.
 */
const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const f = (n: number) => n.toFixed(4);

const fragmentShader = /* glsl */ `
uniform vec2 uRes;
uniform vec3 uHalo;
uniform vec3 uOld[4];
uniform vec3 uNew[4];
uniform vec3 uSignalOld;
uniform vec3 uSignalNew;
uniform vec3 uDisc[3];
uniform vec3 uInk;
uniform float uBurst;
uniform float uFade;
uniform float uWaveOn;
uniform vec4 uWave;
varying vec2 vUv;

${AGX_INVERSE_GLSL}

vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 toGamma(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
vec3 linearToLab(vec3 c) {
  float l = pow(max(0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b, 0.0), 1.0 / 3.0);
  float m = pow(max(0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b, 0.0), 1.0 / 3.0);
  float s = pow(max(0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
  );
}
vec3 labToLinear(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

// CSS stops in multiples of the halo radius (lib/halo.ts), interpolated in OKLab.
vec3 haloAt(vec3 s[4], float d) {
  if (d < ${f(HALO_STOPS.mid)}) return mix(s[0], s[1], d / ${f(HALO_STOPS.mid)});
  if (d < ${f(HALO_STOPS.deep)}) return mix(s[1], s[2], (d - ${f(HALO_STOPS.mid)}) / ${f(HALO_STOPS.deep - HALO_STOPS.mid)});
  if (d < ${f(HALO_STOPS.edge)}) return mix(s[2], s[3], (d - ${f(HALO_STOPS.deep)}) / ${f(HALO_STOPS.edge - HALO_STOPS.deep)});
  return s[3];
}

// The last bubble's light disc (premultiplied falloff past the radius, like CSS).
vec4 discAt(float d, vec3 mid) {
  if (d < ${f(DISC.coreAt)}) return vec4(mix(uDisc[0], uDisc[1], d / ${f(DISC.coreAt)}), 1.0);
  if (d < 1.0) return vec4(mix(uDisc[1], uDisc[2], (d - ${f(DISC.coreAt)}) / ${f(1 - DISC.coreAt)}), 1.0);
  if (d < ${f(DISC.knee)}) {
    float t = (d - 1.0) / ${f(DISC.knee - 1)};
    float a = mix(1.0, ${f(DISC.kneeAlpha)}, t);
    return vec4(mix(uDisc[2], mid * ${f(DISC.kneeAlpha)}, t) / a, a);
  }
  float t = clamp((d - ${f(DISC.knee)}) / ${f(DISC.end - DISC.knee)}, 0.0, 1.0);
  return vec4(mid, ${f(DISC.kneeAlpha)} * (1.0 - t));
}

float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

void main() {
  vec2 px = vec2(vUv.x * uRes.x, (1.0 - vUv.y) * uRes.y);
  float d = distance(px, uHalo.xy) / uHalo.z;

  // Wave: 0 = old flavor, 1 = new, soft front of width uWave.w.
  float dw = distance(px, uWave.xy);
  float x = clamp((dw - (uWave.z - uWave.w)) / uWave.w, 0.0, 1.0);
  float m = max(uFade, uWaveOn * (1.0 - x * x * (3.0 - 2.0 * x)));

  // OKLab all the way: the CSS gradient and the switch mix share the space.
  vec3 lin = labToLinear(mix(haloAt(uOld, d), haloAt(uNew, d), m));
  lin *= 1.0 - 1.2 * m * (1.0 - m) * uWaveOn;
  vec3 col = toGamma(lin);

  // Vignette layer of the CSS backdrop.
  vec2 e = vec2((px.x - 0.5 * uRes.x) / (${f(VIGNETTE.rx)} * uRes.x), (px.y - uHalo.y) / (${f(VIGNETTE.ry)} * uRes.y));
  col = mix(col, uInk, ${f(VIGNETTE.alpha)} * clamp((length(e) - ${f(VIGNETTE.from)}) / ${f(1 - VIGNETTE.from)}, 0.0, 1.0));

  // Light cone from above, screen-blended in Signal.
  vec2 v = px - vec2(0.5 * uRes.x, ${f(CONE.apexY)} * uRes.y);
  float ang = degrees(atan(abs(v.x), max(v.y, 1e-3)));
  float cover = ang < ${f(CONE.innerDeg)}
    ? mix(1.0, ${f(CONE.innerAlpha)}, ang / ${f(CONE.innerDeg)})
    : mix(${f(CONE.innerAlpha)}, 0.0, clamp((ang - ${f(CONE.innerDeg)}) / ${f(CONE.outerDeg - CONE.innerDeg)}, 0.0, 1.0));
  float mask = clamp(1.0 - px.y / (${f(CONE.maskEnd)} * uRes.y), 0.0, 1.0);
  vec3 signal = mix(uSignalOld, uSignalNew, m);
  col += ${f(CONE.rest)} * cover * mask * (signal - signal * col);

  // Over-bright light left by the last bubble at the pop (hand-off from the DOM halo).
  if (uBurst > 0.0) {
    vec4 disc = discAt(d, toGamma(labToLinear(uNew[1])));
    col = mix(col, disc.rgb, uBurst * disc.a);
  }

  // The front of the wave carries a faint line of the new light.
  float front = uWaveOn * exp(-pow((dw - uWave.z) / (0.12 * uWave.w), 2.0));
  col += 0.14 * front * (uSignalNew - uSignalNew * col);

  col += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(agxInverse(toLinear(clamp(col, 0.0, 1.0))), 1.0);
}
`;

const v3 = (out: Vector3, c: Rgb) => out.set(c[0], c[1], c[2]);

export function Backdrop() {
  const { mesh, uniforms } = useMemo(() => {
    const geometry = new BufferGeometry();
    // One triangle covering the screen.
    geometry.setAttribute("position", new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const uniforms = {
      uRes: { value: new Vector2(1, 1) },
      uHalo: { value: new Vector3(0.5, 0.5, 1) },
      uOld: { value: Array.from({ length: 4 }, () => new Vector3()) },
      uNew: { value: Array.from({ length: 4 }, () => new Vector3()) },
      uSignalOld: { value: new Vector3() },
      uSignalNew: { value: new Vector3() },
      uDisc: { value: Array.from({ length: 3 }, () => new Vector3()) },
      uInk: { value: new Vector3() },
      uBurst: { value: 0 },
      uFade: { value: 1 },
      uWaveOn: { value: 0 },
      uWave: { value: new Vector4(0, 0, 0, 1) },
    };
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = -1;
    return { mesh, uniforms };
  }, []);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as ShaderMaterial).dispose();
    },
    [mesh],
  );

  useFrame(() => {
    const u = uniforms;
    const from = scenePalette(stage.from);
    const to = scenePalette(stage.to);
    u.uRes.value.set(view.width, view.height);
    u.uHalo.value.set(view.halo.cx, view.halo.cy, Math.max(1, view.halo.r));
    for (let i = 0; i < 4; i++) {
      const a = from.halo[i]!;
      const b = to.halo[i]!;
      u.uOld.value[i]!.set(a.L, a.a, a.b);
      u.uNew.value[i]!.set(b.L, b.a, b.b);
    }
    v3(u.uSignalOld.value, from.signal);
    v3(u.uSignalNew.value, to.signal);
    for (let i = 0; i < 3; i++) v3(u.uDisc.value[i]!, to.disc[i]!);
    v3(u.uInk.value, to.ink);
    u.uBurst.value = stage.burst;
    u.uFade.value = stage.haloFade;
    u.uWaveOn.value = stage.wave.on;
    u.uWave.value.set(stage.wave.x, stage.wave.y, stage.wave.radius, stage.wave.band);
  });

  return <primitive object={mesh} />;
}
