import { cn } from "@/lib/cn";

/**
 * 1px gloss arc along the top edge (bubble motif, Prinzip 13, dosed): header
 * pill, flavor cards and the 07 ring. Follows the parent's radius and fades
 * out towards the sides. The parent must be positioned.
 */
export function GlossArc({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border-t border-paper/45 [mask-image:linear-gradient(90deg,transparent_10%,#000_36%,#000_64%,transparent_90%)]",
        className,
      )}
    />
  );
}
