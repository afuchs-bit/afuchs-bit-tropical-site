/**
 * The six memories. Used twice: in the intro bubbles (hero) and in the
 * "Der Abend" section. Keep images free of anyone drinking while steering
 * a vehicle (Werberat code).
 */
export type Occasion = {
  slug: string;
  /** Mono label shown on the bubble, e.g. "SAMSTAG, 01:40". */
  stamp: string;
  title: string;
  line: string;
  image: string; // path under /public/intro/
};

export const occasions: Occasion[] = [
  {
    slug: "party",
    stamp: "SAMSTAG, 01:40",
    title: "Die Party",
    line: "[Ein Satz über den Moment, nicht über das Getränk]",
    image: "/intro/party.jpg",
  },
  {
    slug: "jetski",
    stamp: "SONNTAG, 14:10",
    title: "Jetski-Tag",
    line: "[Ein Satz]",
    image: "/intro/jetski.jpg",
  },
  {
    slug: "yacht",
    stamp: "FREITAG, 20:55",
    title: "Yacht bei Sonnenuntergang",
    line: "[Ein Satz]",
    image: "/intro/yacht.jpg",
  },
  {
    slug: "lobby",
    stamp: "DONNERSTAG, 23:30",
    title: "Die Hotellobby",
    line: "[Ein Satz]",
    image: "/intro/lobby.jpg",
  },
  {
    slug: "garten",
    stamp: "SAMSTAG, 17:20",
    title: "Garten mit Freunden",
    line: "[Ein Satz]",
    image: "/intro/garten.jpg",
  },
  {
    slug: "club",
    stamp: "SAMSTAG, 00:05",
    title: "Auf dem Weg zum Club",
    line: "[Ein Satz]",
    image: "/intro/club.jpg",
  },
];
