import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
};

/** Eyebrow (mono) → H2 → optional lead. Every section starts the same way. */
export function SectionHeading({ eyebrow, title, lead, id }: Props) {
  return (
    <header className="max-w-prose">
      <p className="mono-label">{eyebrow}</p>
      <h2 id={id} className="mt-4 font-display text-h2">
        {title}
      </h2>
      {lead ? <p className="mt-6 text-lead text-ink-2">{lead}</p> : null}
    </header>
  );
}
