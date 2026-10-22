"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { heroStore } from "../store";
import type { SceneAssets } from "./assets";
import { effects } from "./Effects";
import { yieldToMain } from "./textures/canvas";

/**
 * Runs once the scene graph is mounted, while the loop is still "never":
 * uploads every texture (both flavors' labels, so a switch never pops),
 * compiles all programs off the critical path (KHR_parallel_shader_compile
 * via compileAsync), renders a single frame through the composer (its
 * passes and the environment's PMREM compile here), then reports ready.
 */
export function Warmup({ assets, onReady }: { assets: SceneAssets; onReady: () => void }): null {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const advance = useThree((s) => s.advance);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await yieldToMain();
      for (const texture of assets.all) gl.initTexture(texture);
      await yieldToMain();
      await gl.compileAsync(scene, camera);
      // The composer builds its passes over a few commits; render through them.
      for (let i = 0; i < 120 && (effects.composer?.passes.length ?? 0) < 2; i++) {
        if (cancelled) return;
        await yieldToMain();
      }
      if (cancelled) return;
      advance(performance.now());
      heroStore.set({ sceneReady: true });
      onReady();
    };
    run().catch(() => {
      if (!cancelled) heroStore.set({ sceneFailed: true });
    });
    return () => {
      cancelled = true;
    };
  }, [assets, gl, scene, camera, advance, onReady]);

  return null;
}
