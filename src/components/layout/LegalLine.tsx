import Link from "next/link";
import { Fragment } from "react";
import { Clock07 } from "@/components/hero/Clock07";
import { IntroSlot } from "@/components/hero/IntroSlot";
import { SoundToggle } from "@/components/hero/SoundToggle";
import { ExcludeZone } from "@/components/hero/ui/ExcludeZone";
import { DIRECT, T } from "@/config/intro";
import { heroCopy } from "@/content/hero";
import { cn } from "@/lib/cn";

/**
 * Bottom row of the hero: the 07 ring left, the legal line center (Mono
 * 12px, full Papier, not dimmed), TON right. Mobile stacks the three at the
 * end of the rest zone. "Produktangaben" opens the Sorten sheet.
 *
 * The ring fades in place at T.header, exactly when the intro's 07 label
 * (which flew down to it) fades out; the rest follows the CTAs at T.legal.
 * The row is a hard exclusion zone: nothing in the scene rests on meta text.
 */
const linkClass = "inline-flex min-h-11 items-center underline-offset-4 hover:underline";

export function LegalLine({ className }: { className?: string }) {
  const items = [
    <span key="responsible">{heroCopy.legal[0]}</span>,
    <span key="age">{heroCopy.legal[1]}</span>,
    <a key="product" href="#sorten" className={linkClass}>
      Produktangaben
    </a>,
    <Link key="imprint" href="/impressum" className={linkClass}>
      Impressum
    </Link>,
    <Link key="privacy" href="/datenschutz" className={linkClass}>
      Datenschutz
    </Link>,
  ];

  return (
    <ExcludeZone
      id="hero-bottom-row"
      className={cn(
        "flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-6 md:gap-y-1 lg:grid lg:grid-cols-[1fr_auto_1fr]",
        className,
      )}
    >
      <IntroSlot at={T.header} directAt={DIRECT.ui} rise={0} className="lg:justify-self-start">
        <Clock07 />
      </IntroSlot>
      <IntroSlot at={T.legal} directAt={DIRECT.ui}>
        <p className="flex flex-wrap items-center gap-x-2 font-mono text-meta uppercase text-paper">
          {items.map((item, i) => (
            <Fragment key={item.key}>
              {i > 0 && <span aria-hidden>·</span>}
              {item}
            </Fragment>
          ))}
        </p>
      </IntroSlot>
      <IntroSlot at={T.legal} directAt={DIRECT.ui} className="lg:justify-self-end">
        <SoundToggle />
      </IntroSlot>
    </ExcludeZone>
  );
}
