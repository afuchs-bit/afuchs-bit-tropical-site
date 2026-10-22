import type { Texture, WebGLRenderer } from "three";
import { activeCan, canPresets } from "@/config/can";
import { flavors, type FlavorSlug } from "@/content/flavors";
import { yieldToMain } from "./textures/canvas";
import { loadLabel } from "./textures/label";
import {
  condensation,
  iceVeil,
  limeFace,
  limeRind,
  mangoFlesh,
  mintLeaf,
  passionFace,
  passionSkin,
  pineappleFace,
} from "./textures/produce";

/**
 * Every texture the scene needs, built before the scene graph mounts. Each
 * job runs in its own task (yield in between), so the warm-up never blocks
 * the main thread long while the intro bubbles play. The active flavor's
 * label comes first.
 */
export type SceneAssets = {
  labels: Record<FlavorSlug, Texture>;
  condensation: Texture;
  limeFace: Texture;
  limeRind: Texture;
  mint: { map: Texture; normal: Texture };
  passionFace: Texture;
  passionSkin: { map: Texture; bump: Texture };
  mango: { map: Texture; normal: Texture };
  pineappleFace: Texture;
  ice: { map: Texture; bump: Texture };
  all: Texture[];
};

export async function loadSceneAssets(gl: WebGLRenderer, first: FlavorSlug, signal: AbortSignal): Promise<SceneAssets> {
  const preset = canPresets[activeCan];
  const all: Texture[] = [];
  const step = async <T>(job: () => T | Promise<T>): Promise<T> => {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    await yieldToMain();
    const out = await job();
    const list = (Array.isArray(out) ? out : [out]) as unknown[];
    for (const item of list) collect(item, all);
    return out;
  };

  try {
    const ordered = [...flavors].sort((a, b) => (a.slug === first ? -1 : b.slug === first ? 1 : 0));
    const labels = {} as Record<FlavorSlug, Texture>;
    for (const f of ordered) labels[f.slug] = await step(() => loadLabel(f, preset, gl));
    const assets: SceneAssets = {
      labels,
      condensation: await step(condensation),
      passionFace: await step(passionFace),
      passionSkin: await step(passionSkin),
      mango: await step(mangoFlesh),
      pineappleFace: await step(pineappleFace),
      ice: await step(iceVeil),
      limeFace: await step(limeFace),
      limeRind: await step(limeRind),
      mint: await step(mintLeaf),
      all,
    };
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    return assets;
  } catch (error) {
    // Unmounted mid-way (or a job failed): nothing built so far may leak.
    for (const t of all) t.dispose();
    throw error;
  }
}

function collect(item: unknown, out: Texture[]): void {
  if (!item || typeof item !== "object") return;
  if ((item as Texture).isTexture) {
    out.push(item as Texture);
    return;
  }
  for (const value of Object.values(item)) collect(value, out);
}

export function disposeAssets(assets: SceneAssets): void {
  for (const t of assets.all) t.dispose();
}
