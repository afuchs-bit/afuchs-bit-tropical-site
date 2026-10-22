"use client";

import type { SheetId } from "@/content/hero";
import { heroStore } from "../store";

/**
 * Sheets are addressed by hash (#sorten, #drop, #handel): links work without
 * JS, from the legal pages ("/#drop") and as deep links. HeroExperience maps
 * the hash onto heroStore.sheet; closing clears the hash again.
 */
export const SHEET_IDS: readonly SheetId[] = ["sorten", "drop", "handel"];

/** Fired after closeSheet() rewrote the URL (replaceState fires no hashchange). */
export const SHEET_SYNC_EVENT = "hero:sheet-sync";

export function sheetFromHash(hash: string): SheetId | null {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  return (SHEET_IDS as readonly string[]).includes(id) ? (id as SheetId) : null;
}

export function closeSheet(): void {
  heroStore.set({ sheet: null });
  const { hash, pathname, search } = window.location;
  if (hash) window.history.replaceState(null, "", pathname + search);
  window.dispatchEvent(new Event(SHEET_SYNC_EVENT));
}
