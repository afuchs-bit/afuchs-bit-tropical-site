import {
  Color,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Vector2,
  type Texture,
} from "three";
import { LUMA_CEILING, patchMaterial, type FloatUniform } from "../lib/materialPatch";

/**
 * Can materials. Brushed aluminium (anisotropic MeshPhysical) for body, lid
 * and tab; a printed, clear-coated label; the rim glow at the lip is the
 * only unlit, HDR part (toneMapped off) and with the party lights the only
 * thing above the bloom threshold.
 *
 * Flavor finish (direction §2): Tropical "satin" (soft sheen), Limette
 * Minze "condensation" (fine droplets in the clearcoat normal map). Both
 * finishes use one program; the switch only moves uniforms.
 *
 * No warm color is baked into a material: the only warm light is the amber
 * rim light (Lighting), and the materials take it from there.
 *
 * alphaHash lets the can dissolve in out of the light without sorting.
 */
export type Finish = "satin" | "condensation";

/** Satin sheen tint, neutral (about the luminance of the former cream tint). */
const SHEEN = "#DADADA";

export const FINISH: Record<Finish, {
  labelRoughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  droplets: number;
  sheen: number;
  metalRoughness: number;
  metalDroplets: number;
}> = {
  satin: {
    labelRoughness: 0.34,
    clearcoat: 0.6,
    clearcoatRoughness: 0.22,
    droplets: 0,
    sheen: 0.35,
    metalRoughness: 0.26,
    metalDroplets: 0,
  },
  condensation: {
    labelRoughness: 0.44,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    droplets: 0.9,
    sheen: 0.02,
    metalRoughness: 0.32,
    metalDroplets: 0.4,
  },
};

export type LabelUniforms = {
  uMapNew: { value: Texture };
  uOffOld: FloatUniform;
  uOffNew: FloatUniform;
  uCenterNew: FloatUniform;
  uHalf: FloatUniform;
  uFill: FloatUniform;
};

/**
 * Two labels on one mantle: the current one, and the next one mixed in on
 * the far half only (centered at uCenterNew), so the 180° turn of a switch
 * brings it round without a visible pop. uFill finally covers the whole
 * mantle (on the far side) before the old label is dropped.
 */
const LABEL_PATCH = /* glsl */ `
#ifdef USE_MAP
  vec4 labelOld = texture2D(map, vec2(vMapUv.x + uOffOld, vMapUv.y));
  vec4 labelNew = texture2D(uMapNew, vec2(vMapUv.x + uOffNew, vMapUv.y));
  float farHalf = smoothstep(-0.12, 0.12, cos(6.2831853 * (vMapUv.x - uCenterNew)));
  vec4 sampledDiffuseColor = mix(labelOld, labelNew, max(uFill, uHalf * farHalf));
  diffuseColor *= sampledDiffuseColor;
#endif
`;

export type CanMaterials = {
  metal: MeshPhysicalMaterial;
  label: MeshPhysicalMaterial;
  rim: MeshBasicMaterial;
  labelUniforms: LabelUniforms;
  ceiling: FloatUniform;
  /** Clones of the condensation map with their own tiling (shared GPU image). */
  textures: Texture[];
};

export function createCanMaterials(label: Texture, condensation: Texture, anisotropy: number): CanMaterials {
  const ceiling: FloatUniform = { value: LUMA_CEILING };

  const metalDrops = condensation.clone();
  metalDrops.repeat.set(10, 6);
  const metal = new MeshPhysicalMaterial({
    color: "#C6CAD0",
    metalness: 1,
    roughness: FINISH.satin.metalRoughness,
    anisotropy: 0.4,
    normalMap: metalDrops,
    normalScale: new Vector2(0, 0),
    emissive: new Color("#ffffff"),
    emissiveIntensity: 0,
    alphaHash: true,
  });
  patchMaterial(metal, "hero-ceiling", ceiling);

  const labelDrops = condensation.clone();
  labelDrops.repeat.set(9, 6);
  const labelUniforms: LabelUniforms = {
    uMapNew: { value: label },
    uOffOld: { value: 0 },
    uOffNew: { value: 0 },
    uCenterNew: { value: 0 },
    uHalf: { value: 0 },
    uFill: { value: 1 },
  };
  label.anisotropy = anisotropy;
  const labelMaterial = new MeshPhysicalMaterial({
    map: label,
    metalness: 0.35,
    roughness: FINISH.satin.labelRoughness,
    clearcoat: FINISH.satin.clearcoat,
    clearcoatRoughness: FINISH.satin.clearcoatRoughness,
    clearcoatNormalMap: labelDrops,
    clearcoatNormalScale: new Vector2(0, 0),
    sheen: FINISH.satin.sheen,
    // Neutral: the sheen is lit (cool key above, amber rim behind), it is not a light of its own.
    sheenColor: new Color(SHEEN),
    sheenRoughness: 0.45,
    emissive: new Color("#ffffff"),
    emissiveIntensity: 0,
    alphaHash: true,
  });
  patchMaterial(labelMaterial, "hero-label", ceiling, (shader) => {
    Object.assign(shader.uniforms, labelUniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <map_pars_fragment>",
        "#include <map_pars_fragment>\nuniform sampler2D uMapNew;\nuniform float uOffOld;\nuniform float uOffNew;\nuniform float uCenterNew;\nuniform float uHalf;\nuniform float uFill;",
      )
      .replace("#include <map_fragment>", LABEL_PATCH);
  });

  const rim = new MeshBasicMaterial({ color: "#ffffff", toneMapped: false, alphaHash: true });

  return { metal, label: labelMaterial, rim, labelUniforms, ceiling, textures: [metalDrops, labelDrops] };
}

export function disposeCanMaterials(m: CanMaterials): void {
  m.metal.dispose();
  m.label.dispose();
  m.rim.dispose();
  for (const t of m.textures) t.dispose();
}
