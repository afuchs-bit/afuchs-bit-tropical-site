"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Color, DirectionalLight, PointLight } from "three";
import { getFlavor, type FlavorSlug } from "@/content/flavors";
import { mixOklab } from "./lib/oklab";
import { scenePalette } from "./lib/palette";
import { stage } from "./lib/stage";

/**
 * Light without HDR files or CDN presets (direction §8): an environment
 * cubemap rendered once from Lightformers (a cool softbox above for the
 * bright top edge, two cool strip lights, the amber ring behind, a dim
 * graphite floor), a cool key light from above and the amber rim light
 * behind the can. City night (direction v2): the amber is the only warm
 * light in the scene, and it is the same for both flavors.
 *
 * Key and rim follow a switch per frame in OKLab (a no-op while both flavors
 * share them), the key dimmed to 70 % mid-switch. The cubemap re-renders
 * only when the flavor's environment colors actually differ.
 */
const KEY_INTENSITY = 2.6;
const RIM_INTENSITY = 9;
/** Floor bounce: cold graphite, the mean of the intro photos' night (direction §2). */
const FLOOR = "#1B272B";

/** True if both flavors build the same cubemap (no re-render needed). */
function sameEnvironment(a: FlavorSlug, b: FlavorSlug): boolean {
  const x = getFlavor(a).scene;
  const y = getFlavor(b).scene;
  return x.keyLight === y.keyLight && x.rim === y.rim;
}

export function Lighting({ resolution }: { resolution: number }) {
  const [envFlavor, setEnvFlavor] = useState(stage.envFlavor);
  const key = useRef<DirectionalLight>(null);
  const rim = useRef<PointLight>(null);
  const seen = useRef(stage.envFlavor);
  const tmp = useMemo(() => new Color(), []);

  useFrame(() => {
    if (stage.envFlavor !== seen.current) {
      seen.current = stage.envFlavor;
      if (!sameEnvironment(stage.envFlavor, envFlavor)) setEnvFlavor(stage.envFlavor);
    }
    const from = scenePalette(stage.from);
    const to = scenePalette(stage.to);
    const k = key.current;
    if (k) {
      mixOklab(from.key, to.key, stage.colorMix, tmp);
      k.color.copy(tmp);
      // Brighter while the can steps out of the light.
      k.intensity = KEY_INTENSITY * stage.keyDim * (1 + 0.8 * stage.burst);
    }
    const r = rim.current;
    if (r) {
      mixOklab(from.rim, to.rim, stage.colorMix, tmp);
      r.color.copy(tmp);
      r.intensity = RIM_INTENSITY * (0.85 + 0.15 * stage.keyDim);
    }
  });

  const { keyLight: cool, rim: amber } = getFlavor(envFlavor).scene;

  return (
    <>
      <directionalLight ref={key} position={[-1.6, 4.2, 2.6]} intensity={KEY_INTENSITY} color={cool} />
      <pointLight ref={rim} position={[0.15, 0.7, -1.4]} intensity={RIM_INTENSITY} distance={0} decay={2} color={amber} />
      <Environment resolution={resolution} frames={1} environmentIntensity={0.85}>
        {/* Each Lightformer faces the can (default target: the origin). */}
        <Lightformer form="rect" intensity={4} color={cool} position={[0, 5, 1]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2} color={cool} position={[-4, 0.5, 1]} scale={[0.4, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color={cool} position={[4, 0.5, 0.5]} scale={[0.4, 6, 1]} />
        <Lightformer form="ring" intensity={1.5} color={amber} position={[0, 0.5, -5]} scale={6} />
        <Lightformer form="rect" intensity={0.3} color={FLOOR} position={[0, -4, 0]} scale={[8, 8, 1]} />
      </Environment>
    </>
  );
}
