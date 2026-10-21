import Image from "next/image";
import { occasions } from "@/content/occasions";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Block 2 "Der Abend": occasion before product. Images get a second life here. */
export function Occasions() {
  return (
    <Section id="abend">
      <SectionHeading
        id="abend-title"
        eyebrow="Der Abend"
        title="[Headline über den Abend, nicht über die Dose]"
        lead="[Ein Satz, der die sechs Momente zu einem Abend verbindet.]"
      />

      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {occasions.map((o) => (
          <li key={o.slug} className="group">
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-2">
                <Image
                  src={o.image}
                  alt={o.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
                />
              </div>
              <figcaption className="mt-4">
                <p className="mono-label">{o.stamp}</p>
                <p className="mt-2 font-display text-xl">{o.title}</p>
                <p className="mt-1 text-sm text-ink-2">{o.line}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
