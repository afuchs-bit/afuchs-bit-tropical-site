"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { T, bubbles } from "@/config/intro";
import { SoundToggle } from "../SoundToggle";
import { useHero } from "../store";
import { AmberTrail } from "./AmberTrail";
import { FINAL_HANDOVER, FinalBubble } from "./FinalBubble";
import { FinalLabel } from "./FinalLabel";
import { LightHalo } from "./LightHalo";
import { LightSeed } from "./LightSeed";
import { Eyelids } from "./Eyelids";
import { MemoryFrame } from "./MemoryBubble";
import { isIntroRunning } from "./mode";
import { SkipIntro } from "./SkipIntro";
import { useStageLayout } from "./stageLayout";
import { STAGE_FADE } from "./timing";
import { easing, track } from "./waapi";

/** The last memory becomes the light halo; all others are seen between blinks. */
const finalSpec = bubbles[bubbles.length - 1];
const memorySpecs = bubbles.slice(0, -1);

/** Fixed full-viewport layer; the intro's layers stack by DOM order at z 45. */
const LAYER = "pointer-events-none fixed inset-0 overflow-hidden";

/**
 * After the overlay, focus goes to the hero, not to <body>. The UI marks its
 * target with `data-intro-focus` (the h1 with tabIndex -1); fallback: any
 * focusable h1 in <main>.
 */
function releaseFocus(root: HTMLElement | null): void {
  if (!root || !root.contains(document.activeElement)) return;
  const target =
    document.querySelector<HTMLElement>("[data-intro-focus]") ??
    document.querySelector<HTMLElement>("main h1[tabindex]");
  if (target) target.focus({ preventScroll: true });
  else (document.activeElement as HTMLElement | null)?.blur();
}

/**
 * The intro overlay (z 45: above the hero, below grain 46 and the age gate
 * 50). Portaled to <body> so an inert or transformed hero shell can neither
 * block the skip button nor break `position: fixed`. Rendered only for mode
 * "intro" while the phase is grain … reveal, then it fades out over
 * STAGE_FADE (skip or end) and unmounts when that fade has finished.
 * Reduced motion never gets here (mode "static").
 */
export function IntroStage() {
  const active = useHero(isIntroRunning);
  const t0 = useHero((s) => s.t0);
  const [shown, setShown] = useState(false);
  const [clock, setClock] = useState<number | null>(null);
  const hide = useCallback(() => setShown(false), []);
  // Derived during render: the first running phase mounts the stage at once.
  if (active && !shown) setShown(true);
  // The stage follows t0 while the intro runs (a photo hold moves it forward).
  // A skip moves t0 in the same write that ends the run: that jump is ignored,
  // the layers keep their clock and fade out.
  if (active && t0 !== null && t0 !== clock) setClock(t0);
  if (!shown || clock === null) return null;
  return createPortal(<Stage t0={clock} leaving={!active} onLeft={hide} />, document.body);
}

/**
 * Four layers, because blending stops at stacking contexts: a fixed element
 * is one, so additive light inside the bubble layer could never reach the
 * hero underneath.
 *   1 Tinte        until T.pop, then transparent over T.backdrop
 *   2 light        DOM halo and cone, plus-lighter onto Tinte and hero
 *   3 bubbles      memories, the amber trail, the final bubble and its
 *                  label, Skip and TON
 *   4 seed (z 51)  the light seed, above the fading gate for T.gateOut
 *
 * Two clocks: `t0` (follows a photo hold) drives everything from the grain
 * on; the gate-out (light seed, Skip/TON fade-in) keeps the click time, so a
 * hold never replays it.
 */
function Stage({ t0, leaving, onLeft }: { t0: number; leaving: boolean; onLeft: () => void }) {
  const [gateT0] = useState(t0);
  const layout = useStageLayout();
  const inkLayer = useRef<HTMLDivElement>(null);
  const lightLayer = useRef<HTMLDivElement>(null);
  const bubbleLayer = useRef<HTMLDivElement>(null);
  const seedLayer = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const [backdropFrom, backdropTo] = T.backdrop;
    // Tinte until T.pop, then the hero underneath shows through.
    const fade = track(
      ink.current,
      t0,
      [
        { t: backdropFrom, opacity: 1, easing: easing.inOutQuart },
        { t: backdropTo, opacity: 0 },
      ],
      { fill: "both" },
    );
    return () => fade?.cancel();
  }, [t0]);

  useLayoutEffect(() => {
    const [gateFrom, gateTo] = T.gateOut;
    // Skip and TON appear with the light seed.
    const fade = track(controls.current, gateT0, [
      { t: gateFrom, opacity: 0, easing: easing.outQuart },
      { t: gateTo, opacity: 1 },
    ]);
    return () => fade?.cancel();
  }, [gateT0]);

  useEffect(() => {
    if (!leaving) return;
    // Move focus out first: making a focused control inert would drop it on <body>.
    releaseFocus(bubbleLayer.current);
    if (controls.current) controls.current.inert = true;
    // Each layer fades on its own: opacity on a shared parent would isolate
    // the additive light layer and change its look mid-fade.
    const fades = [inkLayer, lightLayer, bubbleLayer, seedLayer].flatMap((layer) => {
      const fade = layer.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: STAGE_FADE * 1000,
        easing: easing.outQuart,
        fill: "forwards",
      });
      return fade ? [fade] : [];
    });
    // Unmount when the fade is done (a cancelled fade rejects: still mounted).
    Promise.all(fades.map((fade) => fade.finished)).then(onLeft, () => {});
    return () => fades.forEach((fade) => fade.cancel());
  }, [leaving, onLeft]);

  return (
    <>
      <div ref={inkLayer} aria-hidden="true" className={`${LAYER} z-[45]`}>
        <div ref={ink} className="absolute inset-0 bg-ink" />
      </div>
      <div ref={lightLayer} aria-hidden="true" className={`${LAYER} z-[45]`} style={{ mixBlendMode: "plus-lighter" }}>
        <LightHalo t0={t0} layout={layout} />
      </div>
      <div ref={bubbleLayer} className={`${LAYER} z-[45]`}>
        <div aria-hidden="true" className="absolute inset-0">
          {memorySpecs.map((spec) => (
            <MemoryFrame key={spec.id} spec={spec} t0={t0} />
          ))}
          {finalSpec && (
            <MemoryFrame spec={finalSpec} t0={t0} hideAt={T.finalToCenter[0]} fade={FINAL_HANDOVER} />
          )}
          {finalSpec && <FinalBubble spec={finalSpec} t0={t0} layout={layout} />}
          <Eyelids t0={t0} />
          <AmberTrail t0={t0} layout={layout} />
          {finalSpec && <FinalLabel spec={finalSpec} t0={t0} layout={layout} />}
        </div>
        <div
          ref={controls}
          className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 flex items-center gap-2 opacity-0 md:bottom-6 md:right-14"
        >
          <SkipIntro className="pointer-events-auto" />
          <SoundToggle className="pointer-events-auto" />
        </div>
      </div>
      <div ref={seedLayer} aria-hidden="true" className={`${LAYER} z-[51]`}>
        <LightSeed t0={gateT0} />
      </div>
    </>
  );
}
