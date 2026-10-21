import { flavors } from "@/content/flavors";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Block 3 "Sorten": taste in three words, ABV stated plainly (mandatory), one color per flavor. */
export function Lineup() {
  return (
    <Section id="sorten">
      <SectionHeading
        id="sorten-title"
        eyebrow="Sorten"
        title="[Headline zu den Sorten]"
      />

      <ul className="mt-16 grid gap-6 md:grid-cols-2">
        {flavors.map((f) => (
          <li
            key={f.slug}
            className="rounded-2xl border border-ink/10 p-8"
            style={{ backgroundColor: f.color.depth }}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="font-display text-3xl">{f.name}</h3>
                <p className="mt-2 text-lead text-ink-2">{f.note}</p>
              </div>
              <span
                aria-hidden="true"
                className="size-10 shrink-0 rounded-full"
                style={{ backgroundColor: f.color.signal }}
              />
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="mono-label">Alkohol</dt>
                <dd className="mt-1">{f.abv.toLocaleString("de-DE")} % vol</dd>
              </div>
              <div>
                <dt className="mono-label">Inhalt</dt>
                <dd className="mt-1">330 ml</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </Section>
  );
}
