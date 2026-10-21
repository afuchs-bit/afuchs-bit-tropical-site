import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

/**
 * Block 7 "Erster Drop": main consumer CTA in the prototype phase.
 * Form posts nowhere yet; wire up /api/drop (Resend/Brevo) before launch.
 * Double opt-in is required (see docs/legal-checklist.md).
 */
export function Drop() {
  return (
    <Section id="drop">
      <div className="grid gap-12 md:grid-cols-2 md:items-end">
        <SectionHeading
          id="drop-title"
          eyebrow="Erster Drop"
          title="[Stückzahl] Dosen. [Zeitraum]."
          lead="Trag dich ein und erfahre Datum und Stückzahl zuerst."
        />

        <form className="space-y-4" action="#" method="post" noValidate>
          <div>
            <label htmlFor="drop-email" className="mono-label">
              E-Mail
            </label>
            <input
              id="drop-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-2 w-full rounded-pill border border-ink/20 bg-transparent px-5 py-3 text-base placeholder:text-ink-2/60 focus:border-ink"
              placeholder="du@beispiel.de"
            />
          </div>
          <div className="flex items-start gap-3">
            <input id="drop-consent" name="consent" type="checkbox" required className="mt-1" />
            <label htmlFor="drop-consent" className="text-xs text-ink-2">
              Ich bin mindestens 18 Jahre alt und möchte per E-Mail über den ersten
              Drop informiert werden. Abmeldung jederzeit möglich.
            </label>
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Eintragen
          </Button>
          <p className="mono-label">Versand nur innerhalb Deutschlands</p>
        </form>
      </div>
    </Section>
  );
}
