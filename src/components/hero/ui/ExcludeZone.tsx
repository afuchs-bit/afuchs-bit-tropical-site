"use client";

import { useRef, type ReactNode } from "react";
import { useSceneExclude, type ZoneKind } from "../exclusion";

/**
 * Registers its box as a scene exclusion zone, for server-rendered parts of
 * the hero that have no client ref of their own (the bottom row).
 */
export function ExcludeZone({
  id,
  kind = "hard",
  padding = 24,
  className,
  children,
}: {
  id: string;
  kind?: ZoneKind;
  padding?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useSceneExclude(ref, id, kind, padding);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
