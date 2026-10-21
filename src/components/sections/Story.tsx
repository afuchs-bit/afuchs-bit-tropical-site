import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Block 9 "Story": three founders, one paragraph, one photo. No mission prose. */
export function Story() {
  return (
    <Section id="story">
      <div className="grid gap-12 md:grid-cols-2">
        <SectionHeading id="story-title" eyebrow="Wer dahinter steckt" title="[Drei Namen, eine Stadt]" />
        <div>
          <div className="aspect-[3/2] rounded-2xl bg-paper-2" aria-hidden="true" />
          <p className="mt-8 max-w-prose text-lead text-ink-2">
            [Ein Absatz: Wer ihr seid, warum dieses Getränk, was ihr anders macht.
            Konkret, ohne Mission-Statement.]
          </p>
        </div>
      </div>
    </Section>
  );
}
