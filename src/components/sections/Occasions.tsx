import Image from "next/image";
import { occasions } from "@/content/occasions";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Block 2 "Der Abend": occasion before product. The seven intro photos get a
 * second life as one horizontal strip, read like the night itself (01 → 07),
 * instead of a tile grid that would put seven equal cards in rows.
 */
export function Occasions() {
  return (
    <Section id="abend">
      <SectionHeading
        id="abend-title"
        eyebrow="Der Abend"
        title="[Headline über den Abend, nicht über die Dose]"
        lead="[Ein Satz, der die sieben Momente zu einer Nacht verbindet.]"
      />

      <ol className="mt-16 -mx-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-4 sm:gap-6">
        {occasions.map((o) => (
          <li
            key={o.slug}
            className="group w-[72vw] shrink-0 snap-start sm:w-[42vw] lg:w-[24vw]"
          >
            <figure>
              <div className="relative aspect-square overflow-hidden rounded-full bg-paper-2">
                <Image
                  src={o.image}
                  alt={o.title}
                  fill
                  sizes="(min-width: 1024px) 24vw, (min-width: 640px) 42vw, 72vw"
                  className="object-cover transition-transform duration-slow ease-out-expo group-hover:scale-[1.03]"
                />
              </div>
              <figcaption className="mt-4">
                <p className="mono-label">{o.label}</p>
                <p className="mt-2 font-display text-xl">{o.title}</p>
                <p className="mt-1 text-sm text-ink-2">{o.line}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </Section>
  );
}
