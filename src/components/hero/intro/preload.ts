"use client";

import { bubbles, type BubbleId } from "@/config/intro";
import { introManifest } from "@/config/intro-manifest";

/**
 * Intro photos, fetched during the age gate and decoded (img.decode()) before
 * they are shown. Only slugs listed in the generated manifest are requested
 * (no 404 probes): the AVIF where the browser decodes AVIF, else the JPG. A
 * bubble whose photo is not decoded in time renders as a glass bubble, never
 * as an empty pop-in.
 */

/** 1×1 AVIF (sharp, 280 B). Decodes only where AVIF is supported. */
const AVIF_PROBE =
  "data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAAA+gABAAAAAAAAAB4AAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAAA5waXRtAAAAAAABAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAmbWRhdBIACgc4AAbQENBpMhEdgmLE4AAWAAAAkDWOPH6TwA==";

const decoded = new Map<BubbleId, string>();
/** Keeps the decoded images referenced so the browser keeps them in memory. */
const kept = new Map<BubbleId, HTMLImageElement>();
const listeners = new Set<() => void>();
let running: Promise<void> | null = null;
/** Every photo decoded or failed (or nothing to load). */
let settled = false;
let priority: "low" | "high" = "low";

/** Decoded URL for a bubble, or null (→ glass bubble). */
export function getBubbleImage(id: BubbleId): string | null {
  return decoded.get(id) ?? null;
}

/** True once the preload has nothing left to wait for. */
export function introImagesSettled(): boolean {
  return settled;
}

export function onIntroImagesChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function supportsAvif(): Promise<boolean> {
  const probe = new Image();
  probe.src = AVIF_PROBE;
  return probe.decode().then(
    () => true,
    () => false,
  );
}

function saveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

async function load(id: BubbleId, url: string): Promise<void> {
  const img = new Image();
  img.decoding = "async";
  img.fetchPriority = priority;
  img.src = url;
  try {
    await img.decode();
  } catch {
    return; // stays a glass bubble
  }
  kept.set(id, img);
  decoded.set(id, url);
  listeners.forEach((l) => l());
}

function finish(): void {
  settled = true;
  listeners.forEach((l) => l());
}

/**
 * Idempotent. Started at mount during the gate (idle) and again, with high
 * priority, on the "Ja" click if it had not started yet. All requests go out
 * at once in bubble order (≈ 172 KB in total): the timeline waits for all of
 * them, so one round trip beats seven in a row.
 */
export function preloadIntroImages(options: { urgent?: boolean } = {}): Promise<void> {
  if (options.urgent) priority = "high";
  if (running) return running;
  if (typeof window === "undefined") return Promise.resolve();

  const queue = bubbles.flatMap((b) => {
    const image = introManifest[b.id];
    return image ? [{ id: b.id, image }] : [];
  });
  if (queue.length === 0 || saveData()) {
    finish();
    running = Promise.resolve();
    return running;
  }

  running = supportsAvif()
    .then((avif) => Promise.all(queue.map(({ id, image }) => load(id, avif ? image.avif : image.jpg))))
    .then(finish, finish);
  return running;
}
