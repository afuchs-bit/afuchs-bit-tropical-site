"use client";

import { useRef } from "react";
import { DIRECT, T } from "@/config/intro";
import { heroCopy } from "@/content/hero";
import { useSceneExclude } from "./exclusion";
import { useIntroReveal, type RevealState } from "./ui/introReveal";
import { useSignalWave } from "./ui/signalWave";
import { Wipe, type WipeState } from "./ui/Wipe";

/**
 * One <h1> "Heute Nacht.", set diagonally around the can (Prinzip 29):
 * "Heute" top left, "Nacht." bottom right in front of the can's lower third.
 * The full stop is a light point in Signal (the amber light of the intro);
 * screen readers get a real ".".
 *
 * Metrics (Instrument Serif Italic, measured from the font file): ascent
 * 0.99em + descent 0.31em centered in the 0.86 line box puts the baseline at
 * 0.77em, the cap top (0.72em) at 0.05em. The H and N overhang their origin
 * by 0.036–0.04em to the left (italic serif).
 *
 * The wipe clips each line to its padded box, so the padding must hold every
 * ink pixel: 0.1em left for the overhang, 0.12em top. "Nacht." also carries
 * the glow of its light point (0.24em around the dot): 0.26em right, 0.16em
 * bottom. The offsets below place the visible ink: "Heute" cap top at 110px
 * (mobile 80px), its H flush with the copy column at 56px (mobile 20px); the
 * dot of "Nacht." ends 56px (20px) from the right, its baseline at 86 % of
 * the hero (mobile 88 % of the 62svh scene).
 *
 * Light wipe only when the timeline started at the gate; otherwise final.
 */
const toWipe: Record<RevealState, WipeState> = {
  final: "final",
  hidden: "hidden",
  play: "play",
  skip: "fade",
};

const LINE = "absolute whitespace-nowrap";
const CLIP_HEUTE = "px-[0.1em] py-[0.12em]";
const CLIP_NACHT = "pl-[0.1em] pr-[0.26em] pt-[0.12em] pb-[0.16em]";

export function HeroHeadline() {
  const heute = useIntroReveal(T.headline[0], DIRECT.headline[0]);
  const nacht = useIntroReveal(T.headline[1], DIRECT.headline[1]);
  const heuteRef = useRef<HTMLSpanElement>(null);
  const nachtRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useSceneExclude(heuteRef, "headline-heute", "soft", 16);
  useSceneExclude(nachtRef, "headline-nacht", "soft", 16);
  useSignalWave(dotRef);

  const [first, second] = heroCopy.headline;

  return (
    <h1
      id="hero-title"
      tabIndex={-1}
      data-intro-focus=""
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[62svh] font-hero text-hero text-paper md:h-full"
      // Landing point for focus after the intro, not a control: no ring around
      // the whole hero (the unlayered dark-tone :focus-visible rule beats utilities).
      style={{ outline: "none", boxShadow: "none" }}
    >
      <Wipe
        ref={heuteRef}
        state={toWipe[heute]}
        playKey="intro"
        direction="left"
        barClassName="bg-signal"
        className={`${LINE} left-[calc(20px-0.064em)] top-[calc(80px-0.17em)] md:left-[calc(56px-0.064em)] md:top-[calc(110px-0.17em)]`}
        innerClassName={CLIP_HEUTE}
      >
        {first}
      </Wipe>
      <span className="sr-only"> </span>
      <Wipe
        ref={nachtRef}
        state={toWipe[nacht]}
        playKey="intro"
        direction="right"
        barClassName="bg-signal"
        className={`${LINE} right-[calc(20px-0.26em)] top-[calc(88%-0.89em)] md:right-[calc(56px-0.26em)] md:top-[calc(86%-0.89em)]`}
        innerClassName={CLIP_NACHT}
      >
        {second}
        <span className="sr-only">.</span>
        <span
          ref={dotRef}
          aria-hidden
          className="signal-wave ml-[0.04em] inline-block size-[0.15em] rounded-full bg-signal shadow-[0_0_0.22em_0.02em_var(--signal)]"
        />
      </Wipe>
    </h1>
  );
}
