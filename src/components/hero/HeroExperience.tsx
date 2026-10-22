"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAgeGate } from "@/components/age-gate/AgeGateProvider";
import { DIRECT, T } from "@/config/intro";
import type { SheetId } from "@/content/hero";
import { GrainOverlay } from "./GrainOverlay";
import { InfoSheet } from "./InfoSheet";
import { IntroController } from "./intro/IntroController";
import { IntroStage } from "./intro/IntroStage";
import { heroStore } from "./store";
import { useIntroReveal } from "./ui/introReveal";
import { syncPageLock } from "./ui/pageLock";
import { pageRef } from "./ui/pageRef";
import { SHEET_SYNC_EVENT, sheetFromHash } from "./ui/sheets";

/**
 * Client frame of the hero page. All shared state lives in the module store
 * (store.ts), so this only mounts the layers and owns two pieces of glue:
 *
 * - #page: everything the gate and the sheets make inert; also the canvas
 *   event source (pointer moves over the copy still reach the scene).
 * - Hash routing: #sorten, #drop, #handel open the matching sheet. A deep
 *   link waits until the gate is answered and the intro has come to rest.
 *
 * Fixed layers outside #page, bottom to top: intro stage (45), grain (46),
 * sheets (47, portaled); the age gate (50) lives in the root layout.
 */
export function HeroExperience({ children }: { children: ReactNode }) {
  const { status } = useAgeGate();
  const settled = useIntroReveal(T.rest, DIRECT.rest) !== "hidden";
  const ready = status === "verified" && settled;
  const [requested, setRequested] = useState<SheetId | null>(null);

  useEffect(() => {
    syncPageLock();
  }, []);

  useEffect(() => {
    const sync = () => setRequested(sheetFromHash(window.location.hash));
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener(SHEET_SYNC_EVENT, sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener(SHEET_SYNC_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    heroStore.set({ sheet: ready ? requested : null });
  }, [ready, requested]);

  return (
    <>
      <IntroController />
      <div id="page" ref={pageRef}>
        {children}
      </div>
      <IntroStage />
      <GrainOverlay />
      <InfoSheet />
    </>
  );
}
