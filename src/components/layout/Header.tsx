"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { T } from "@/config/intro";
import { heroCopy, type SheetId } from "@/content/hero";
import { cn } from "@/lib/cn";
import { useSceneExclude } from "@/components/hero/exclusion";
import { IntroSlot } from "@/components/hero/IntroSlot";
import { easing } from "@/components/hero/intro/waapi";
import { SoundToggle } from "@/components/hero/SoundToggle";
import { useHero } from "@/components/hero/store";
import { GlossArc } from "@/components/hero/ui/GlossArc";
import { Sheet, SheetHeader } from "@/components/hero/ui/Sheet";
import { SheetLink } from "@/components/hero/ui/SheetLink";
import { useSignalWave } from "@/components/hero/ui/signalWave";
import { useCalm } from "@/components/hero/ui/useCalm";

/**
 * Header after Prinzip 33: fixed 24px from the top and never hides.
 * Wordmark left; the floating glass pill center (the ONLY backdrop-filter on
 * the page) with Sorten · Drop · Handel, its Signal pill resting on "Sorten"
 * and sliding to the open sheet (useSlidingPill: a FLIP on the pill's insets,
 * so no layout-projection bundle and no squashed round ends); "Kontakt" right as a filled Papier pill,
 * smaller than the Signal CTA. Mobile: wordmark and a "Menü" pill (tinted,
 * no blur) that opens a sheet with navigation, Kontakt and Ton.
 *
 * Wordmark: Instrument Serif Italic at 30px. The cut is light and narrow,
 * 26px (the old Fraunces size) read thinner than the 15px nav; with leading
 * 1 its caps (0.72em) sit 0.6px above the 44px row's center.
 *
 * Every visible part is a hard exclusion zone (wordmark, pill, Kontakt,
 * Menü): nothing in the scene floats behind the header.
 *
 * Works without the hero (legal pages): links then go to "/#drop" etc., and
 * tone="light" keeps it readable on Papier.
 */
type Tone = "dark" | "light";

const MENU_TITLE_ID = "menu-sheet-title";

/** Slide of the active nav pill (the former layoutId transition). */
const PILL_SLIDE_MS = 500;

/**
 * The Signal pill is rendered inside the active item, so SSR and the first
 * paint already show it in place. When the active item changes, the new
 * pill starts on the old item's box (left/right insets relative to its own
 * item) and slides to its own. Reduced motion: it jumps.
 */
function useSlidingPill(active: SheetId, calm: boolean) {
  const pills = useRef(new Map<SheetId, HTMLSpanElement>());
  const items = useRef(new Map<SheetId, HTMLLIElement>());
  const last = useRef<SheetId>(active);

  useLayoutEffect(() => {
    const previous = last.current;
    last.current = active;
    const pill = pills.current.get(active);
    const item = items.current.get(active);
    const before = items.current.get(previous);
    if (previous === active || calm || !pill || !item || !before || typeof pill.animate !== "function") return;
    const box = item.getBoundingClientRect();
    const from = before.getBoundingClientRect();
    const animation = pill.animate(
      [
        { left: `${from.left - box.left}px`, right: `${box.right - from.right}px` },
        { left: "0px", right: "0px" },
      ],
      { duration: PILL_SLIDE_MS, easing: easing.inOutQuart },
    );
    return () => animation.cancel();
  }, [active, calm]);

  return {
    item: (id: SheetId) => (el: HTMLLIElement | null) => {
      if (el) items.current.set(id, el);
      else items.current.delete(id);
    },
    pill: (id: SheetId) => (el: HTMLSpanElement | null) => {
      if (el) pills.current.set(id, el);
      else pills.current.delete(id);
    },
  };
}

export function Header({ tone = "dark" }: { tone?: Tone }) {
  const onHome = usePathname() === "/";
  const sheet = useHero((s) => s.sheet);
  const active: SheetId = sheet ?? "sorten";
  const [menuOpen, setMenuOpen] = useState(false);
  const light = tone === "light";
  const calm = useCalm();
  const sliding = useSlidingPill(active, calm);

  const wordmarkRef = useRef<HTMLAnchorElement>(null);
  const pillRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  // Hidden parts (Kontakt on mobile, Menü on desktop) measure 0 × 0 and drop out.
  useSceneExclude(wordmarkRef, "header-wordmark", "hard", 24);
  useSceneExclude(pillRef, "header-pill", "hard", 24);
  useSceneExclude(contactRef, "header-contact", "hard", 24);
  useSceneExclude(menuRef, "header-menu", "hard", 24);
  useSignalWave(pillRef);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <IntroSlot at={T.header} className="pointer-events-none fixed inset-x-0 top-6 z-40">
        <header
          data-tone={tone}
          className="relative flex items-center justify-between bg-transparent px-5 md:px-14"
        >
          <Link
            ref={wordmarkRef}
            href="/"
            className={cn(
              "pointer-events-auto inline-flex min-h-11 items-center font-hero text-[30px] leading-none",
              light ? "text-ink" : "text-paper",
            )}
          >
            {brand.name}
          </Link>

          <nav
            ref={pillRef}
            aria-label="Hauptnavigation"
            className={cn(
              "signal-wave pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/14 p-0.5 backdrop-blur-[20px] md:block",
              light ? "bg-ink/88" : "bg-ink/52",
            )}
          >
            <GlossArc />
            <ul className="flex">
              {heroCopy.nav.map((item) => {
                const isActive = active === item.sheet;
                return (
                  <li key={item.sheet} ref={sliding.item(item.sheet)} className="relative">
                    {isActive && (
                      <span
                        ref={sliding.pill(item.sheet)}
                        aria-hidden
                        className="absolute inset-y-0 left-0 right-0 rounded-full bg-signal"
                      />
                    )}
                    <SheetLink
                      sheet={item.sheet}
                      onHome={onHome}
                      aria-current={sheet === item.sheet ? "true" : undefined}
                      className={cn(
                        "relative flex h-11 items-center rounded-full px-5 text-[15px] font-medium transition-colors duration-300",
                        isActive ? "text-ink" : "text-paper hover:bg-paper/10",
                      )}
                    >
                      {item.label}
                    </SheetLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="pointer-events-auto flex items-center">
            <SheetLink
              ref={contactRef}
              sheet="handel"
              onHome={onHome}
              className={cn(
                "hidden h-11 items-center rounded-full px-5 text-[15px] font-medium md:inline-flex",
                light ? "bg-ink text-paper" : "bg-paper text-ink",
              )}
            >
              {heroCopy.cta.contact.label}
            </SheetLink>
            <button
              ref={menuRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-5 text-[15px] font-medium md:hidden",
                light ? "bg-ink text-paper" : "border border-paper/16 bg-ink/64 text-paper",
              )}
            >
              Menü
            </button>
          </div>
        </header>
      </IntroSlot>

      <Sheet open={menuOpen} onClose={closeMenu} labelledBy={MENU_TITLE_ID}>
        <SheetHeader titleId={MENU_TITLE_ID} title="Menü" onClose={closeMenu} />
        <nav aria-label="Menü" className="px-6 pb-10 pt-8 md:px-10">
          <ul className="border-t border-ink/16">
            {heroCopy.nav.map((item) => (
              <li key={item.sheet} className="border-b border-ink/16">
                <SheetLink
                  sheet={item.sheet}
                  onHome={onHome}
                  onClick={closeMenu}
                  className="flex min-h-16 items-center justify-between font-hero text-[2rem] leading-none"
                >
                  {item.label}
                  <span aria-hidden className="font-text text-xl">
                    →
                  </span>
                </SheetLink>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <SheetLink
              sheet="handel"
              onHome={onHome}
              onClick={closeMenu}
              className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-[15px] font-medium text-paper"
            >
              {heroCopy.cta.contact.label}
            </SheetLink>
            {onHome && (
              // The toggle is styled for the night scene: give it a Tinte ground on Papier.
              <div data-tone="dark" className="rounded-full bg-ink">
                <SoundToggle />
              </div>
            )}
          </div>
        </nav>
      </Sheet>
    </>
  );
}
