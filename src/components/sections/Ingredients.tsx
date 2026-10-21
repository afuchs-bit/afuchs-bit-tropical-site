import { flavors } from "@/content/flavors";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Block 4 "Was drin ist": transparency as a quality anchor. Factual tone,
 * full ink. No "natürlich", "leicht", "gesund" (health-claim risk > 1,2 % vol).
 */
export function Ingredients() {
  return (
    <Section id="zutaten" className="bg-paper-2">
      <div className="grid gap-12 md:grid-cols-2">
        <SectionHeading
          id="zutaten-title"
          eyebrow="Was drin ist"
          title="[Headline zu Zutaten]"
          lead="[Zwei Sätze zur Herkunft der Hauptzutaten. Sachlich.]"
        />

        <div className="space-y-8">
          {flavors.map((f) => (
            <div key={f.slug}>
              <h3 className="font-display text-xl">{f.name}</h3>
              <p className="mt-2 text-sm text-ink-2">
                <span className="mono-label">Zutaten:</span>{" "}
                {f.ingredients.join(", ")}
              </p>
            </div>
          ))}
          <p className="text-sm text-ink-2">
            [Allergenhinweis laut Abfüller.] Enthält Alkohol. Nicht für Personen
            unter 18 Jahren.
          </p>
        </div>
      </div>
    </Section>
  );
}
