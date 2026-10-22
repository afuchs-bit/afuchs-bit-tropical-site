#!/usr/bin/env node
/**
 * Label pipeline (docs/artlist-prompts.md D).
 *
 * Reads the flat label master per flavor, decides from its aspect ratio which
 * can it was drawn for (presets in src/config/can.ts) and writes the texture
 * the scene loads to public/can/<slug>/label.webp. It never edits flavors.ts
 * or can.ts; it prints the lines to change instead.
 *
 *   node scripts/encode-label.mjs [--root <dir>] [--metal]
 *
 * Exit code 1 when a master fits neither can (±4 %) or the flavors were drawn
 * for different cans. Nothing is written in that case. Masters are only read.
 */
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import sharp from "sharp";

const KB = 1000;

/** Aspect tolerance: a few percent of stretch is invisible on a turning can, more is not. */
const TOLERANCE = 0.04;

/** WebP q90 keeps small type on the label crisp; the scene loads this file directly. */
const QUALITY = 90;

/** Design direction budget "Etikett der Standard-Sorte ≈ 180 KB" (warn only). */
const SIZE_HINT = 180 * KB;

/** Transparent label pixels would render black anyway (D.4); make that explicit with Tinte. */
const TINTE = "#130E0B";

/** design/labels/ is outside /public, so masters are never deployed. */
const MASTER_DIR = "design/labels";
const MASTER_EXTS = ["png", "tif", "tiff", "jpg", "jpeg"];
const altMaster = (slug) => `public/can/${slug}/label-master.png`;
const outFile = (slug) => `public/can/${slug}/label.webp`;
const CAN_CONFIG = "src/config/can.ts";
const FLAVORS = "src/content/flavors.ts";

// ---------------------------------------------------------------------------

function fail(message) {
  console.error(`\nFehler: ${message}`);
  process.exit(1);
}

let args;
try {
  ({ values: args } = parseArgs({
    options: {
      root: { type: "string" },
      metal: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  }));
} catch (error) {
  fail(`${error.message}\nHilfe: node scripts/encode-label.mjs --help`);
}

if (args.help) {
  console.log(`Etiketten kodieren (docs/artlist-prompts.md D)

  node scripts/encode-label.mjs [Optionen]

  --root <dir>   Projektordner (Standard: Ordner über scripts/, oder $ASSETS_ROOT)
  --metal        reserviert für die Metall-Maske (noch nicht umgesetzt)

Master: ${MASTER_DIR}/<sorte>.(png|tif|tiff|jpg) oder public/can/<sorte>/label-master.png
Ausgabe: public/can/<sorte>/label.webp`);
  process.exit(0);
}

const root = path.resolve(
  args.root ?? process.env.ASSETS_ROOT ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."),
);

const rel = (abs) => path.relative(root, abs).split(path.sep).join("/") || ".";
const de = (n, digits) => n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const fmtKB = (bytes) => `${de(bytes / KB, 1)} KB`;
const pct = (n) => `${Math.abs(n) < 0.0005 ? "±" : n > 0 ? "+" : "−"}${de(Math.abs(n) * 100, 1)} %`;

async function readSource(file) {
  const abs = path.join(root, file);
  if (!existsSync(abs)) fail(`${file} fehlt unter ${root}.`);
  return readFile(abs, "utf8");
}

/**
 * Presets come from src/config/can.ts (one source for the scene and this
 * script). The label ratio is the printable cylinder: circumference : height.
 */
async function readCanPresets() {
  const source = await readSource(CAN_CONFIG);
  const presets = [];
  for (const block of source.matchAll(/(\w+):\s*\{\s*id:\s*"(\w+)",([^}]*)\}/g)) {
    const [, , id, body] = block;
    const num = (key) => Number(body.match(new RegExp(`\\b${key}:\\s*([\\d.]+)`))?.[1]);
    const pair = (key) => {
      const m = body.match(new RegExp(`\\b${key}:\\s*\\[\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\]`));
      return m ? [Number(m[1]), Number(m[2])] : null;
    };
    const preset = {
      id,
      radius: num("radius"),
      height: num("height"),
      labelHeight: num("labelHeight"),
      labelPx: pair("labelPx"),
      labelMasterPx: pair("labelMasterPx"),
    };
    const valid =
      [preset.radius, preset.height, preset.labelHeight].every((n) => Number.isFinite(n) && n > 0) &&
      preset.labelPx &&
      preset.labelMasterPx;
    if (!valid) fail(`Preset "${id}" in ${CAN_CONFIG} ist unvollständig (radius, height, labelHeight, labelPx, labelMasterPx).`);
    preset.ratio = (2 * Math.PI * preset.radius) / preset.labelHeight;
    presets.push(preset);
  }
  if (presets.length === 0) fail(`Keine Dosen-Presets in ${CAN_CONFIG} gefunden.`);
  const activeCan = source.match(/export const activeCan\s*:\s*\w+\s*=\s*"(\w+)"/)?.[1];
  if (!activeCan) fail(`activeCan in ${CAN_CONFIG} nicht gefunden.`);
  return { presets, activeCan };
}

async function readFlavorSlugs() {
  const source = await readSource(FLAVORS);
  const union = source.match(/export type FlavorSlug\s*=\s*([^;]+);/);
  const slugs = union ? [...union[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]) : [];
  if (slugs.length === 0) fail(`Konnte den Typ FlavorSlug in ${FLAVORS} nicht lesen.`);
  return slugs;
}

/** All masters for a slug, preferred first (case-insensitive). */
function findMasters(slug) {
  const found = [];
  const dir = path.join(root, MASTER_DIR);
  if (existsSync(dir)) {
    const entries = readdirSync(dir);
    for (const ext of MASTER_EXTS) {
      const hit = entries.find((entry) => entry.toLowerCase() === `${slug}.${ext}`);
      if (hit) found.push(path.join(dir, hit));
    }
  }
  const alt = path.join(root, altMaster(slug));
  if (existsSync(alt)) found.push(alt);
  return found;
}

function describeCan(p) {
  const diameter = Math.round(p.radius * 200);
  const height = Math.round(p.height * 100);
  return `${p.id} (Dose Ø ${diameter} × ${height} mm): Umfang : bedruckte Höhe = ${de(p.ratio, 2)} : 1, z. B. ${p.labelPx[0]} × ${p.labelPx[1]} px (Master ${p.labelMasterPx[0]} × ${p.labelMasterPx[1]} px)`;
}

/**
 * Decodes a master into oriented, opaque 8-bit sRGB pixels (D.4 asks for
 * exactly that, this makes other exports safe). withIccProfile("srgb")
 * matters for 16-bit PNG/TIFF with an embedded profile: sharp 0.35 processes
 * those in Display P3 and would otherwise return P3 numbers as sRGB (washed-out
 * label). For 8-bit input it changes no pixel. The texture ships untagged,
 * which browsers and three.js (SRGBColorSpace) read as sRGB.
 */
async function loadSrgb8(file) {
  return sharp(file, { autoOrient: true })
    .flatten({ background: TINTE })
    .toColourspace("srgb")
    .withIccProfile("srgb")
    .raw({ depth: "uchar" })
    .toBuffer({ resolveWithObject: true });
}

/** Mean absolute difference between the first and last pixel column (0–255). */
function seamDelta({ data, info }) {
  const { width, height, channels } = info;
  let sum = 0;
  for (let y = 0; y < height; y++) {
    const left = y * width * channels;
    const right = left + (width - 1) * channels;
    for (let c = 0; c < channels; c++) sum += Math.abs(data[left + c] - data[right + c]);
  }
  return sum / (height * channels);
}

// ---------------------------------------------------------------------------

const { presets, activeCan } = await readCanPresets();
const slugs = await readFlavorSlugs();
console.log(`Etiketten unter ${root}\nDosen laut ${CAN_CONFIG}:`);
for (const p of presets) console.log(`  ${describeCan(p)}`);

// Phase 1: analyse every master. Nothing is written unless all of them fit.
const jobs = [];
const errors = [];
for (const slug of slugs) {
  const [master, ...ignored] = findMasters(slug);
  if (!master) {
    console.log(`\n${slug}: kein Master (${MASTER_DIR}/${slug}.png). Die Szene nutzt weiter das gezeichnete Ersatz-Etikett.`);
    continue;
  }
  const meta = await sharp(master).metadata();
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;
  const ratio = width / height;
  const deviations = presets.map((p) => ({ preset: p, deviation: ratio / p.ratio - 1 }));
  const match = deviations.find((d) => Math.abs(d.deviation) <= TOLERANCE);
  console.log(`\n${slug}: ${rel(master)}  ${width} × ${height} px  (Verhältnis ${de(ratio, 2)} : 1)`);
  for (const other of ignored) console.log(`  Hinweis: ${rel(other)} ignoriert, ${rel(master)} hat Vorrang.`);

  if (!match) {
    errors.push(
      [
        `${slug}: ${rel(master)} hat ${width} × ${height} px, also ${de(ratio, 2)} : 1. Das passt zu keiner Dose (Toleranz ±${de(TOLERANCE * 100, 0)} %):`,
        ...deviations.map((d) => `  ${describeCan(d.preset)}  → Abweichung ${pct(d.deviation)}`),
        "  Das Etikett ist die flache Abwicklung des bedruckten Zylinders: Die Breite ist der Umfang",
        "  (Bildmitte = Front, linke und rechte Kante treffen sich hinten an der Naht), die Höhe ist",
        "  die bedruckte Höhe ohne Schulter und Bodenrundung. Bitte das Etikett im passenden",
        "  Verhältnis anlegen oder die Dieline des Abfüllers schicken. Details: docs/artlist-prompts.md, Abschnitt D.",
      ].join("\n"),
    );
    continue;
  }
  jobs.push({ slug, master, width, height, ratio, preset: match.preset, deviation: match.deviation, meta });
}

const cans = [...new Set(jobs.map((j) => j.preset.id))];
if (cans.length > 1) {
  errors.push(
    `Die Etiketten passen zu verschiedenen Dosen (${jobs.map((j) => `${j.slug} → ${j.preset.id}`).join(", ")}).\n` +
      "  Alle Sorten laufen in derselben Dose und brauchen dasselbe Layout (D.6), damit die Marke beim Sortenwechsel stehen bleibt.",
  );
}

if (errors.length > 0) {
  for (const message of errors) console.error(`\nFehler: ${message}`);
  console.error("\nEs wurde nichts geschrieben.");
  process.exit(1);
}

if (jobs.length === 0) {
  console.log(`\nKeine Etiketten gefunden. Master als PNG (sRGB, ohne Alpha) nach ${MASTER_DIR}/<sorte>.png legen.`);
} else {
  // Phase 2: encode.
  const lines = [];
  for (const job of jobs) {
    const [targetW, targetH] = job.preset.labelPx;
    const outPath = path.join(root, outFile(job.slug));
    const notes = [];

    if (job.width < targetW) notes.push(`Master nur ${job.width} px breit; wird auf ${targetW} px hochskaliert und wirkt weich. Bitte mindestens ${targetW} px, besser ${job.preset.labelMasterPx[0]} px liefern.`);
    if (Math.abs(job.deviation) > 0.005) notes.push(`Verhältnis weicht um ${pct(job.deviation)} ab; das Bild wird auf ${targetW} × ${targetH} px gestreckt statt beschnitten, damit die Naht erhalten bleibt.`);

    if (job.meta.hasAlpha && !(await sharp(job.master).stats()).isOpaque) {
      notes.push(`Der Master hat transparente Bereiche; sie werden auf Tinte ${TINTE} gelegt. Bitte ohne Alpha liefern (D.4).`);
    }
    if (!["uchar", "char"].includes(job.meta.depth)) {
      notes.push(`Der Master hat ${job.meta.depth === "ushort" ? "16" : job.meta.depth} bit pro Kanal; er wird nach 8 bit sRGB umgerechnet (D.4 verlangt 8 bit).`);
    }
    if (rel(job.master).startsWith("public/")) {
      notes.push(`${rel(job.master)} liegt in public/ und wird mit ausgeliefert. Besser nach ${MASTER_DIR}/${job.slug}.png legen (D.6).`);
    }

    const pixels = await loadSrgb8(job.master);
    const seam = seamDelta(pixels);
    if (seam > 12) notes.push(`Naht prüfen: linke und rechte Kante weichen im Mittel um ${de(seam, 1)} von 255 ab (D.2, Verschiebetest).`);

    await mkdir(path.dirname(outPath), { recursive: true });
    const { width, height, channels } = pixels.info;
    const out = await sharp(pixels.data, { raw: { width, height, channels } })
      .resize(targetW, targetH, { fit: "fill", kernel: "lanczos3" })
      .webp({ quality: QUALITY, effort: 6, smartSubsample: true })
      .toFile(outPath);

    const sizeNote = out.size > SIZE_HINT ? `  (über dem Richtwert ≈ ${fmtKB(SIZE_HINT)} der Direction)` : "";
    console.log(`\n${job.slug} → ${job.preset.id} (Abweichung ${pct(job.deviation)})`);
    console.log(`  ${rel(outPath)}  ${targetW} × ${targetH} px  ${fmtKB(out.size)}${sizeNote}`);
    for (const note of notes) console.log(`  Hinweis: ${note}`);
    // A trailing comment keeps the printed line safe to paste as is.
    lines.push(`  label: "/${path.posix.relative("public", outFile(job.slug))}", // ${job.slug}`);
  }

  console.log(`\nIn ${FLAVORS} beim jeweiligen slug eintragen:`);
  for (const line of lines) console.log(line);

  const can = jobs[0].preset.id;
  console.log(
    can === activeCan
      ? `\nactiveCan in ${CAN_CONFIG} ist "${activeCan}" und passt.`
      : `\nactiveCan in ${CAN_CONFIG} muss von "${activeCan}" auf "${can}" geändert werden:\n  export const activeCan: CanPresetId = "${can}";`,
  );
  const missing = slugs.filter((slug) => !jobs.some((j) => j.slug === slug));
  if (missing.length > 0) console.log(`\nNoch ohne Etikett: ${missing.join(", ")}.`);
}

if (args.metal) {
  console.log(
    `\nTODO --metal: Die Metall-Maske ist reserviert und noch nicht umgesetzt.` +
      `\n  Geplant: ${MASTER_DIR}/<sorte>-metal.png (Graustufen, Weiß = blankes Alu, Schwarz = deckende Farbe)` +
      `\n  → public/can/<sorte>/label-metal.webp als metalnessMap.`,
  );
}
