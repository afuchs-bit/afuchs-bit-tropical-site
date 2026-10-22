"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, type PerspectiveCamera } from "three";
import { activeCan, canPresets } from "@/config/can";
import { MOBILE_SCENE_HEIGHT } from "../geometry";
import { preparePointer } from "./lib/avoid";
import { view } from "./lib/viewport";

/**
 * Camera fit (direction §4/§5): fov 28°, slightly from above, at the
 * distance where the can is ≈ 72vh tall on desktop and ≈ 38svh inside the
 * 62svh mobile canvas (46svh, as in the direction, pushed the lid into the
 * header). A view offset puts the world origin (the can) exactly on the halo
 * center from haloGeometry(), so can, halo and DOM agree.
 */
export const FOV = 28;
const PITCH = MathUtils.degToRad(6);
const FILL = { desktop: 0.72, mobile: 0.38 } as const;
/** Height of the tilted can's silhouette in scene units. */
const VISUAL_HEIGHT = canPresets[activeCan].height * 1.03;

export const CAMERA_PRIORITY = -40;

export function fitCamera(camera: PerspectiveCamera): void {
  const W = view.width;
  const H = view.height;
  const target = view.mobile ? FILL.mobile / MOBILE_SCENE_HEIGHT : (FILL.desktop * window.innerHeight) / H;
  const tan = Math.tan(MathUtils.degToRad(FOV) / 2);
  const distance = VISUAL_HEIGHT / (Math.min(0.95, target) * 2 * tan);
  camera.fov = FOV;
  camera.aspect = W / H;
  camera.position.set(0, Math.sin(PITCH) * distance, Math.cos(PITCH) * distance);
  camera.lookAt(0, 0, 0);
  const ox = W / 2 - view.halo.cx;
  const oy = H / 2 - view.halo.cy;
  if (Math.abs(ox) < 0.5 && Math.abs(oy) < 0.5) camera.clearViewOffset();
  else camera.setViewOffset(W, H, ox, oy, W, H);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  view.fit++;
}

export function CameraRig(): null {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const seen = useRef({ version: -1, w: 0, h: 0 });

  useFrame(() => {
    const s = seen.current;
    if (s.version !== view.version || s.w !== size.width || s.h !== size.height) {
      s.version = view.version;
      s.w = size.width;
      s.h = size.height;
      fitCamera(camera);
    }
    // The pointer ray for this frame, once, after the fit.
    preparePointer(camera);
  }, CAMERA_PRIORITY);

  return null;
}
