import type { Material, WebGLProgramParametersWithUniforms } from "three";

/**
 * Selective bloom without a selection pass: the bloom threshold is 1.0 and
 * only the rim glow and the party lights may exceed it. Lit materials get a
 * soft luminance ceiling just below the threshold, so specular hits on the
 * can or the fruit never bloom. The can raises its ceiling while it steps
 * out of the over-bright light in the reveal.
 */
export type FloatUniform = { value: number };

/** Ceiling below the bloom threshold (1.0) incl. the smoothing band. */
export const LUMA_CEILING = 0.96;

const SOFT_CLIP = /* glsl */ `
uniform float uHeroCeiling;
uniform float uHeroSaturation;
// Chroma boost in OKLab (hue kept). Not clamped: slightly negative sRGB is
// still inside AgX's Rec.2020 working space and comes out saturated.
vec3 heroSaturate(vec3 c, float s) {
  if (s == 1.0) return c;
  vec3 lms = mat3(0.4122214708, 0.2119034982, 0.0883024619, 0.5363325363, 0.6806995451, 0.2817188376,
    0.0514459929, 0.1073969566, 0.6299787005) * max(c, 0.0);
  lms = pow(lms, vec3(1.0 / 3.0));
  vec3 lab = mat3(0.2104542553, 1.9779984951, 0.0259040371, 0.7936177850, -2.4285922050, 0.7827717662,
    -0.0040720468, 0.4505937099, -0.8086757660) * lms;
  lab.yz *= s;
  lms = mat3(1.0, 1.0, 1.0, 0.3963377774, -0.1055613458, -0.0894841775, 0.2158037573, -0.0638541728,
    -1.2914855480) * lab;
  lms = lms * lms * lms;
  return mat3(4.0767416621, -1.2684380046, -0.0041960863, -3.3077115913, 2.6097574011, -0.7034186147,
    0.2309699292, -0.3413193965, 1.7076147010) * lms;
}
vec3 heroSoftClip(vec3 c, float m) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float k = 0.72 * m;
  if (l <= k) return c;
  float x = l - k;
  return c * ((k + x / (1.0 + x / (m - k))) / l);
}
`;

type Patch = (shader: WebGLProgramParametersWithUniforms) => void;

/**
 * `saturation` > 1 scales OKLab chroma before AgX, which otherwise pushes
 * saturated produce toward beige (photographed fruit reads saturated).
 *
 * Adds the soft ceiling (and an optional extra patch) to a built-in lit
 * material. `key` must be unique per patch variant: three caches programs
 * by it, two different patches must never share one.
 */
export function patchMaterial<M extends Material>(
  material: M,
  key: string,
  ceiling: FloatUniform,
  extra?: Patch,
  saturation = 1,
): M {
  const sat: FloatUniform = { value: saturation };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHeroCeiling = ceiling;
    shader.uniforms.uHeroSaturation = sat;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${SOFT_CLIP}`)
      .replace(
        "#include <opaque_fragment>",
        "outgoingLight = heroSaturate(outgoingLight, uHeroSaturation);\noutgoingLight = heroSoftClip(outgoingLight, uHeroCeiling);\n#include <opaque_fragment>",
      );
    extra?.(shader);
  };
  material.customProgramCacheKey = () => key;
  return material;
}
