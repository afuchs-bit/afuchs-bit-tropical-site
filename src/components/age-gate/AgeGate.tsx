"use client";

import { useEffect, useRef } from "react";
import { brand } from "@/config/brand";
import { useAgeGate } from "./AgeGateProvider";

/**
 * Black screen with the age question (hero brief, 0,0 s). Functional
 * skeleton only: grain, type and the hand-off into the intro are built in the
 * hero round. Keep the markup: `role="dialog"` + focus management must survive
 * the redesign.
 */
export function AgeGate() {
  const { status, confirm, deny } = useAgeGate();
  const yesRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (status === "pending") yesRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (status === "verified") return;
    const { style } = document.documentElement;
    const previous = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = previous;
    };
  }, [status]);

  if (status === "verified") return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-depth text-ink"
    >
      <div className="flex max-w-sm flex-col items-center gap-8 px-6 text-center">
        <p className="mono-label">{brand.name}</p>

        {status === "pending" ? (
          <>
            <h1 id="age-gate-title" className="font-display text-2xl">
              Bist du mindestens 18?
            </h1>
            <div className="flex gap-3">
              <button
                ref={yesRef}
                type="button"
                onClick={confirm}
                className="min-h-12 rounded-pill bg-ink px-8 text-sm font-medium text-depth hover:bg-signal"
              >
                Ja
              </button>
              <button
                type="button"
                onClick={deny}
                className="min-h-12 rounded-pill border border-ink-2/40 px-8 text-sm hover:border-ink"
              >
                Nein
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 id="age-gate-title" className="font-display text-2xl">
              Bis später.
            </h1>
            <p className="text-sm text-ink-2">
              Diese Seite richtet sich an Erwachsene ab 18 Jahren.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
