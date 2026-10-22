"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m, useIsPresent, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { brand } from "@/config/brand";
import { heroCopy } from "@/content/hero";
import { ease } from "@/design/tokens/motion";
import { onGateConfirmed } from "@/components/hero/intro/start";
import { preloadScene } from "@/components/hero/SceneLoader";
import { useFocusTrap } from "@/components/hero/ui/focusTrap";
import { lockPage, lockScroll } from "@/components/hero/ui/pageLock";
import { useAgeGate } from "./AgeGateProvider";

/**
 * Age question on Tinte (direction §5, gate row; the intro photos already
 * load and decode behind it). "Ja" and "Nein" are equal
 * outline pills that fill identically on hover. Intent on "Ja" (pointerenter,
 * pointerdown, Enter) starts the scene chunk; plain focus does not, since
 * "Ja" is focused on mount. The click confirms and starts the intro in the
 * same handler: it is the gesture that unlocks audio.
 *
 * Exit: the question collapses towards a point and the gate fades in
 * ~300 ms; the intro stage draws the light seed underneath. Verified
 * visitors never see it: the head script hides [data-age-gate] before paint.
 * Not shown on /impressum and /datenschutz, so the legal pages stay open.
 */
const LEGAL_PATHS = new Set(["/impressum", "/datenschutz"]);

/**
 * Instrument Serif Italic is a light, narrow cut: at the old 2rem the
 * question read thin and small next to the pills. 2.5rem (desktop 3.25rem)
 * gives it the weight of a display line; 1.1 leading holds the 0.99/0.31em
 * ascent and descent of a two-line answer without clipping.
 */
const QUESTION = "mt-6 text-center font-hero text-[2.5rem] leading-[1.1] md:text-[3.25rem]";

const pill =
  "inline-flex h-12 min-w-28 items-center justify-center rounded-full border border-paper-56 px-8 text-base font-medium text-paper transition-colors duration-300 ease-out-quart hover:bg-paper hover:text-ink";

/**
 * After "Ja" without an intro (return visit, reduced motion) nothing claims
 * focus, and the focused "Ja" leaves with the gate: land on the hero's h1.
 * With an intro the skip button already took it. Runs before the exited gate
 * leaves the DOM, so focus still inside it counts as lost.
 */
function focusHero(): void {
  const active = document.activeElement;
  if (active && active !== document.body && !active.closest("[data-age-gate]")) return;
  document.querySelector<HTMLElement>("[data-intro-focus]")?.focus({ preventScroll: true });
}

export function AgeGate() {
  const { status, confirm, deny } = useAgeGate();
  const pathname = usePathname();
  const show = status !== "verified" && !LEGAL_PATHS.has(pathname);
  // Only an answer in this page view moves focus; a stored answer hides the
  // gate after hydration and must not steal focus on load.
  const answered = useRef(false);

  const onYes = () => {
    answered.current = true;
    confirm();
    onGateConfirmed();
  };

  return (
    <AnimatePresence onExitComplete={() => answered.current && focusHero()}>
      {show && <GateScreen key="age-gate" denied={status === "denied"} onYes={onYes} onNo={deny} />}
    </AnimatePresence>
  );
}

function GateScreen({ denied, onYes, onNo }: { denied: boolean; onYes: () => void; onNo: () => void }) {
  const isPresent = useIsPresent();
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const deniedRef = useRef<HTMLHeadingElement>(null);

  // Declared before the trap; the page stays inert until the exit starts.
  useEffect(() => {
    if (!isPresent) return;
    const releasePage = lockPage("age-gate");
    const releaseScroll = lockScroll();
    return () => {
      releaseScroll();
      releasePage();
    };
  }, [isPresent]);

  useFocusTrap(rootRef, isPresent, { initialFocus: denied ? deniedRef : yesRef });

  useEffect(() => {
    if (denied) deniedRef.current?.focus();
  }, [denied]);

  const fadeOut = { duration: 0.3, ease: ease.inOutQuart };

  return (
    <m.div
      ref={rootRef}
      data-age-gate=""
      data-tone="dark"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      // No display utility on this element: the head-script rule
      // `html[data-age=verified] [data-age-gate]{display:none}` lives in the
      // base layer and would lose against a utility like `flex`.
      className="fixed inset-0 z-50 bg-ink text-paper"
      style={{ pointerEvents: isPresent ? undefined : "none" }}
      exit={{ opacity: 0, transition: { ...fadeOut, delay: reduce ? 0 : 0.06 } }}
    >
      <div className="flex h-full flex-col items-center justify-center px-6">
        <p className="font-mono text-meta uppercase text-paper-72">{brand.name}</p>

        {denied ? (
          <h2
            ref={deniedRef}
            id="age-gate-title"
            tabIndex={-1}
            className={`max-w-[20ch] outline-none ${QUESTION}`}
          >
            {heroCopy.gate.denied}
          </h2>
        ) : (
          <>
            <m.h2
              id="age-gate-title"
              className={QUESTION}
              exit={reduce ? { opacity: 0 } : { scale: 0.03, y: -10, opacity: 0 }}
              transition={fadeOut}
            >
              {heroCopy.gate.question}
            </m.h2>
            <m.div
              className="mt-10 flex gap-3"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: ease.outQuart }}
            >
              <button
                ref={yesRef}
                type="button"
                className={pill}
                onPointerEnter={() => preloadScene()}
                onPointerDown={() => preloadScene()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") preloadScene();
                }}
                onClick={onYes}
              >
                {heroCopy.gate.yes}
              </button>
              <button type="button" className={pill} onClick={onNo}>
                {heroCopy.gate.no}
              </button>
            </m.div>
          </>
        )}

        <nav
          aria-label="Rechtliches"
          className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-1 font-mono text-meta uppercase text-paper-72"
        >
          <Link href="/impressum" className="inline-flex min-h-11 items-center px-2 hover:text-paper">
            Impressum
          </Link>
          <span aria-hidden>·</span>
          <Link href="/datenschutz" className="inline-flex min-h-11 items-center px-2 hover:text-paper">
            Datenschutz
          </Link>
        </nav>
      </div>
    </m.div>
  );
}
