"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Color, type BufferGeometry, type Material, type PerspectiveCamera } from "three";
import { activeCan, canPresets } from "@/config/can";
import { flavors, type ElementKind } from "@/content/flavors";
import type { SceneAssets } from "./assets";
import { createFieldSet, disposeFieldSet, updateFieldSet } from "./elements/fieldSet";
import { createGeometry } from "./elements/geometry";
import { createMaterials, disposeMaterials, tintIce } from "./elements/materials";
import { LUMA_CEILING, type FloatUniform } from "./lib/materialPatch";
import { mixOklab } from "./lib/oklab";
import { scenePalette } from "./lib/palette";
import { stage } from "./lib/stage";
import { view } from "./lib/viewport";

/**
 * Ingredients floating around the can (direction §4, §8): one
 * InstancedMesh per kind and flavor, both flavors mounted. Counts are the
 * flavor's (src/content/flavors.ts) × the quality factor; layout, float,
 * cursor avoidance, exclusion zones and the switch live in fieldSet.ts.
 */
export function FloatingField({ assets, factor }: { assets: SceneAssets; factor: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const preset = canPresets[activeCan];

  const { sets, geometries, materials } = useMemo(() => {
    const ceiling: FloatUniform = { value: LUMA_CEILING };
    const kinds = new Set<ElementKind>(flavors.flatMap((f) => f.elements.map((e) => e.kind)));
    const geometries = new Map<ElementKind, BufferGeometry>();
    const materials = new Map<ElementKind, Material | Material[]>();
    for (const kind of kinds) {
      geometries.set(kind, createGeometry(kind));
      materials.set(kind, createMaterials(kind, assets, ceiling));
    }
    const sets = flavors.map((f) => createFieldSet(f, geometries, materials));
    return { sets, geometries, materials };
  }, [assets]);

  useEffect(
    () => () => {
      for (const set of sets) disposeFieldSet(set);
      for (const g of geometries.values()) g.dispose();
      for (const m of materials.values()) disposeMaterials(m);
    },
    [sets, geometries, materials],
  );

  const tint = useMemo(() => new Color(), []);

  useFrame(() => {
    // The ice frost catches a trace of the rim light: amber for both flavors (no
    // green light for Limette Minze; green lives only on lime and mint themselves).
    mixOklab(scenePalette(stage.from).rim, scenePalette(stage.to).rim, stage.colorMix, tint);
    tintIce(materials, tint);
    for (const set of sets) {
      updateFieldSet(set, camera, factor, preset.radius, preset.height, view.zonesStable);
    }
  });

  return (
    <>
      {sets.flatMap((set) =>
        [...set.meshes.values()].map((mesh) => <primitive key={mesh.uuid} object={mesh} />),
      )}
    </>
  );
}
