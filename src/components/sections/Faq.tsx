import { faq } from "@/content/faq";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Block 10 "FAQ": native <details>, no JS, indexable. */
export function Faq() {
  return (
    <Section id="faq" className="bg-paper-2">
      <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
        <SectionHeading id="faq-title" eyebrow="Fragen" title="Kurz beantwortet" />
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="text-ink-2 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-prose text-sm text-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
