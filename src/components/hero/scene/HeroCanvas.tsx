"use client";

import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { MOBILE_BREAKPOINT } from "../geometry";
import { heroStore, useHero } from "../store";
import { attachPointer } from "./lib/pointer";
import { resetStage } from "./lib/stage";
import { attachViewport } from "./lib/viewport";
import { level, startLevel } from "./quality";
import { SceneRoot, type LiveKind } from "./SceneRoot";

/**
 * The WebGL layer of the hero (direction §8). Flat (no renderer tone
 * mapping: the composer does AgX), no MSAA on the context (the composer
 * multisamples), alpha off. The loop starts in "never"; SceneRoot warms up
 * (textures, compileAsync, one frame) and then hands over to FrameControl.
 */
const FADE_MS = { late: 400, static: 200 } as const;

function useMobile(): boolean {
  const [mobile, setMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 0.02}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

export default function HeroCanvas({ eventSource }: { eventSource: RefObject<HTMLElement | null> }) {
  const mode = useHero((s) => s.mode);
  const mobile = useMobile();
  const [start] = useState(startLevel);
  const [levelIndex, setLevelIndex] = useState(start);
  const q = level(levelIndex);
  const wrap = useRef<HTMLDivElement>(null);
  /** null = warming up; then how the canvas appears over the CSS backdrop. */
  const [live, setLive] = useState<LiveKind | null>(null);

  useEffect(() => {
    resetStage();
  }, []);

  useEffect(() => {
    heroStore.set({ quality: q.tier });
  }, [q.tier]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    return attachViewport(el);
  }, []);

  useEffect(() => {
    const el = eventSource.current;
    if (!el) return;
    return attachPointer(el);
  }, [eventSource]);

  const onLive = useCallback((kind: LiveKind) => setLive(kind), []);

  // Intro on time: the black stage still covers the canvas, it appears at
  // once. Late, direct or static: fade over the CSS backdrop.
  const fade = live === null ? 0 : live === "cut" ? 0 : mode === "static" ? FADE_MS.static : FADE_MS.late;

  return (
    <div
      ref={wrap}
      className="absolute inset-0"
      style={{
        opacity: live === null ? 0 : 1,
        transition: fade ? `opacity ${fade}ms var(--ease-out-quart)` : undefined,
      }}
    >
      <Canvas
        flat
        frameloop="never"
        dpr={[1, mobile ? q.dpr[1] : q.dpr[0]]}
        gl={{ alpha: false, antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
        camera={{ fov: 28, near: 0.1, far: 40, position: [0, 0.4, 4.2] }}
        eventSource={eventSource}
        eventPrefix="client"
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => heroStore.set({ sceneFailed: true }), {
            once: true,
          });
        }}
      >
        <SceneRoot
          levelIndex={levelIndex}
          startLevel={start}
          quality={q}
          mobile={mobile}
          onLevel={setLevelIndex}
          onLive={onLive}
        />
      </Canvas>
    </div>
  );
}
