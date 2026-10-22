import { T } from "@/config/intro";
import { FlavorAnnouncer, FlavorCards, FlavorChips } from "@/components/hero/FlavorSwitch";
import { HeroBackdrop } from "@/components/hero/HeroBackdrop";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { HeroHeadline } from "@/components/hero/HeroHeadline";
import { IntroSlot } from "@/components/hero/IntroSlot";
import { MobileSwipe } from "@/components/hero/MobileSwipe";
import { SceneSlot } from "@/components/hero/ui/SceneSlot";
import { LegalLine } from "@/components/layout/LegalLine";

/**
 * HERO "Heute / Nacht." (docs/design-direction.md §4–7).
 *
 * Server Component: the markup is the final state (LCP, no-JS, return
 * visits). Client islands only animate what the intro or a flavor switch
 * changes, and only when the timeline started at the gate.
 *
 * Layers inside #hero (isolated stacking context):
 *   0   CSS backdrop: halo, light cone, vignette (fallback without WebGL)
 *   0+  scene canvas (SceneSlot; positions itself)
 *   10  headline overlay (pointer-events none) and the copy layer
 *
 * Desktop: copy left (x 56–480, y 44–82 %), cards top right, bottom row.
 * Mobile: scene 0–62svh (swipe area), then the rest zone on Tiefe with a
 * 48px soft edge; at least one screen high, grows with the text.
 */
export function Hero() {
  return (
    <section
      id="hero"
      data-tone="dark"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col overflow-hidden md:block"
    >
      <HeroBackdrop />
      <SceneSlot />
      <HeroHeadline />

      <div className="relative z-10 flex min-h-svh flex-1 flex-col md:block">
        <MobileSwipe />

        {/* Only --deep transitions here: nested signal-wave elements keep their own delay. */}
        <div className="relative flex flex-1 flex-col bg-deep px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-2 [transition:--deep_600ms_var(--ease-in-out-quart)_300ms] before:pointer-events-none before:absolute before:inset-x-0 before:-top-12 before:h-12 before:bg-linear-to-b before:from-transparent before:to-deep md:static md:block md:bg-transparent md:p-0 md:before:hidden">
          <IntroSlot at={T.header} className="md:hidden">
            <FlavorChips />
          </IntroSlot>

          <HeroCopy className="mt-8 md:absolute md:left-14 md:top-[44%] md:mt-0 md:w-[26.5rem]" />

          <IntroSlot at={T.header} className="absolute right-14 top-[110px] hidden md:block">
            <FlavorCards />
          </IntroSlot>

          <LegalLine className="mt-12 md:absolute md:inset-x-14 md:bottom-6 md:mt-0" />
        </div>
      </div>

      <FlavorAnnouncer />
    </section>
  );
}
