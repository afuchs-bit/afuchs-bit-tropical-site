"use client";

import { useEffect, useState } from "react";
import { haloGeometry, isMobileLayout, isPortraitStage, type HaloGeometry } from "../geometry";

/**
 * Viewport geometry of the intro in CSS px (window.innerWidth/innerHeight,
 * the same numbers the scene passes to geometry.ts). Bubble boxes and amber
 * points come from bubbleBox() / amberPoint() in geometry.ts, so the DOM and
 * the scene agree to the pixel: the final bubble lands exactly on
 * haloGeometry(), the amber trail starts the scene's party lights.
 */
export type StageLayout = {
  w: number;
  h: number;
  /** Portrait phone: mx/my positions, sizes × MOBILE_BUBBLE_SCALE. */
  portrait: boolean;
  mobile: boolean;
  halo: HaloGeometry;
};

export function readLayout(): StageLayout {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return { w, h, mobile: isMobileLayout(w), portrait: isPortraitStage(w, h), halo: haloGeometry(w, h) };
}

/** Re-reads on resize (rAF-throttled); animations re-sync from t0. */
export function useStageLayout(): StageLayout {
  const [layout, setLayout] = useState(readLayout);
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setLayout(readLayout());
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);
  return layout;
}
