import {
  CustomBlending,
  DoubleSide,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OneFactor,
  OneMinusSrcAlphaFactor,
  Vector2,
  Color,
  type Material,
  type WebGLProgramParametersWithUniforms,
} from "three";
import type { ElementKind } from "@/content/flavors";
import type { SceneAssets } from "../assets";
import { patchMaterial, type FloatUniform } from "../lib/materialPatch";

/**
 * PBR materials per kind: photographic, no toon shading, no transmission
 * (direction §8: ice is MeshPhysical with clearcoat). Every material gets
 * the soft luminance ceiling so only the rim glow and the party lights bloom.
 */
const KEY = "hero-ceiling";

/**
 * Clear ice on a dark scene without transmission. Glass reads through its
 * reflections, not its body, so the material is composited premultiplied:
 * the body (frost map × a very low opacity) occludes the night only faintly,
 * while specular and clearcoat add at full strength instead of being scaled
 * by that opacity (plain alpha blending turned the cubes into grey, smoked
 * boxes). Opacity rises toward grazing angles, so the edges read like the
 * walls of a real cube, and the frost lines of the map plus those edges
 * catch a trace of the amber rim light (uIceTint, set per frame). Instance
 * color (band shade × switch presence) scales everything, so a fading cube
 * fades as a whole. depthWrite off; no extra pass, no transmission.
 */
const ICE_OPACITY = { cube: 0.1, crushed: 0.14 } as const;
/** Opacity at grazing angles (Fresnel-shaped edge). */
const ICE_EDGE = 0.2;
/** Share of the body opacity outside the frost lines: the clear part stays nearly invisible. */
const ICE_CLEAR = 0.2;
/** Map alpha of the plain frost veil; only what lies above it (cracks, specks) glows. */
const ICE_VEIL_ALPHA = 0.6;

type ColorUniform = { value: Color };

function icePatch(tint: ColorUniform) {
  return (shader: WebGLProgramParametersWithUniforms): void => {
    shader.uniforms.uIceTint = tint;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uIceTint;")
      .replace(
        "vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;",
        "vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;\nvec3 heroIceBody = totalDiffuse;",
      )
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `
float heroShade = 1.0;
// Fragment side: the instance color arrives as USE_COLOR (ice has no vertex colors).
#ifdef USE_COLOR
heroShade = vColor.r;
#endif
float heroFacing = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
float heroEdge = heroFacing * heroFacing * heroFacing;
float heroMapAlpha = diffuseColor.a / max(opacity, 1e-3);
float heroFrost = clamp((heroMapAlpha - ${ICE_VEIL_ALPHA.toFixed(2)}) * 2.5, 0.0, 1.0);
// The body is frost, not haze: only the cracks and specks of the map keep most of it.
float heroBody = clamp(diffuseColor.a, 0.0, 1.0) * mix(${ICE_CLEAR.toFixed(2)}, 1.0, heroFrost);
float heroAlpha = mix(heroBody, ${ICE_EDGE.toFixed(3)}, heroEdge) * heroShade;
// Premultiplied: body × alpha, light on top unscaled (blend ONE, ONE_MINUS_SRC_ALPHA).
// The body already carries the instance color (color_fragment); the light does not.
vec3 heroLight = (max(outgoingLight - heroIceBody, 0.0) + uIceTint * (0.05 * heroFrost + 0.12 * heroEdge)) * heroShade;
gl_FragColor = vec4(heroSoftClip(heroIceBody * heroAlpha + heroLight, uHeroCeiling), heroAlpha);
`,
      );
  };
}

function ice(assets: SceneAssets, crushed: boolean): MeshPhysicalMaterial {
  const m = new MeshPhysicalMaterial({
    color: "#E4EEF4",
    map: assets.ice.map,
    bumpMap: assets.ice.bump,
    bumpScale: crushed ? 0.25 : 0.35,
    roughness: crushed ? 0.12 : 0.05,
    metalness: 0,
    ior: 1.31,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    // Glass reads through Fresnel reflections at the edges; stronger env
    // would fill whole faces with a flat grey-brown reflection (smoked look).
    envMapIntensity: 1.2,
    transparent: true,
    opacity: crushed ? ICE_OPACITY.crushed : ICE_OPACITY.cube,
    depthWrite: false,
  });
  m.blending = CustomBlending;
  m.blendSrc = OneFactor;
  m.blendDst = OneMinusSrcAlphaFactor;
  m.userData.iceTint = { value: new Color(0, 0, 0) } satisfies ColorUniform;
  return m;
}

/** Tints the ice frost and edges with the rim light (linear color); call per frame. */
export function tintIce(materials: ReadonlyMap<string, Material | Material[]>, color: Color): void {
  for (const kind of ["ice", "crushedIce"] as const) {
    const m = materials.get(kind);
    const tint = m && !Array.isArray(m) ? (m.userData.iceTint as ColorUniform | undefined) : undefined;
    tint?.value.copy(color);
  }
}

function materialsFor(kind: ElementKind, assets: SceneAssets): Material | Material[] {
  switch (kind) {
    case "ice":
      return ice(assets, false);
    case "crushedIce":
      return ice(assets, true);
    case "lime": {
      const rind = new MeshPhysicalMaterial({
        map: assets.limeRind,
        roughness: 0.5,
        clearcoat: 0.35,
        clearcoatRoughness: 0.35,
      });
      // The cut face is flat, so its normal is the same everywhere: a glossy
      // face catches the cool key light on the whole disc at once and turns
      // into a blank white plate. Low specular, soft clearcoat: wet, not mirror.
      const face = new MeshPhysicalMaterial({
        map: assets.limeFace,
        roughness: 0.6,
        specularIntensity: 0.3,
        clearcoat: 0.25,
        clearcoatRoughness: 0.5,
        // Backlit juice: the face carries a trace of its own color.
        emissive: "#ffffff",
        emissiveMap: assets.limeFace,
        emissiveIntensity: 0.06,
      });
      return [rind, face, face];
    }
    case "mint":
      return new MeshStandardMaterial({
        map: assets.mint.map,
        normalMap: assets.mint.normal,
        normalScale: new Vector2(0.8, 0.8),
        roughness: 0.62,
        metalness: 0,
        alphaTest: 0.5,
        side: DoubleSide,
      });
    case "passion": {
      const skin = new MeshPhysicalMaterial({
        map: assets.passionSkin.map,
        bumpMap: assets.passionSkin.bump,
        bumpScale: 1.2,
        roughness: 0.52,
        clearcoat: 0.25,
        clearcoatRoughness: 0.4,
      });
      const face = new MeshPhysicalMaterial({
        map: assets.passionFace,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      });
      return [skin, face];
    }
    case "mango":
      return new MeshPhysicalMaterial({
        map: assets.mango.map,
        normalMap: assets.mango.normal,
        normalScale: new Vector2(0.6, 0.6),
        roughness: 0.46,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
      });
    case "pineapple": {
      const face = new MeshPhysicalMaterial({
        map: assets.pineappleFace,
        roughness: 0.42,
        clearcoat: 0.7,
        clearcoatRoughness: 0.25,
      });
      const sides = new MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.62,
        clearcoat: 0.35,
        clearcoatRoughness: 0.35,
      });
      return [face, sides];
    }
  }
}

export function createMaterials(kind: ElementKind, assets: SceneAssets, ceiling: FloatUniform): Material | Material[] {
  const m = materialsFor(kind, assets);
  const list = Array.isArray(m) ? m : [m];
  // Ice stays neutral; produce gets AgX's saturation back.
  const ice = kind === "ice" || kind === "crushedIce";
  const saturation = ice ? 1 : 1.3;
  for (const material of new Set(list)) {
    // Produce: less of the bright environment veil, which reads as clay.
    if (!ice && "envMapIntensity" in material) (material as MeshStandardMaterial).envMapIntensity = 0.6;
    if (ice) patchMaterial(material, `${KEY}-ice`, ceiling, icePatch(material.userData.iceTint as ColorUniform), saturation);
    else patchMaterial(material, KEY, ceiling, undefined, saturation);
  }
  return m;
}

export function disposeMaterials(m: Material | Material[]): void {
  for (const material of new Set(Array.isArray(m) ? m : [m])) material.dispose();
}
