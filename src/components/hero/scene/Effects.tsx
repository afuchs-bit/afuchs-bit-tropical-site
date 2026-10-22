"use client";

import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import { ToneMappingMode, type BloomEffect, type EffectComposer as Composer } from "postprocessing";
import { useCallback, useRef } from "react";
import { HalfFloatType } from "three";
import { stage } from "./lib/stage";

/**
 * Post (direction §8): HDR half-float buffers, bloom with threshold 1.0
 * (only the rim glow and the party lights exceed it; lit materials carry a
 * soft ceiling below it), AgX tone mapping, a vignette. No noise pass: the
 * grain is the CSS layer. Bloom runs at half resolution and is boosted
 * while the can steps out of the light.
 */
const BLOOM = 0.9;

/** The live composer, so the warm-up can wait for its passes. */
export const effects: { composer: Composer | null } = { composer: null };

export function Effects({ msaa, bloomLevels }: { msaa: number; bloomLevels: number }) {
  const bloom = useRef<BloomEffect>(null);
  const setComposer = useCallback((c: Composer | null) => {
    effects.composer = c;
  }, []);

  useFrame(() => {
    if (bloom.current) bloom.current.intensity = BLOOM * stage.bloom;
  });

  return (
    <EffectComposer ref={setComposer} multisampling={msaa} frameBufferType={HalfFloatType} enableNormalPass={false}>
      {bloomLevels > 0 ? (
        <Bloom
          ref={bloom}
          mipmapBlur
          luminanceThreshold={1}
          luminanceSmoothing={0.03}
          intensity={BLOOM}
          radius={0.72}
          levels={bloomLevels}
          resolutionScale={0.5}
        />
      ) : (
        <></>
      )}
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Vignette offset={0.35} darkness={0.45} />
    </EffectComposer>
  );
}
