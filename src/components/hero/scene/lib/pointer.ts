/**
 * Pointer over the hero (the event source wraps the DOM copy layer, the
 * canvas itself has pointer-events: none). Only a fine, hovering pointer
 * steers the scene; touch devices get the slow sway only (Prinzip 31).
 */
export const pointer = {
  /** Viewport CSS px. */
  x: 0,
  y: 0,
  /** A mouse/pen is currently over the hero. */
  inside: false,
  /** (hover: hover) and (pointer: fine). */
  fine: false,
};

export function attachPointer(source: HTMLElement): () => void {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  const syncFine = () => {
    pointer.fine = mq.matches;
    if (!pointer.fine) pointer.inside = false;
  };
  syncFine();
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.inside = pointer.fine;
  };
  const onLeave = () => {
    pointer.inside = false;
  };
  mq.addEventListener("change", syncFine);
  source.addEventListener("pointermove", onMove, { passive: true });
  source.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);
  return () => {
    mq.removeEventListener("change", syncFine);
    source.removeEventListener("pointermove", onMove);
    source.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("blur", onLeave);
    pointer.inside = false;
  };
}
