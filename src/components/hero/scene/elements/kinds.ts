import type { ElementKind } from "@/content/flavors";

/**
 * Per-kind behavior. Sizes are scene units (1 = 100 mm), about
 * life size so they read next to a 146 mm can; spin in rad/s; `front` is
 * how willing a kind is to float in the front band (big, near the camera).
 */
export type KindSpec = {
  size: [number, number];
  spin: [number, number];
  front: number;
};

export const KINDS: Record<ElementKind, KindSpec> = {
  ice: { size: [0.2, 0.25], spin: [0.08, 0.22], front: 1 },
  crushedIce: { size: [0.08, 0.12], spin: [0.15, 0.35], front: 0.4 },
  lime: { size: [0.4, 0.46], spin: [0.06, 0.16], front: 1 },
  mint: { size: [0.36, 0.44], spin: [0.06, 0.16], front: 0.7 },
  passion: { size: [0.4, 0.46], spin: [0.05, 0.14], front: 1 },
  mango: { size: [0.16, 0.2], spin: [0.1, 0.26], front: 0.8 },
  pineapple: { size: [0.34, 0.4], spin: [0.06, 0.16], front: 1 },
};
