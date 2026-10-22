"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { DIRECT, T } from "@/config/intro";
import { getFlavor, type FlavorSlug } from "@/content/flavors";
import { heroCopy } from "@/content/hero";
import { TextRollButton } from "@/design/patterns/TextRollButton";
import { cn } from "@/lib/cn";
import { useSceneExclude } from "./exclusion";
import { SWITCH_DURATION } from "./flavor/switchFlavor";
import { IntroSlot } from "./IntroSlot";
import { heroStore, switchTime, useHero } from "./store";
import { scheduleAt, useIntroReveal, type RevealState } from "./ui/introReveal";
import { useSignalWave } from "./ui/signalWave";
import { useCalm } from "./ui/useCalm";
import { SwitchWipe, Wipe, type WipeState } from "./ui/Wipe";

/**
 * Rest zone copy (direction §4): eyebrow in Signal, copy in full Papier
 * (first sentence 500), primary CTA and the trade link. Line length stays at
 * ≈ 34 characters after wrapping: in Geist the "0" behind `ch` is 0.663em
 * against an average of 0.456em per character of this copy, so 26ch hold
 * ≈ 38 characters (the measure 30ch of Hanken had). Desktop: x 56–480,
 * y from 44 %, a Tinte scrim behind it; mobile: in the rest zone on Tiefe.
 * Copy and CTAs are hard exclusion zones: nothing in the scene rests there.
 *
 * On a flavor switch eyebrow and copy run a new light wipe between 0.5 and
 * 1.0 s of the switch (SwitchWipe, pinned to `switchedAt`): the bar covers
 * the old text, the new one appears behind it. Reduced motion: 200 ms
 * cross-fade.
 */
const SWITCH_TEXT_AT = 0.5;
const SWITCH_TEXT_DURATION = SWITCH_DURATION - SWITCH_TEXT_AT;
const INTRO_TEXT_DURATION = 0.4;

function splitFirstSentence(text: string): [string, string] {
  const end = text.indexOf(". ");
  return end === -1 ? [text, ""] : [text.slice(0, end + 1), text.slice(end + 1)];
}

const introToWipe: Record<RevealState, WipeState> = {
  final: "final",
  hidden: "hidden",
  play: "play",
  skip: "fade",
};

function Eyebrow({ slug }: { slug: FlavorSlug }) {
  return <>{getFlavor(slug).eyebrow}</>;
}

function Copy({ slug }: { slug: FlavorSlug }) {
  const [lead, rest] = splitFirstSentence(getFlavor(slug).copy);
  return (
    <>
      <span className="font-medium">{lead}</span>
      {rest}
    </>
  );
}

export function HeroCopy({ className }: { className?: string }) {
  const flavor = useHero((s) => s.flavor);
  const prevFlavor = useHero((s) => s.prevFlavor);
  const switchedAt = useHero((s) => s.switchedAt);
  const calm = useCalm();
  const intro = useIntroReveal(T.copy, DIRECT.ui);
  // A switch that happened before this mount (client navigation back to "/")
  // is not replayed. During hydration the store holds no switch yet.
  const [mountSwitch] = useState(() => heroStore.get().switchedAt);
  const [settledAt, setSettledAt] = useState(mountSwitch);

  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const primaryRef = useRef<HTMLSpanElement>(null);
  useSceneExclude(textRef, "hero-copy", "hard");
  useSceneExclude(ctaRef, "hero-ctas", "hard");
  useSignalWave(eyebrowRef);
  useSignalWave(primaryRef);

  const switched = switchedAt !== null && switchedAt !== mountSwitch;
  const switching = switched && switchedAt !== settledAt;

  // Back to plain markup once the switch is over. Only the clean-up of the
  // stacked layers waits for this; the wipe itself runs on the switch clock.
  useEffect(() => {
    if (!switching || switchedAt === null) return;
    return scheduleAt(switchTime, SWITCH_DURATION, () => setSettledAt(switchedAt));
  }, [switching, switchedAt]);

  const shell = "relative inline-block max-w-full align-top";
  const bar = "bg-paper/16";

  const slot = (render: (slug: FlavorSlug) => ReactNode): ReactNode => {
    if (switching && !calm && switchedAt !== null) {
      return (
        <SwitchWipe
          key={switchedAt}
          origin={switchedAt}
          start={SWITCH_TEXT_AT}
          duration={SWITCH_TEXT_DURATION}
          barClassName={bar}
          className={shell}
          from={render(prevFlavor ?? flavor)}
          to={render(flavor)}
        />
      );
    }
    // After a switch: final markup, or a 200 ms cross-fade under reduced
    // motion. Before any switch: the intro reveal.
    const state: WipeState = switched ? (calm ? "fade" : "final") : introToWipe[intro];
    return (
      <Wipe
        state={state}
        playKey={switched ? (switchedAt ?? "switch") : "intro"}
        duration={INTRO_TEXT_DURATION}
        fadeDuration={switched ? 0.2 : 0.4}
        barClassName={bar}
        className={shell}
      >
        {render(flavor)}
      </Wipe>
    );
  };

  return (
    <div className={cn("relative isolate", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-28 -inset-y-24 -z-10 hidden md:block"
        style={{
          background: "radial-gradient(closest-side, color-mix(in oklab, var(--ink) 45%, transparent), transparent)",
        }}
      />
      <div ref={textRef}>
        <p ref={eyebrowRef} className="signal-wave font-mono text-meta uppercase text-signal">
          {slot((slug) => (
            <Eyebrow slug={slug} />
          ))}
        </p>
        <p className="mt-4 max-w-[26ch] text-body-l text-paper">
          {slot((slug) => (
            <Copy slug={slug} />
          ))}
        </p>
      </div>

      <IntroSlot at={T.ctas} className="mt-8">
        <div ref={ctaRef} className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-7">
          <span ref={primaryRef} className="signal-wave flex">
            <TextRollButton
              href={heroCopy.cta.primary.href}
              variant="signal"
              className="h-13 w-full justify-between md:w-auto"
            >
              {heroCopy.cta.primary.label}
            </TextRollButton>
          </span>
          <a
            href={heroCopy.cta.secondary.href}
            className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-medium text-paper underline decoration-paper-56 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-300 hover:decoration-paper"
          >
            {heroCopy.cta.secondary.label}
            <span aria-hidden>→</span>
          </a>
        </div>
      </IntroSlot>
    </div>
  );
}
