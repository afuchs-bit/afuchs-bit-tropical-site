import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { HeroExperience } from "@/components/hero/HeroExperience";

/**
 * Hero-only phase: the page is the hero (gate, intro, scene, sheets). The
 * parked sections stay in src/components/sections and come back with the
 * order from docs/site-structure.md.
 */
export default function HomePage() {
  return (
    <HeroExperience>
      <Header />
      <main id="main">
        <Hero />
      </main>
    </HeroExperience>
  );
}
