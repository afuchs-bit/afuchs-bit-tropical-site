"use client";

import { useThree } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { heroStore } from "../store";
import { disposeAssets, loadSceneAssets, type SceneAssets } from "./assets";
import { Backdrop } from "./Backdrop";
import { CameraRig } from "./CameraRig";
import { Can } from "./Can";
import { Director } from "./Director";
import { Effects } from "./Effects";
import { FloatingField } from "./FloatingField";
import { FrameControl, type LiveKind } from "./FrameControl";
import { Lighting } from "./Lighting";
import { PartyLights } from "./PartyLights";
import { QualityControl } from "./QualityControl";
import { LIGHT_COUNT, MOBILE_INSTANCES, type QualityLevel } from "./quality";
import { Warmup } from "./Warmup";

export type { LiveKind };

type Props = {
  levelIndex: number;
  startLevel: number;
  quality: QualityLevel;
  mobile: boolean;
  onLevel: (index: number) => void;
  onLive: (kind: LiveKind) => void;
};

/**
 * Scene graph inside the canvas. Textures are built first (in small jobs),
 * then everything mounts at once and Warmup compiles it; the loop starts
 * only after that (FrameControl). Quality props flow down from HeroCanvas.
 */
export function SceneRoot({ levelIndex, startLevel, quality, mobile, onLevel, onLive }: Props) {
  const gl = useThree((s) => s.gl);
  const [assets, setAssets] = useState<SceneAssets | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    loadSceneAssets(gl, heroStore.get().flavor, abort.signal).then(setAssets, () => {
      if (!abort.signal.aborted) heroStore.set({ sceneFailed: true });
    });
    return () => abort.abort();
  }, [gl]);

  useEffect(
    () => () => {
      if (assets) disposeAssets(assets);
    },
    [assets],
  );

  const onReady = useCallback(() => setReady(true), []);

  if (!assets) return null;

  const instances = quality.instances * (mobile ? MOBILE_INSTANCES : 1);
  const lights = Math.round((mobile ? LIGHT_COUNT.mobile : LIGHT_COUNT.desktop) * quality.lights);

  return (
    <>
      <Director />
      <CameraRig />
      <Backdrop />
      <Lighting resolution={quality.envResolution} />
      <Can assets={assets} segments={quality.segments} />
      <FloatingField assets={assets} factor={instances} />
      <PartyLights count={lights} />
      <Effects msaa={mobile ? 0 : quality.msaa} bloomLevels={quality.bloomLevels} />
      <Warmup assets={assets} onReady={onReady} />
      {ready && <FrameControl onLive={onLive} />}
      {ready && <QualityControl levelIndex={levelIndex} startLevel={startLevel} onLevel={onLevel} />}
    </>
  );
}
