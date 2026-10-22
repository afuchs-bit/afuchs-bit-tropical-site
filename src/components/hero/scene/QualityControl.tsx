"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { heroStore } from "../store";
import { stage } from "./lib/stage";
import { LOWEST, PROBE_FRAMES, PROBE_MIN_FPS } from "./quality";

type Props = {
  levelIndex: number;
  startLevel: number;
  onLevel: (index: number) => void;
};

/**
 * Runtime quality: drei's PerformanceMonitor steps the level down (and back
 * up, never above the start level; after three flip-flops it settles one
 * step down) and a probe watches the first 30 live
 * frames. Below 30 fps they drop straight to the lowest level; still below
 * 30 fps there, the scene gives up and the CSS night stays (sceneFailed).
 */
export function QualityControl({ levelIndex, startLevel, onLevel }: Props) {
  const probe = useRef<{ level: number; frames: number[] }>({ level: levelIndex, frames: [] });

  useFrame(() => {
    if (!stage.motion || stage.liveAt === null) return;
    const p = probe.current;
    if (p.level !== levelIndex) {
      p.level = levelIndex;
      p.frames = [];
    }
    if (p.frames.length > PROBE_FRAMES) return;
    const now = performance.now();
    const last = p.frames[p.frames.length - 1];
    // A paused tab is not a slow device: start over after a long gap.
    if (last !== undefined && now - last > 400) p.frames = [];
    p.frames.push(now);
    if (p.frames.length <= PROBE_FRAMES) return;
    const first = p.frames[0]!;
    const fps = (PROBE_FRAMES / (now - first)) * 1000;
    if (fps >= PROBE_MIN_FPS) return;
    if (levelIndex < LOWEST) onLevel(LOWEST);
    else heroStore.set({ sceneFailed: true });
  });

  return (
    <PerformanceMonitor
      ms={250}
      iterations={10}
      threshold={0.75}
      flipflops={3}
      bounds={(refresh) => (refresh > 90 ? [50, 90] : [45, 58])}
      onDecline={() => onLevel(Math.min(LOWEST, levelIndex + 1))}
      onIncline={() => onLevel(Math.max(startLevel, levelIndex - 1))}
      // Flip-flopping between two levels: settle on the lower one, stop sampling.
      onFallback={() => onLevel(Math.min(LOWEST, levelIndex + 1))}
    />
  );
}
