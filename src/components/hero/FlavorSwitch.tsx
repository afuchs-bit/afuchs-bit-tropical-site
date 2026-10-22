"use client";

import { m } from "framer-motion";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { flavors, getFlavor, type Flavor, type FlavorSlug } from "@/content/flavors";
import { ease } from "@/design/tokens/motion";
import { cn } from "@/lib/cn";
import { useSceneExclude } from "./exclusion";
import { FLAVOR_OPTION_ATTR, switchFlavor } from "./flavor/switchFlavor";
import { MiniCan } from "./MiniCan";
import { heroStore, useHero } from "./store";
import { GlossArc } from "./ui/GlossArc";
import { useSignalWave } from "./ui/signalWave";
import { useCalm } from "./ui/useCalm";

/**
 * Flavor switch as a radiogroup (no arrow row): cards top right on desktop,
 * chips in the rest zone on mobile. Roving tabindex, ←/→ switch and move
 * focus, Space/Enter select. The switch starts at the click: the card's
 * bubble (0–0.25 s) and the light wave (from 0.15 s) run on one timeline,
 * so switchFlavor() gets the card center as the wave origin right away.
 */
function centerOf(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function useRadioGroup(onSelect: (flavor: Flavor, el: HTMLElement) => void) {
  const active = useHero((s) => s.flavor);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const nextIndex = (index + step + flavors.length) % flavors.length;
    const el = refs.current[nextIndex];
    const next = flavors[nextIndex];
    if (!el || !next) return;
    el.focus();
    onSelect(next, el);
  };

  const bind = (index: number) => ({
    ref: (el: HTMLButtonElement | null) => {
      refs.current[index] = el;
    },
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event, index),
  });

  return { active, bind };
}

/** Desktop and tablet: two cards, 128 × 160 (tablet 104 wide). */
export function FlavorCards({ className }: { className?: string }) {
  const groupRef = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const [bubble, setBubble] = useState<{ slug: FlavorSlug; key: number } | null>(null);
  const noteId = useId();

  useSceneExclude(groupRef, "flavor-cards", "hard", 32);
  useSignalWave(groupRef);

  const select = (flavor: Flavor, el: HTMLElement) => {
    if (heroStore.get().flavor === flavor.slug) return;
    if (!calm) setBubble({ slug: flavor.slug, key: performance.now() });
    switchFlavor(flavor.slug, centerOf(el));
  };
  const { active, bind } = useRadioGroup(select);

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Sorte wählen"
      className={cn("signal-wave flex gap-3", className)}
    >
      {flavors.map((flavor, index) => {
        const checked = flavor.slug === active;
        return (
          <button
            key={flavor.slug}
            {...bind(index)}
            type="button"
            role="radio"
            aria-checked={checked}
            {...{ [FLAVOR_OPTION_ATTR]: flavor.slug }}
            aria-describedby={`${noteId}-${flavor.slug}`}
            tabIndex={checked ? 0 : -1}
            onClick={(event) => select(flavor, event.currentTarget)}
            className={cn(
              "group relative flex h-[148px] w-[104px] flex-col justify-between rounded-card border bg-ink/64 p-3 text-left lg:h-40 lg:w-32",
              checked
                ? "border-signal text-paper"
                : "border-paper/16 text-paper-72 transition-[color] duration-300 hover:text-paper focus-visible:text-paper",
            )}
          >
            <GlossArc />
            {checked && (
              <span
                aria-hidden
                className="absolute left-[30%] top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_10px_2px_var(--signal)]"
              />
            )}
            {bubble?.slug === flavor.slug && (
              <m.span
                key={bubble.key}
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 -ml-[5px] -mt-[5px] size-2.5 rounded-full border border-paper/60 bg-[radial-gradient(circle_at_35%_30%,color-mix(in_oklab,var(--paper)_70%,transparent),transparent_62%)]"
                initial={{ y: 0, scale: 0.4, opacity: 0.9 }}
                animate={{ y: -22, scale: [0.4, 1, 1.4], opacity: [0.9, 1, 0] }}
                transition={{ duration: 0.25, ease: ease.outExpo, times: [0, 0.7, 1] }}
              />
            )}
            <MiniCan
              flavor={flavor}
              className={cn(
                "h-10 w-auto rotate-9 transition-[filter,opacity] duration-300 lg:h-12",
                !checked &&
                  "opacity-75 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0",
              )}
            />
            <span className="block">
              <span className="block text-[15px] leading-tight font-medium">{flavor.name}</span>
              <span
                id={`${noteId}-${flavor.slug}`}
                className="mt-1 block font-mono text-meta uppercase text-paper-72"
              >
                {flavor.note.split(" · ").map((word, i) => (
                  <span key={word} className="block">
                    {i > 0 && <span className="sr-only">, </span>}
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Mobile: two 44px chips in the rest zone; the active one carries the Signal dot. */
export function FlavorChips({ className }: { className?: string }) {
  const groupRef = useRef<HTMLDivElement>(null);
  useSignalWave(groupRef);

  const select = (flavor: Flavor, el: HTMLElement) => {
    if (heroStore.get().flavor === flavor.slug) return;
    switchFlavor(flavor.slug, centerOf(el));
  };
  const { active, bind } = useRadioGroup(select);

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Sorte wählen"
      className={cn("signal-wave flex flex-wrap gap-2", className)}
    >
      {flavors.map((flavor, index) => {
        const checked = flavor.slug === active;
        return (
          <button
            key={flavor.slug}
            {...bind(index)}
            type="button"
            role="radio"
            aria-checked={checked}
            {...{ [FLAVOR_OPTION_ATTR]: flavor.slug }}
            tabIndex={checked ? 0 : -1}
            onClick={(event) => select(flavor, event.currentTarget)}
            className={cn(
              "inline-flex h-11 items-center gap-2.5 rounded-full border border-paper/16 bg-ink/40 pl-4 pr-5 text-[15px] font-medium",
              checked ? "text-paper" : "text-paper-72",
            )}
          >
            <span aria-hidden className={cn("size-2 rounded-full", checked ? "bg-signal" : "bg-paper/40")} />
            {flavor.name}
          </button>
        );
      })}
    </div>
  );
}

/** One polite live region for both variants: "Sorte: Limette Minze". */
export function FlavorAnnouncer() {
  const flavor = useHero((s) => s.flavor);
  const switched = useHero((s) => s.switchedAt !== null);
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {switched ? `Sorte: ${getFlavor(flavor).name}` : ""}
    </p>
  );
}
