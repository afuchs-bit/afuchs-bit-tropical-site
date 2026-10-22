"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useSyncExternalStore } from "react";
import { useHero } from "../store";

/** True under prefers-reduced-motion or the hero's static mode: fades only. */
export function useCalm(): boolean {
  const reduce = useReducedMotion();
  const staticMode = useHero((s) => s.mode === "static");
  return Boolean(reduce) || staticMode;
}

/** matchMedia as a hook; false on the server. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
