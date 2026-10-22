/**
 * Flavor line-up. Each flavor carries the whole world the hero swaps on a
 * flavor change (Prinzip 32): halo, Tiefe, can finish, floating elements.
 * Signal (amber) is the same for both: it is the one light of the image
 * world (Direction v2), so Limette Minze has no green light, only green objects.
 *
 * `color`, `abv` and `ingredients` stay for the parked sections (Lineup,
 * Ingredients); the hero reads `palette`, `scene` and `elements`.
 */
export type FlavorSlug = "tropical" | "limette-minze";

export type ElementKind =
  | "passion"
  | "mango"
  | "pineapple"
  | "lime"
  | "mint"
  | "ice"
  | "crushedIce";

export type Flavor = {
  slug: FlavorSlug;
  name: string;
  /** Mono note on the flavor card, three words max. */
  note: string;
  /** Eyebrow above the hero copy. */
  eyebrow: string;
  /** Hero copy, full Papier. */
  copy: string;
  /** Not shown in the hero (no strength as an argument); product sheet only. */
  abv: number;
  /** Mandatory ingredient list, filled in once the bottler confirms. */
  ingredients: string[];
  palette: {
    signal: string;
    signalText: string;
    deep: string;
    haloCore: string;
    haloMid: string;
    haloDeep: string;
    haloEdge: string;
  };
  scene: {
    /** Cool key light from above (graphite night); constant across flavors. */
    keyLight: string;
    /** Rim light behind the can and ring lightformer: the amber light. */
    rim: string;
    canFinish: "satin" | "condensation";
    /** Party light colors (2–14 px crisp points). */
    lights: [string, string];
    /** Fallback label until the uploaded design exists. */
    labelFallback: { from: string; to: string; ink: string };
  };
  elements: Array<{ kind: ElementKind; count: number }>;
  /** Seed for the element layout, so it is stable between visits. */
  seed: number;
  /** Uploaded label, e.g. "/can/tropical/label.webp". Unset = procedural fallback. */
  label?: string;
  /** Legacy colors for the parked sections. */
  color: { can: string; depth: string; signal: string };
};

export const flavors: Flavor[] = [
  {
    slug: "tropical",
    name: "Tropical",
    note: "Maracuja · Mango · Ananas",
    eyebrow: "Tropical · 330 ml",
    copy: "Vodka, Maracuja, Mango und Ananas, eiskalt aus der Dose. Für die Abende, an die ihr euch erinnern wollt.",
    abv: 0,
    ingredients: ["[Wasser]", "[Vodka]", "[Zucker]", "[Maracujasaft]", "[Mangopüree]", "[Ananassaft]"],
    palette: {
      signal: "#FFA647",
      signalText: "#A35400",
      deep: "#0F181D",
      haloCore: "#A35C1C",
      haloMid: "#4A2C14",
      haloDeep: "#0F181D",
      haloEdge: "#05090C",
    },
    scene: {
      keyLight: "#E4ECF0",
      rim: "#FFA647",
      canFinish: "satin",
      lights: ["#FFA647", "#DCE6EA"],
      labelFallback: { from: "#3A2412", to: "#05090C", ink: "#EEEBE5" },
    },
    elements: [
      { kind: "passion", count: 5 },
      { kind: "mango", count: 5 },
      { kind: "pineapple", count: 4 },
      { kind: "ice", count: 8 },
    ],
    seed: 1307,
    color: { can: "#0F181D", depth: "#0F181D", signal: "#FFA647" },
  },
  {
    slug: "limette-minze",
    name: "Limette Minze",
    note: "Limette · Minze · Eis",
    eyebrow: "Limette Minze · 330 ml",
    copy: "Vodka, Limette und frische Minze, gemacht für viel Eis. Für die Abende, an die ihr euch erinnern wollt.",
    abv: 0,
    ingredients: ["[Wasser]", "[Vodka]", "[Zucker]", "[Limettensaft]", "[Minzextrakt]"],
    palette: {
      signal: "#FFA647",
      signalText: "#A35400",
      deep: "#0C1915",
      haloCore: "#8A6A2C",
      haloMid: "#2D2A18",
      haloDeep: "#0C1915",
      haloEdge: "#05090C",
    },
    scene: {
      keyLight: "#E4ECF0",
      rim: "#FFA647",
      canFinish: "condensation",
      lights: ["#FFA647", "#DCE6EA"],
      labelFallback: { from: "#1D2A1A", to: "#05090C", ink: "#EEEBE5" },
    },
    elements: [
      { kind: "lime", count: 7 },
      { kind: "mint", count: 8 },
      { kind: "ice", count: 9 },
      { kind: "crushedIce", count: 8 },
    ],
    seed: 2411,
    color: { can: "#0C1915", depth: "#0C1915", signal: "#FFA647" },
  },
];

export const defaultFlavor = flavors[0]!;

export function getFlavor(slug: FlavorSlug): Flavor {
  return flavors.find((f) => f.slug === slug) ?? defaultFlavor;
}

/** CSS custom properties for a flavor (SSR on <html>, client on switch). */
export function flavorCssVars(flavor: Flavor): Record<string, string> {
  const p = flavor.palette;
  return {
    "--signal": p.signal,
    "--signal-text": p.signalText,
    "--deep": p.deep,
    "--halo-core": p.haloCore,
    "--halo-mid": p.haloMid,
    "--halo-deep": p.haloDeep,
    "--halo-edge": p.haloEdge,
  };
}
