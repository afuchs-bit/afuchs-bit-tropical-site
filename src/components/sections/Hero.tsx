import { brand } from "@/config/brand";
import { cta } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * HERO: placeholder shell.
 *
 * The intro sequence, the R3F can and the floating elements are built in the
 * hero round (docs/hero-brief.md). Contract that the rest of the page relies on:
 *
 * - This stays a Server Component. The R3F canvas goes into a separate client
 *   component loaded with next/dynamic({ ssr: false }).
 * - The intro reads `firstPass` from useAgeGate() to decide whether to play.
 * - Flavor switch reads from src/content/flavors.ts.
 * - Headline, one line of copy and the two CTAs come from config, not from JSX.
 * - Copy zone keeps full ink and nothing floats over it.
 */
export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-svh items-end bg-paper pt-16"
    >
      {/* Canvas slot: <CanScene /> mounts here, absolutely positioned behind the copy. */}
      <div aria-hidden="true" className="absolute inset-0" />

      <Container className="relative pb-section">
        <p className="mono-label">{brand.canSizeMl} ml · 18+</p>
        <h1 id="hero-title" className="mt-6 max-w-4xl font-display text-display">
          {brand.name}
        </h1>
        <p className="mt-8 max-w-prose text-lead text-ink-2">{brand.tagline}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={cta.primary.href}>{cta.primary.label}</ButtonLink>
          <ButtonLink href={cta.secondary.href} variant="ghost">
            {cta.secondary.label}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
