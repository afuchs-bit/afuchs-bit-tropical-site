import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Block 6 "Wo es läuft": social proof. Renders nothing until there is real
 * proof (pilot bars, operator quotes, UGC). Never fill with placeholders.
 */
type ProofItem = { venue: string; city: string; quote?: string };

const proof: ProofItem[] = [];

export function Proof() {
  if (proof.length === 0) return null;

  return (
    <Section id="wo" className="bg-paper-2">
      <SectionHeading id="wo-title" eyebrow="Wo es läuft" title="Hier gibt's das" />
      <ul className="mt-16 grid gap-6 md:grid-cols-3">
        {proof.map((p) => (
          <li key={`${p.venue}-${p.city}`} className="rounded-2xl border border-ink/10 p-8">
            <p className="font-display text-xl">{p.venue}</p>
            <p className="mono-label mt-1">{p.city}</p>
            {p.quote ? <blockquote className="mt-4 text-sm text-ink-2">„{p.quote}“</blockquote> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
