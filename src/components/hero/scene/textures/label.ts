import { RepeatWrapping, SRGBColorSpace, TextureLoader, type Texture, type WebGLRenderer } from "three";
import { brand } from "@/config/brand";
import type { CanPreset } from "@/config/can";
import type { Flavor } from "@/content/flavors";
import { canvas, colorTexture, speckle } from "./canvas";

/**
 * Can label. The uploaded design (flavor.label, WebP from
 * scripts/encode-label.mjs) once it exists; until then a procedural stand-in:
 * the brand name in the display face (Instrument Serif Italic, the single
 * 400 italic cut next/font loads as --nf-display) on flavor.scene.labelFallback,
 * with a thin amber light band (direction §2, §4).
 * Layout follows the label spec: brand and flavor centered at u = 0.5
 * (faces the camera), "330 ML" on the back around the seam (u = 0 / 1).
 * No alcohol content on the label.
 */
const FONT_TIMEOUT = 1500;
/** The display face exists in one cut only; asking for another weight would synthesize one. */
const DISPLAY_STYLE = "italic 400";
/**
 * Widest a front line may be, as a share of the label width (≈ 115° of the
 * can): beyond that it bends out of view. Longer names shrink to fit.
 */
const FRONT_MAX = 0.32;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

async function loadFont(spec: string): Promise<void> {
  if (!document.fonts?.load) return;
  await Promise.race([
    document.fonts.load(spec).then(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, FONT_TIMEOUT)),
  ]);
}

function withAlpha(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alpha})`;
}

function spaced(ctx: CanvasRenderingContext2D, em: number, size: number): void {
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${Math.round(em * size)}px`;
}

/** Sets `font` at `size`, shrunk until `text` fits `maxWidth` (with the current letter spacing). */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: (size: number) => string,
  size: number,
  em: number,
  maxWidth: number,
): number {
  ctx.font = font(size);
  spaced(ctx, em, size);
  const width = ctx.measureText(text).width;
  if (width <= maxWidth) return size;
  const fitted = Math.max(1, Math.floor((size * maxWidth) / width));
  ctx.font = font(fitted);
  spaced(ctx, em, fitted);
  return fitted;
}

/** Draws text centered on u = x / width, repeated across the seam when it straddles it. */
function seamText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number): void {
  ctx.fillText(text, x, y);
  ctx.fillText(text, x - width, y);
  ctx.fillText(text, x + width, y);
}

export async function fallbackLabel(flavor: Flavor, preset: CanPreset): Promise<Texture> {
  const [w, h] = preset.labelPx;
  const display = cssVar("--nf-display") || "serif";
  const mono = cssVar("--nf-mono") || "monospace";
  const brandSize = Math.round(h * 0.12);
  const monoSize = Math.round(h * 0.032);
  const displayFont = (size: number) => `${DISPLAY_STYLE} ${size}px ${display}`;
  const monoFont = (size: number) => `400 ${size}px ${mono}`;
  await Promise.all([loadFont(displayFont(brandSize)), loadFont(monoFont(monoSize))]);

  const { el, ctx } = canvas(w, h);
  const { from, to, ink } = flavor.scene.labelFallback;
  const signal = flavor.palette.signal;

  // Tiefe, darker toward the base like a printed gradient.
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, from);
  bg.addColorStop(1, to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Print grain and faint vertical ironing lines of the can body.
  speckle(ctx, w, h, flavor.seed, 9000, ink, [0.6, 1.4], [0.015, 0.05]);
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = ink;
  for (let x = 0; x < w; x += 3) {
    ctx.lineWidth = (x * 7919) % 5 === 0 ? 1.2 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  ctx.restore();

  // Light band: a thin line of the amber light around the whole can.
  const bandY = Math.round(h * 0.64);
  const glow = ctx.createLinearGradient(0, bandY - h * 0.05, 0, bandY + h * 0.05);
  glow.addColorStop(0, withAlpha(signal, 0));
  glow.addColorStop(0.5, withAlpha(signal, 0.22));
  glow.addColorStop(1, withAlpha(signal, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, bandY - h * 0.05, w, h * 0.1);
  ctx.fillStyle = withAlpha(signal, 0.92);
  ctx.fillRect(0, bandY - 2, w, 4);

  // Hairlines at the top and base of the print.
  ctx.fillStyle = withAlpha(ink, 0.28);
  ctx.fillRect(0, Math.round(h * 0.035), w, 2);
  ctx.fillRect(0, Math.round(h * 0.965), w, 2);

  // Front, centered on u = 0.5.
  const cx = w / 2;
  const maxWidth = w * FRONT_MAX;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = ink;
  fitFont(ctx, brand.name, displayFont, brandSize, -0.02, maxWidth);
  ctx.fillText(brand.name, cx, Math.round(h * 0.44));

  const name = flavor.name.toUpperCase();
  fitFont(ctx, name, monoFont, monoSize, 0.16, maxWidth);
  ctx.fillStyle = withAlpha(ink, 0.86);
  ctx.fillText(name, cx, Math.round(h * 0.53));
  const note = flavor.note.toUpperCase();
  fitFont(ctx, note, monoFont, Math.round(monoSize * 0.7), 0.14, maxWidth);
  ctx.fillStyle = withAlpha(ink, 0.72);
  ctx.fillText(note, cx, Math.round(h * 0.75));

  // Back, around the seam.
  ctx.font = monoFont(monoSize);
  spaced(ctx, 0.16, monoSize);
  ctx.fillStyle = withAlpha(ink, 0.86);
  seamText(ctx, `${brand.canSizeMl} ML`, 0, Math.round(h * 0.53), w);
  ctx.fillStyle = withAlpha(ink, 0.6);
  fitFont(ctx, brand.name, monoFont, monoSize, 0.16, maxWidth);
  seamText(ctx, brand.name, 0, Math.round(h * 0.75), w);

  const tex = colorTexture(el);
  tex.wrapS = RepeatWrapping;
  return tex;
}

/** The uploaded label, or the stand-in if it is missing or fails to load. */
export async function loadLabel(flavor: Flavor, preset: CanPreset, gl: WebGLRenderer): Promise<Texture> {
  let tex: Texture | null = null;
  if (flavor.label) {
    try {
      tex = await new TextureLoader().loadAsync(flavor.label);
      tex.colorSpace = SRGBColorSpace;
    } catch {
      tex = null;
    }
  }
  tex ??= await fallbackLabel(flavor, preset);
  tex.wrapS = RepeatWrapping;
  tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  return tex;
}
