import type { Texture } from "three";
import { seededRandom } from "@/lib/seededRandom";
import { canvas, colorTexture, dataTexture, heightToNormal, speckle, type Ctx } from "./canvas";

/**
 * Procedural produce textures: photographic, muted colors (yellow passion
 * fruit, deep golden mango, ripe pineapple, real lime rind), never candy or
 * comic colors (direction §9). Replace with the photo atlas once it exists.
 * Each function is one short job; the loader yields between them.
 */
const TAU = Math.PI * 2;

/** Lime wheel cut face: rind, white pith, 10 translucent segments, pale core. */
export function limeFace(): Texture {
  const s = 512;
  const { el, ctx } = canvas(s);
  const c = s / 2;
  const R = s / 2;
  const rand = seededRandom(31);

  ctx.fillStyle = "#3C6B20";
  ctx.beginPath();
  ctx.arc(c, c, R, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#5A8F2E";
  ctx.beginPath();
  ctx.arc(c, c, R * 0.955, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#E3E8C4";
  ctx.beginPath();
  ctx.arc(c, c, R * 0.92, 0, TAU);
  ctx.fill();

  const segments = 10;
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * TAU + 0.035;
    const a1 = ((i + 1) / segments) * TAU - 0.035;
    const g = ctx.createRadialGradient(c, c, R * 0.1, c, c, R * 0.86);
    g.addColorStop(0, "#C9D77E");
    g.addColorStop(0.55, "#A9C44E");
    g.addColorStop(1, "#8FB13C");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos((a0 + a1) / 2) * R * 0.11, c + Math.sin((a0 + a1) / 2) * R * 0.11);
    ctx.arc(c, c, R * 0.86, a0, a1);
    ctx.closePath();
    ctx.fill();
    // Juice vesicles: fine radial teardrops.
    ctx.save();
    ctx.clip();
    for (let k = 0; k < 70; k++) {
      const a = a0 + rand() * (a1 - a0);
      const r = R * (0.18 + rand() * 0.66);
      ctx.globalAlpha = 0.18 + rand() * 0.25;
      ctx.strokeStyle = rand() > 0.5 ? "#E4EDB0" : "#7FA22F";
      ctx.lineWidth = 1 + rand() * 2;
      ctx.beginPath();
      ctx.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r);
      ctx.lineTo(c + Math.cos(a) * (r + R * 0.07), c + Math.sin(a) * (r + R * 0.07));
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.fillStyle = "#EDF0D6";
  ctx.beginPath();
  ctx.arc(c, c, R * 0.1, 0, TAU);
  ctx.fill();
  speckle(ctx, s, s, 32, 500, "#F4F7E2", [0.6, 1.6], [0.08, 0.25]);
  return colorTexture(el);
}

/** Lime rind band for the wheel's edge (tiles around the cylinder side). */
export function limeRind(): Texture {
  const { el, ctx } = canvas(256, 32);
  ctx.fillStyle = "#4A7F27";
  ctx.fillRect(0, 0, 256, 32);
  speckle(ctx, 256, 32, 33, 400, "#2F5A18", [0.5, 1.4], [0.2, 0.5]);
  speckle(ctx, 256, 32, 34, 200, "#7DA746", [0.5, 1.2], [0.15, 0.35]);
  return colorTexture(el, true);
}

/**
 * Spearmint leaf with alpha (serrated outline, used with alphaTest) and a
 * normal map for the sunken veins. Midrib along v, base at v = 0.
 */
export function mintLeaf(): { map: Texture; normal: Texture } {
  const w = 256;
  const h = 512;
  const { el, ctx } = canvas(w, h);
  const height = canvas(w, h);
  const outline = new Path2D();
  const steps = 160;
  const half = (t: number) => {
    const body = Math.sin(Math.PI * Math.pow(t, 0.8)) * (1 - 0.18 * t);
    const tooth = t > 0.12 && t < 0.97 ? 0.045 * Math.abs(((t * 22) % 1) - 0.5) : 0;
    return Math.max(0, body * 0.44 - tooth);
  };
  const pt = (t: number, side: number): [number, number] => [w / 2 + side * half(t) * w, h * (0.97 - t * 0.94)];
  outline.moveTo(...pt(0, 1));
  for (let i = 1; i <= steps; i++) outline.lineTo(...pt(i / steps, 1));
  for (let i = steps; i >= 0; i--) outline.lineTo(...pt(i / steps, -1));
  outline.closePath();

  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "#2C5A2A");
  g.addColorStop(0.5, "#3E7A37");
  g.addColorStop(1, "#2C5A2A");
  ctx.fillStyle = g;
  ctx.fill(outline);
  ctx.save();
  ctx.clip(outline);
  speckle(ctx, w, h, 41, 900, "#4F8C45", [0.6, 1.8], [0.1, 0.3]);

  height.ctx.fillStyle = "#808080";
  height.ctx.fillRect(0, 0, w, h);
  const veins = (c: Ctx, color: string, alpha: number) => {
    c.save();
    c.strokeStyle = color;
    c.globalAlpha = alpha;
    c.lineCap = "round";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(w / 2, h * 0.99);
    c.lineTo(w / 2, h * 0.05);
    c.stroke();
    c.lineWidth = 2.2;
    for (let i = 0; i < 9; i++) {
      const t = 0.1 + i * 0.09;
      const y = h * (0.97 - t * 0.94);
      for (const side of [1, -1]) {
        c.beginPath();
        c.moveTo(w / 2, y);
        c.quadraticCurveTo(w / 2 + side * half(t) * w * 0.5, y - h * 0.05, w / 2 + side * half(t + 0.06) * w * 0.86, y - h * 0.1);
        c.stroke();
      }
    }
    c.restore();
  };
  veins(ctx, "#86B276", 0.55);
  ctx.restore();
  veins(height.ctx, "#303030", 1);

  return { map: colorTexture(el), normal: dataTexture(heightToNormal(height.el, 2.2)) };
}

/** Yellow passion fruit cut face: thin skin, cream pith, golden pulp with black seeds. */
export function passionFace(): Texture {
  const s = 512;
  const { el, ctx } = canvas(s);
  const c = s / 2;
  const R = s / 2;
  const rand = seededRandom(51);
  ctx.fillStyle = "#C99A1E";
  ctx.beginPath();
  ctx.arc(c, c, R, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#EAD9A6";
  ctx.beginPath();
  ctx.arc(c, c, R * 0.95, 0, TAU);
  ctx.fill();
  const pulp = ctx.createRadialGradient(c, c, 0, c, c, R * 0.87);
  pulp.addColorStop(0, "#E59A06");
  pulp.addColorStop(0.7, "#EEAA0C");
  pulp.addColorStop(1, "#D98A04");
  ctx.fillStyle = pulp;
  ctx.beginPath();
  ctx.arc(c, c, R * 0.87, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 70; i++) {
    const a = rand() * TAU;
    const r = Math.sqrt(rand()) * R * 0.78;
    const x = c + Math.cos(a) * r;
    const y = c + Math.sin(a) * r;
    const sr = 7 + rand() * 6;
    const aril = ctx.createRadialGradient(x, y, sr * 0.6, x, y, sr * 2);
    aril.addColorStop(0, "rgb(246 196 82 / 0.85)");
    aril.addColorStop(1, "rgb(246 196 82 / 0)");
    ctx.fillStyle = aril;
    ctx.beginPath();
    ctx.arc(x, y, sr * 2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = rand() > 0.3 ? "#21150B" : "#3A2614";
    ctx.beginPath();
    ctx.ellipse(x, y, sr, sr * 0.68, rand() * Math.PI, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgb(255 236 200 / 0.35)";
    ctx.beginPath();
    ctx.ellipse(x - sr * 0.3, y - sr * 0.25, sr * 0.3, sr * 0.18, 0, 0, TAU);
    ctx.fill();
  }
  return colorTexture(el);
}

/** Yellow passion fruit skin: albedo and a dimpled bump map (sphere UVs). */
export function passionSkin(): { map: Texture; bump: Texture } {
  const w = 512;
  const h = 256;
  const { el, ctx } = canvas(w, h);
  const bump = canvas(w, h);
  ctx.fillStyle = "#E2B312";
  ctx.fillRect(0, 0, w, h);
  speckle(ctx, w, h, 52, 1800, "#B88A0C", [1, 3.5], [0.15, 0.4]);
  speckle(ctx, w, h, 53, 900, "#F2D25A", [0.8, 2.2], [0.15, 0.35]);
  speckle(ctx, w, h, 54, 60, "#8F6A1A", [3, 9], [0.08, 0.2]);
  bump.ctx.fillStyle = "#909090";
  bump.ctx.fillRect(0, 0, w, h);
  speckle(bump.ctx, w, h, 55, 2600, "#5A5A5A", [1, 3], [0.25, 0.6]);
  return { map: colorTexture(el, true), bump: dataTexture(bump.el, true) };
}

/** Mango flesh: deep golden orange with fine fibers. */
export function mangoFlesh(): { map: Texture; normal: Texture } {
  const s = 256;
  const { el, ctx } = canvas(s);
  const height = canvas(s);
  const rand = seededRandom(61);
  ctx.fillStyle = "#EE9408";
  ctx.fillRect(0, 0, s, s);
  height.ctx.fillStyle = "#808080";
  height.ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 260; i++) {
    const x = rand() * s;
    const y = rand() * s;
    const len = 20 + rand() * 50;
    const a = -0.25 + rand() * 0.5;
    ctx.strokeStyle = rand() > 0.5 ? "rgb(250 176 52 / 0.35)" : "rgb(200 108 8 / 0.3)";
    ctx.lineWidth = 1 + rand() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
    height.ctx.strokeStyle = rand() > 0.5 ? "#A0A0A0" : "#606060";
    height.ctx.lineWidth = 1.2;
    height.ctx.beginPath();
    height.ctx.moveTo(x, y);
    height.ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    height.ctx.stroke();
  }
  return { map: colorTexture(el, true), normal: dataTexture(heightToNormal(height.el, 1.4), true) };
}

/**
 * Pineapple cross-section in shape space (center = core): radial fibers,
 * pale core, golden flesh, eyes and the brown-green rind at the edge.
 */
export function pineappleFace(): Texture {
  const s = 512;
  const { el, ctx } = canvas(s);
  const c = s / 2;
  const R = s / 2;
  const rand = seededRandom(71);
  ctx.fillStyle = "#5E4F22";
  ctx.beginPath();
  ctx.arc(c, c, R, 0, TAU);
  ctx.fill();
  const flesh = ctx.createRadialGradient(c, c, 0, c, c, R * 0.9);
  flesh.addColorStop(0, "#F1DD9A");
  flesh.addColorStop(0.22, "#EFD27A");
  flesh.addColorStop(0.3, "#E9BE45");
  flesh.addColorStop(1, "#E2AE34");
  ctx.fillStyle = flesh;
  ctx.beginPath();
  ctx.arc(c, c, R * 0.9, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 520; i++) {
    const a = rand() * TAU;
    const r0 = R * (0.05 + rand() * 0.3);
    const r1 = r0 + R * (0.2 + rand() * 0.45);
    ctx.strokeStyle = rand() > 0.5 ? "rgb(250 226 140 / 0.35)" : "rgb(196 140 28 / 0.28)";
    ctx.lineWidth = 0.8 + rand() * 1.4;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
    ctx.lineTo(c + Math.cos(a) * Math.min(r1, R * 0.88), c + Math.sin(a) * Math.min(r1, R * 0.88));
    ctx.stroke();
  }
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * TAU + rand() * 0.05;
    const r = R * (0.84 + rand() * 0.03);
    ctx.fillStyle = "#6E5418";
    ctx.beginPath();
    ctx.ellipse(c + Math.cos(a) * r, c + Math.sin(a) * r, 5, 3, a, 0, TAU);
    ctx.fill();
  }
  return colorTexture(el);
}

/** Ice: clear body with milky cracks and trapped air (RGBA over a low opacity). */
export function iceVeil(): { map: Texture; bump: Texture } {
  const s = 256;
  const { el, ctx } = canvas(s);
  const bump = canvas(s);
  const rand = seededRandom(81);
  ctx.fillStyle = "rgb(236 244 255 / 0.55)";
  ctx.fillRect(0, 0, s, s);
  const cloud = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s * 0.5);
  cloud.addColorStop(0, "rgb(250 252 255 / 0.55)");
  cloud.addColorStop(1, "rgb(250 252 255 / 0)");
  ctx.fillStyle = cloud;
  ctx.fillRect(0, 0, s, s);
  bump.ctx.fillStyle = "#808080";
  bump.ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 9; i++) {
    let x = rand() * s;
    let y = rand() * s;
    ctx.strokeStyle = "rgb(255 255 255 / 0.7)";
    bump.ctx.strokeStyle = "#B0B0B0";
    ctx.lineWidth = bump.ctx.lineWidth = 1 + rand();
    ctx.beginPath();
    bump.ctx.beginPath();
    ctx.moveTo(x, y);
    bump.ctx.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += (rand() - 0.5) * 60;
      y += (rand() - 0.5) * 60;
      ctx.lineTo(x, y);
      bump.ctx.lineTo(x, y);
    }
    ctx.stroke();
    bump.ctx.stroke();
  }
  speckle(ctx, s, s, 82, 90, "rgb(255 255 255)", [0.8, 2.4], [0.3, 0.7]);
  return { map: colorTexture(el, true), bump: dataTexture(bump.el, true) };
}

/**
 * Condensation for Limette Minze (direction §4): fine droplets of mixed size
 * as a tiling normal map for the can's clearcoat.
 */
export function condensation(): Texture {
  const s = 512;
  const { el, ctx } = canvas(s);
  const rand = seededRandom(91);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, s, s);
  ctx.globalCompositeOperation = "lighten";
  // Copies across the edges only where a drop overlaps them (seamless tile).
  const wrap = (v: number, r: number) => (v < r ? [0, s] : v > s - r ? [0, -s] : [0]);
  const drop = (x: number, y: number, r: number, stretch: number) => {
    for (const ox of wrap(x, r)) {
      for (const oy of wrap(y, r)) {
        const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        g.addColorStop(0, "#fff");
        g.addColorStop(0.55, "#bdbdbd");
        g.addColorStop(0.85, "#555");
        g.addColorStop(1, "#000");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x + ox, y + oy, r, r * stretch, 0, 0, TAU);
        ctx.fill();
      }
    }
  };
  for (let i = 0; i < 1400; i++) drop(rand() * s, rand() * s, 1.2 + rand() * 2.6, 0.85 + rand() * 0.3);
  for (let i = 0; i < 70; i++) drop(rand() * s, rand() * s, 4 + rand() * 5, 1.05 + rand() * 0.3);
  ctx.globalCompositeOperation = "source-over";
  return dataTexture(heightToNormal(el, 3.2), true);
}
