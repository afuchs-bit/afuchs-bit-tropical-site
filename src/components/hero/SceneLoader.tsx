"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type RefObject } from "react";
import { SceneBoundary } from "./scene/SceneBoundary";
import { heroStore, useHero } from "./store";

/**
 * Client entry to the R3F scene. Nothing 3D is evaluated before the visitor
 * shows intent: preloadScene() starts the chunk download on pointerenter /
 * pointerdown / Enter on "Ja" (or on mount for a returning visitor), and the
 * canvas mounts only once the timeline has started (t0), so the gate stays
 * free of WebGL work.
 */
const loadCanvas = () => import("./scene/HeroCanvas");

let preload: Promise<unknown> | null = null;

/** Starts loading the scene chunk once; later calls are free. */
export function preloadScene(): void {
  if (preload || typeof window === "undefined") return;
  preload = loadCanvas().catch(() => {
    preload = null;
  });
}

const HeroCanvas = dynamic(loadCanvas, { ssr: false, loading: () => null });

let webgl2: boolean | null = null;

function hasWebGL2(): boolean {
  if (webgl2 !== null) return webgl2;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    webgl2 = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }
  return webgl2;
}

/**
 * Mounts the canvas behind the hero copy. Positions itself: desktop the
 * whole hero, mobile the top 62svh (the rest zone below is pure DOM). The
 * wrapper never takes pointer events; `eventSource` (the page wrapper)
 * feeds the pointer so moves over the copy still steer the scene.
 */
export function SceneLoader({ eventSource }: { eventSource: RefObject<HTMLElement | null> }) {
  const started = useHero((s) => s.t0 !== null);
  const failed = useHero((s) => s.sceneFailed);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!started || supported !== null) return;
    const ok = hasWebGL2();
    setSupported(ok);
    if (!ok) heroStore.set({ sceneFailed: true });
  }, [started, supported]);

  if (!started || !supported || failed) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[62svh] md:inset-0 md:h-auto"
    >
      <SceneBoundary onError={() => heroStore.set({ sceneFailed: true })}>
        <HeroCanvas eventSource={eventSource} />
      </SceneBoundary>
    </div>
  );
}
