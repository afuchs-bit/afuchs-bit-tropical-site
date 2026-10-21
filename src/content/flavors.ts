/**
 * Flavor line-up. Variant-neutral: works for one strength (variant A) or a
 * line with a 0 % closer (variant B). Each flavor carries its own colors so
 * the hero can swap can, background and floating elements together.
 */
export type Flavor = {
  slug: string;
  name: string;
  /** Three words max, how it tastes, not what is in it. */
  note: string;
  abv: number;
  /** Mandatory ingredient list, filled in once the bottler confirms. */
  ingredients: string[];
  /** Hex values; replaced by the gallery palette during the design round. */
  color: { can: string; depth: string; signal: string };
  label: string; // path under /public/can/
};

export const flavors: Flavor[] = [
  {
    slug: "sorte-1",
    name: "[Sorte 1]",
    note: "[Maracuja, Limette, Salz]",
    abv: 0,
    ingredients: ["[Wasser]", "[Vodka]", "[Zucker]", "[Maracujasaft]"],
    color: { can: "#1a1a1a", depth: "#0a0a0a", signal: "#f2c14e" },
    label: "/can/label.png",
  },
  {
    slug: "sorte-2",
    name: "[Sorte 2]",
    note: "[Mango, Chili, Kokos]",
    abv: 0,
    ingredients: ["[Wasser]", "[Vodka]", "[Zucker]", "[Mangopüree]"],
    color: { can: "#1a1a1a", depth: "#0a0a0a", signal: "#e8734a" },
    label: "/can/label.png",
  },
];

export const defaultFlavor = flavors[0]!;
