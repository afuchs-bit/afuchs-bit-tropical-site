import { FINAL_LABEL } from "@/config/intro";
import { cn } from "@/lib/cn";
import { GlossArc } from "./ui/GlossArc";

/**
 * "07 · HEUTE NACHT": the seventh bubble stays as a line ring at the bottom
 * left (direction §4). Static, no clock: the label the intro's last bubble
 * rolls to and flies down to; `data-intro-clock` marks the text so that
 * label lands on it to the pixel (intro/FinalLabel).
 */
export function Clock07({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "relative inline-flex h-9 items-center rounded-full border border-paper/30 px-4 font-mono text-meta whitespace-nowrap uppercase tabular-nums text-paper-72",
        className,
      )}
    >
      <GlossArc />
      <span data-intro-clock="">{FINAL_LABEL}</span>
    </p>
  );
}
