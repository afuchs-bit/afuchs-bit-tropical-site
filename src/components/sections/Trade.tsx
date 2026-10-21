import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

/**
 * Block 8 "Für Bars & Handel": the B2B signal. Resellers are the actual
 * bottleneck (see the evaluation), so this section gets its own anchor.
 */
export function Trade() {
  return (
    <Section id="handel" className="bg-paper-2">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <SectionHeading
            id="handel-title"
            eyebrow="Für Bars & Handel"
            title="[Headline für Betreiber]"
            lead="[Zwei Sätze: Set als Hausdrink, Rezepte und Kartendesign inklusive, Pilot in zwei Wochenenden.]"
          />
          <a
            href="/handel-onepager.pdf"
            className="mt-8 inline-block text-sm underline underline-offset-4 hover:text-signal"
          >
            Onepager als PDF
          </a>
        </div>

        <form className="space-y-4" action="#" method="post" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="trade-name" className="mono-label">
                Name
              </label>
              <input id="trade-name" name="name" type="text" autoComplete="name" required className="mt-2 w-full rounded-pill border border-ink/20 bg-transparent px-5 py-3 text-base focus:border-ink" />
            </div>
            <div>
              <label htmlFor="trade-venue" className="mono-label">
                Betrieb
              </label>
              <input id="trade-venue" name="venue" type="text" autoComplete="organization" required className="mt-2 w-full rounded-pill border border-ink/20 bg-transparent px-5 py-3 text-base focus:border-ink" />
            </div>
          </div>
          <div>
            <label htmlFor="trade-email" className="mono-label">
              E-Mail
            </label>
            <input id="trade-email" name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-pill border border-ink/20 bg-transparent px-5 py-3 text-base focus:border-ink" />
          </div>
          <div>
            <label htmlFor="trade-type" className="mono-label">
              Art des Betriebs
            </label>
            <select id="trade-type" name="type" className="mt-2 w-full rounded-pill border border-ink/20 bg-transparent px-5 py-3 text-base focus:border-ink">
              <option value="bar">Bar / Club</option>
              <option value="handel">Getränkehandel / Späti</option>
              <option value="event">Event / Catering</option>
              <option value="sonstiges">Sonstiges</option>
            </select>
          </div>
          <div>
            <label htmlFor="trade-message" className="mono-label">
              Nachricht
            </label>
            <textarea id="trade-message" name="message" rows={4} className="mt-2 w-full rounded-2xl border border-ink/20 bg-transparent px-5 py-3 text-base focus:border-ink" />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Anfrage senden
          </Button>
        </form>
      </div>
    </Section>
  );
}
