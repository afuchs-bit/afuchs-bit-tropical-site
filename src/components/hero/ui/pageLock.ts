"use client";

/**
 * Modal plumbing shared by the age gate and the sheets: while any of them is
 * open, the #page wrapper is inert (no focus, no clicks, hidden from
 * assistive tech) and the document does not scroll. Keyed and counted, so
 * the gate and a sheet never undo each other's lock.
 */
const inertKeys = new Set<string>();
let scrollLocks = 0;
let savedOverflow = "";

function applyInert(): void {
  document.getElementById("page")?.toggleAttribute("inert", inertKeys.size > 0);
}

export function lockPage(key: string): () => void {
  inertKeys.add(key);
  applyInert();
  return () => {
    inertKeys.delete(key);
    applyInert();
  };
}

/** Re-applies the current lock to a freshly mounted #page (client navigation). */
export function syncPageLock(): void {
  applyInert();
}

export function lockScroll(): () => void {
  const root = document.documentElement;
  if (scrollLocks === 0) {
    savedOverflow = root.style.overflow;
    root.style.overflow = "hidden";
  }
  scrollLocks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLocks -= 1;
    if (scrollLocks === 0) root.style.overflow = savedOverflow;
  };
}
