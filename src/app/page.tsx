import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Occasions } from "@/components/sections/Occasions";
import { Lineup } from "@/components/sections/Lineup";
import { Ingredients } from "@/components/sections/Ingredients";
import { Serve } from "@/components/sections/Serve";
import { Proof } from "@/components/sections/Proof";
import { Drop } from "@/components/sections/Drop";
import { Trade } from "@/components/sections/Trade";
import { Story } from "@/components/sections/Story";
import { Faq } from "@/components/sections/Faq";

/**
 * One page, ten blocks. Order is the dramaturgy from docs/site-structure.md:
 * feeling → product → proof → action.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Occasions />
        <Lineup />
        <Ingredients />
        <Serve />
        <Proof />
        <Drop />
        <Trade />
        <Story />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
