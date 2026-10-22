"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { stage, updateStage } from "./lib/stage";
import { refreshZones, view } from "./lib/viewport";

/**
 * First frame callback of every frame: derives the stage (reveal, switch,
 * wave) from the master clock and converts the DOM exclusion zones into
 * canvas px. Everything after it reads `stage` and `view`.
 */
export const DIRECTOR_PRIORITY = -50;

export function Director(): null {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const advance = useThree((s) => s.advance);
  // Dev only: inspect the live stage, renderer, camera and graph from the
  // console (window.__heroScene; `advance(performance.now())` renders one frame).
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as Window & { __heroScene?: unknown };
    w.__heroScene = { stage, view, gl, scene, camera, advance };
    return () => {
      delete w.__heroScene;
    };
  }, [gl, scene, camera, advance]);
  useFrame(() => {
    const now = performance.now();
    updateStage(now);
    refreshZones(now);
  }, DIRECTOR_PRIORITY);
  return null;
}
