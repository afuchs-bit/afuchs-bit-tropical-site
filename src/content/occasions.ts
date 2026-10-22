/**
 * The seven moments of one summer night in a nameless city, in dramaturgy
 * order: Stadt → Bewegung → Spannung → Weite → Atempause → Höhepunkt → Knall.
 * Used twice: in the intro bubbles (hero) and in the "Der Abend" section.
 *
 * Rules (Werberat code): nobody drinks while steering a vehicle, no money,
 * watches, jewellery, cars or jets, no status or success in the copy.
 * yacht and water never follow each other directly.
 */
export type OccasionSlug =
  | "towers"
  | "yacht"
  | "storm"
  | "water"
  | "terrace"
  | "rooftop"
  | "fireworks";

export type Occasion = {
  slug: OccasionSlug;
  /** Mono label on the bubble: one night running towards midnight, no weekdays. */
  label: string;
  title: string;
  line: string;
  /** 1200 px JPG (fallback and OG); the intro loads /intro/<slug>.avif. */
  image: string;
  /** Short loop for later, e.g. "/intro/rooftop.mp4". */
  video?: string;
};

export const occasions: Occasion[] = [
  {
    slug: "towers",
    label: "01 · 22:14",
    title: "Zwischen den Türmen",
    line: "[Ein Satz über den Moment, nicht über das Getränk]",
    image: "/intro/towers.jpg",
  },
  {
    slug: "yacht",
    label: "02 · 22:51",
    title: "Übers Deck",
    line: "[Ein Satz über den Moment, nicht über das Getränk]",
    image: "/intro/yacht.jpg",
  },
  {
    slug: "storm",
    label: "03 · 23:08",
    title: "Gewitter über der Stadt",
    line: "[Ein Satz über den Moment, nicht über das Getränk]",
    image: "/intro/storm.jpg",
  },
  {
    slug: "water",
    label: "04 · 23:26",
    title: "Die Stadt im Wasser",
    line: "[Ein Satz über den Moment, nicht über das Getränk]",
    image: "/intro/water.jpg",
  },
  {
    slug: "terrace",
    label: "05 · 23:47",
    title: "Die leere Terrasse",
    line: "[Ein Satz über den Moment, nicht über das Getränk]",
    image: "/intro/terrace.jpg",
  },
  {
    slug: "rooftop",
    label: "06 · 23:58",
    title: "Auf dem Dach",
    line: "[Ein Satz über den Moment, nicht über das Getränk]",
    image: "/intro/rooftop.jpg",
  },
  {
    slug: "fireworks",
    label: "07 · 00:00",
    title: "Mitternacht",
    line: "[Ein Satz über den Moment, nicht über das Getränk]",
    image: "/intro/fireworks.jpg",
  },
];
