#!/usr/bin/env node
/**
 * Intro photo pipeline for the city-night image world (docs/hero-brief.md).
 *
 * Reads the seven square originals from assets-src/intro/<slug>.(jpg|jpeg|png|webp)
 * (not deployed) and writes what the site ships:
 *   public/intro/<slug>.avif  1024 × 1024 (fireworks 1300 × 1300), loaded by the intro
 *   public/intro/<slug>.jpg   1200 × 1200, fallback without AVIF and OG image
 *
 * Crop is 1:1 around a per-slug focal point (centre by default). fireworks is
 * cropped around its burst so the amber centre sits exactly in the middle of
 * the bubble; that is what the light halo takes over at +5.0 s.
 *
 * The only grade is a selective one: violet, magenta and pink light (hue
 * 255–345°) is desaturated and LED cyan (172–198°) calmed, because the
 * palette allows no purple and no glow except amber. Steel blue and graphite
 * stay untouched.
 *
 *   node scripts/optimize-intro.mjs [--root <dir>] [--no-grade] [--check]
 *     [--avif-quality <n>] [--jpg-quality <n>] [--manifest]
 *
 * --manifest also rewrites src/config/intro-manifest.ts (the hero round wires
 * the new slugs; until then the manifest is left alone).
 * Exit code 1 if an AVIF exceeds its budget or the AVIF set exceeds 500 KB.
 * Originals are only read, never moved or deleted.
 */
import { existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import sharp from "sharp";

/** Decimal units (1 KB = 1000 bytes), so budgets err on the strict side. */
const KB = 1000;

/** Dramaturgy order: Stadt → Bewegung → Spannung → Weite → Atempause → Höhepunkt → Knall. */
const SLUGS = ["towers", "yacht", "storm", "water", "terrace", "rooftop", "fireworks"];

/**
 * Memory bubbles are up to 46vmin (≈ 414 px at 1440×900, ×1.15 at the cut-in,
 * DPR 2 ≈ 950 px; phones ≈ 1050 px at DPR 3), so they ship at the full 1024 px
 * of the originals. fireworks grows into the 70vmin halo.
 */
const SPECS = {
  default: { size: 1024, avifBudget: 80 * KB },
  fireworks: { size: 1300, avifBudget: 150 * KB },
};
const JPG_SIZE = 1200;
const TOTAL_BUDGET = 500 * KB;

/**
 * Focal points in % of the original (x, y). Measured from the amber light:
 * the fireworks burst sits at ≈ 52 % / 43 %, not in the middle of the frame.
 */
const FOCUS = { fireworks: [0.52, 0.43] };

/**
 * Hue bands that leave the palette and how much saturation stays: violet →
 * pink goes almost grey; LED cyan is calmed but keeps a hint, so it reads as
 * cold steel light. Steel blue windows (≈ 205–220°) stay untouched.
 */
const OFF_PALETTE = [
  { from: 255, to: 345, keep: 0.15, minChroma: 0.08, minLight: 0 },
  // Only bright, saturated LED light; the dark teal night sky must stay.
  { from: 172, to: 198, keep: 0.4, minChroma: 0.3, minLight: 0.45 },
];

const SRC_DIR = "assets-src/intro";
const SRC_EXTS = ["jpg", "jpeg", "png", "webp"];
const OUT_DIR = "public/intro";
const URL_BASE = "/intro";
const MANIFEST = "src/config/intro-manifest.ts";

// ---------------------------------------------------------------------------

function fail(message) {
  console.error(`\nFehler: ${message}`);
  process.exit(1);
}

let args;
try {
  args = parseArgs({
    options: {
      root: { type: "string" },
      grade: { type: "boolean", default: true },
      "no-grade": { type: "boolean", default: false },
      check: { type: "boolean", default: false },
      manifest: { type: "boolean", default: false },
      "avif-quality": { type: "string", default: "52" },
      "jpg-quality": { type: "string", default: "82" },
      help: { type: "boolean", default: false },
    },
  }).values;
} catch (error) {
  fail(error.message);
}

if (args.help) {
  console.log(
    "node scripts/optimize-intro.mjs [--root <dir>] [--no-grade] [--check] [--manifest] [--avif-quality <n>] [--jpg-quality <n>]",
  );
  process.exit(0);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(args.root ?? process.env.ASSETS_ROOT ?? path.join(here, ".."));
const grade = args.grade && !args["no-grade"];
const avifQuality = Number(args["avif-quality"]);
const jpgQuality = Number(args["jpg-quality"]);
if (!Number.isFinite(avifQuality) || !Number.isFinite(jpgQuality)) fail("Qualität muss eine Zahl sein.");

const fmtKB = (bytes) => `${(bytes / KB).toFixed(1).replace(".", ",")} KB`;

function findSource(slug) {
  for (const ext of SRC_EXTS) {
    const file = path.join(root, SRC_DIR, `${slug}.${ext}`);
    if (existsSync(file)) return file;
  }
  return null;
}

/** Largest square around the focal point that stays inside the image. */
function squareCrop(width, height, [fx, fy] = [0.5, 0.5]) {
  const cx = fx * width;
  const cy = fy * height;
  const half = Math.floor(Math.min(cx, cy, width - cx, height - cy, width / 2, height / 2));
  return { left: Math.round(cx - half), top: Math.round(cy - half), width: half * 2, height: half * 2 };
}

/** Desaturates off-palette hues in a raw RGB buffer (in place). */
function calmOffPalette(data) {
  let touched = 0;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    if (d < 0.08) continue;
    let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    const band = OFF_PALETTE.find(
      (x) => h >= x.from && h <= x.to && d >= x.minChroma && max >= x.minLight,
    );
    if (!band) continue;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    data[i] = Math.round((l + (r - l) * band.keep) * 255);
    data[i + 1] = Math.round((l + (g - l) * band.keep) * 255);
    data[i + 2] = Math.round((l + (b - l) * band.keep) * 255);
    touched++;
  }
  return touched / (data.length / 3);
}

async function prepare(slug, file) {
  const meta = await sharp(file).metadata();
  const crop = squareCrop(meta.width, meta.height, FOCUS[slug]);
  const { data, info } = await sharp(file)
    .rotate()
    .extract(crop)
    .removeAlpha()
    .toColorspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const purple = grade ? calmOffPalette(data) : 0;
  const base = sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
  return { base, crop, source: { width: meta.width, height: meta.height }, purple };
}

async function encode(slug, file) {
  const spec = SPECS[slug] ?? SPECS.default;
  const { base, crop, source, purple } = await prepare(slug, file);
  const avifPath = path.join(root, OUT_DIR, `${slug}.avif`);
  const jpgPath = path.join(root, OUT_DIR, `${slug}.jpg`);
  await base
    .clone()
    .resize(spec.size, spec.size, { kernel: "lanczos3" })
    .avif({ quality: avifQuality, effort: 6, chromaSubsampling: "4:2:0" })
    .toFile(avifPath);
  await base
    .clone()
    .resize(JPG_SIZE, JPG_SIZE, { kernel: "lanczos3" })
    .jpeg({ quality: jpgQuality, mozjpeg: true, progressive: true })
    .toFile(jpgPath);
  return { slug, spec, crop, source, purple, avif: (await stat(avifPath)).size, jpg: (await stat(jpgPath)).size };
}

async function measure(slug) {
  const spec = SPECS[slug] ?? SPECS.default;
  const avifPath = path.join(root, OUT_DIR, `${slug}.avif`);
  const jpgPath = path.join(root, OUT_DIR, `${slug}.jpg`);
  if (!existsSync(avifPath)) return null;
  return {
    slug,
    spec,
    avif: (await stat(avifPath)).size,
    jpg: existsSync(jpgPath) ? (await stat(jpgPath)).size : 0,
  };
}

async function writeManifest(rows) {
  const entries = rows
    .map((r) => `  ${r.slug}: { avif: "${URL_BASE}/${r.slug}.avif", jpg: "${URL_BASE}/${r.slug}.jpg", size: ${r.spec.size} },`)
    .join("\n");
  const body = `/**
 * GENERATED by scripts/optimize-intro.mjs — do not edit by hand.
 * Encoded intro photos that exist in /public/intro, keyed by slug.
 */
export type IntroImage = { avif: string; jpg: string; size: number };

export const introManifest: Partial<Record<string, IntroImage>> = {
${entries}
};
`;
  await writeFile(path.join(root, MANIFEST), body);
}

// ---------------------------------------------------------------------------

await mkdir(path.join(root, OUT_DIR), { recursive: true });

const rows = [];
const missing = [];
for (const slug of SLUGS) {
  if (args.check) {
    const row = await measure(slug);
    if (row) rows.push(row);
    else missing.push(slug);
    continue;
  }
  const file = findSource(slug);
  if (!file) {
    missing.push(slug);
    continue;
  }
  rows.push(await encode(slug, file));
}

console.log(`\n${args.check ? "Prüfe" : "Kodiere"} Intro-Fotos unter ${root}\n`);
console.log("Slug       Quelle      Zuschnitt          AVIF                 Budget    JPG 1200   Fremdtöne beruhigt");
let errors = 0;
for (const r of rows) {
  const over = r.avif > r.spec.avifBudget;
  if (over) errors++;
  const src = r.source ? `${r.source.width}×${r.source.height}` : "–";
  const crop = r.crop ? `${r.crop.width}px @${r.crop.left},${r.crop.top}` : "–";
  const up = r.crop && r.crop.width < r.spec.size ? " (hochskaliert)" : "";
  console.log(
    `${r.slug.padEnd(10)} ${src.padEnd(11)} ${crop.padEnd(18)} ${`${fmtKB(r.avif)} @${r.spec.size}${up}`.padEnd(20)} ${fmtKB(r.spec.avifBudget).padEnd(9)} ${fmtKB(r.jpg).padEnd(10)} ${r.purple !== undefined ? `${(r.purple * 100).toFixed(2)} %` : "–"}${over ? "   ÜBER BUDGET" : ""}`,
  );
}
for (const slug of missing) console.log(`${slug.padEnd(10)} fehlt (${args.check ? "keine AVIF" : `kein Original in ${SRC_DIR}`})`);

const total = rows.reduce((sum, r) => sum + r.avif, 0);
const jpgTotal = rows.reduce((sum, r) => sum + r.jpg, 0);
console.log(`\nIntro gesamt (AVIF, das lädt das Intro): ${fmtKB(total)} von höchstens ${fmtKB(TOTAL_BUDGET)}`);
console.log(`JPG-Fallback gesamt (lädt nur ohne AVIF): ${fmtKB(jpgTotal)}`);
if (total > TOTAL_BUDGET) errors++;

if (args.manifest && !args.check) {
  await writeManifest(rows);
  console.log(`\n${MANIFEST} neu geschrieben (${rows.length} Einträge).`);
}

if (errors > 0) {
  console.error(`\n${errors} Budget-Überschreitung(en). Abhilfe: --avif-quality 45 oder das Original leicht entrauschen.`);
  process.exit(1);
}
