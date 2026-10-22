"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { T } from "@/config/intro";
import { heroStore, introTime } from "../store";
import { markLive, stage } from "./lib/stage";

export type LiveKind = "cut" | "fade";

/**
 * Owns the render loop after the warm-up:
 * - intro: stays "never" until introTime() reaches T.sceneStart (no frames
 *   compete with the bubbles), then "always". The warm-up runs from t0 and
 *   is done long before; the Tinte covers the canvas until T.pop, so a loop
 *   that starts a little later still cuts in unseen. Only after the can
 *   should have started rising (stage.ts INTRO.lateAfter) does it count as
 *   late and fade in like a return visit;
 * - direct: "always" at once; static (reduced motion): "demand", one frame
 *   per change (flavor switch, resize);
 * - paused ("never") while the tab is hidden or the canvas is off screen.
 */
export function FrameControl({ onLive }: { onLive: (kind: LiveKind) => void }): null {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const canvas = useThree((s) => s.gl.domElement);

  useEffect(() => {
    const mode = heroStore.get().mode;
    let started = false;
    let hidden = document.hidden;
    let inView = true;
    let raf = 0;

    const apply = () => {
      if (!started) return;
      if (hidden || !inView) {
        setFrameloop("never");
        return;
      }
      setFrameloop(mode === "static" ? "demand" : "always");
      invalidate();
    };

    const go = () => {
      started = true;
      markLive(performance.now());
      onLive(mode === "intro" && !stage.late ? "cut" : "fade");
      apply();
    };

    const wait = () => {
      raf = 0;
      if (heroStore.get().mode !== "intro" || introTime() >= T.sceneStart) go();
      else raf = requestAnimationFrame(wait);
    };
    wait();

    const onVisibility = () => {
      hidden = document.hidden;
      apply();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const io = new IntersectionObserver((entries) => {
      inView = entries.some((e) => e.isIntersecting);
      apply();
    });
    io.observe(canvas);

    // Static mode renders on demand: a switch needs its frames.
    const unsubscribe = heroStore.subscribe(() => {
      if (started && mode === "static") invalidate();
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      unsubscribe();
      setFrameloop("never");
    };
  }, [setFrameloop, invalidate, canvas, onLive]);

  // On demand, the 200 ms cross-fade of a switch keeps requesting frames.
  useFrame(() => {
    if (!stage.motion && stage.switchS < 0.3) invalidate();
  });

  return null;
}
