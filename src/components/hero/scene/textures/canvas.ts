import {
  CanvasTexture,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";
import { seededRandom } from "@/lib/seededRandom";

/**
 * Helpers for the procedural CanvasTextures (labels, produce, droplets).
 * They stand in until photographed textures exist (direction §8: atlas),
 * so they aim for photographic, muted colors, never a comic look.
 */
export type Ctx = CanvasRenderingContext2D;

export function canvas(width: number, height = width): { el: HTMLCanvasElement; ctx: Ctx } {
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  const ctx = el.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("2D canvas unavailable");
  return { el, ctx };
}

/** Albedo (sRGB) texture. */
export function colorTexture(el: HTMLCanvasElement, repeat = false): Texture {
  const t = new CanvasTexture(el);
  t.colorSpace = SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Data texture (normal, bump, roughness): no color management. */
export function dataTexture(el: HTMLCanvasElement, repeat = false): Texture {
  const t = new CanvasTexture(el);
  t.colorSpace = NoColorSpace;
  if (repeat) t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/**
 * Tangent-space normal map from a grayscale height field drawn in `el`
 * (Sobel, wraps at the edges so tiled maps stay seamless).
 */
export function heightToNormal(el: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const w = el.width;
  const h = el.height;
  const src = el.getContext("2d")!.getImageData(0, 0, w, h).data;
  const out = canvas(w, h);
  const img = out.ctx.createImageData(w, h);
  const d = img.data;
  const height = (x: number, y: number) => src[(((y + h) % h) * w + ((x + w) % w)) * 4]! / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx =
        height(x + 1, y - 1) + 2 * height(x + 1, y) + height(x + 1, y + 1) -
        (height(x - 1, y - 1) + 2 * height(x - 1, y) + height(x - 1, y + 1));
      const dy =
        height(x - 1, y + 1) + 2 * height(x, y + 1) + height(x + 1, y + 1) -
        (height(x - 1, y - 1) + 2 * height(x, y - 1) + height(x + 1, y - 1));
      let nx = -dx * strength;
      let ny = dy * strength;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;
      const i = (y * w + x) * 4;
      d[i] = Math.round((nx * 0.5 + 0.5) * 255);
      d[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      d[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      d[i + 3] = 255;
    }
  }
  out.ctx.putImageData(img, 0, 0);
  return out.el;
}

/** Seeded fine grain over the whole canvas (paper, pulp, metal). */
export function speckle(ctx: Ctx, w: number, h: number, seed: number, count: number, color: string, size: [number, number], alpha: [number, number]): void {
  const rand = seededRandom(seed);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = alpha[0] + rand() * (alpha[1] - alpha[0]);
    const s = size[0] + rand() * (size[1] - size[0]);
    ctx.beginPath();
    ctx.ellipse(rand() * w, rand() * h, s, s * (0.6 + rand() * 0.4), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Lets the browser paint between texture jobs (no long tasks during the bubbles). */
export function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    const sched = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (sched?.yield) void sched.yield().then(resolve);
    else window.setTimeout(resolve, 0);
  });
}
