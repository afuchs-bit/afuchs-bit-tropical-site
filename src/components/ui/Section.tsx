import type { ReactNode } from "react";
import { Container } from "./Container";
import { cn } from "@/lib/cn";

type Props = { id: string; children: ReactNode; className?: string; labelledBy?: string };

/** Section wrapper: anchor id, vertical rhythm, accessible label. */
export function Section({ id, children, className, labelledBy }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy ?? `${id}-title`}
      className={cn("py-section", className)}
    >
      <Container>{children}</Container>
    </section>
  );
}
