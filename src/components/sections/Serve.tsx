import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const serves = [
  { title: "Gekühlt, pur", line: "[Aus der Dose, 4 °C.]" },
  { title: "Auf Eis", line: "[Großes Glas, viel Eis, Limette.]" },
  { title: "Als Longdrink", line: "[Mit Tonic oder Soda, 1:1.]" },
] as const;

/** Block 5 "So trinkst du's": ritual and serve, max. three options. */
export function Serve() {
  return (
    <Section id="serve">
      <SectionHeading id="serve-title" eyebrow="So trinkst du's" title="[Headline Serviervorschlag]" />

      <ol className="mt-16 grid gap-6 md:grid-cols-3">
        {serves.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-ink/10 p-8">
            <p className="mono-label">0{i + 1}</p>
            <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-2">{s.line}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
