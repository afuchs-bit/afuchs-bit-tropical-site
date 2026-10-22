# Asset-Skripte

Zwei Node-Skripte (sharp, nur zur Build-Zeit) bereiten die Bilder für den Hero auf. Bildwelt und Liste der Intro-Fotos stehen in `docs/hero-brief.md`, die Etikett-Spezifikation in `docs/artlist-prompts.md` (Abschnitt D).

```bash
npm run assets:intro   # node scripts/optimize-intro.mjs
npm run assets:label   # node scripts/encode-label.mjs
```

`prebuild` ruft `node scripts/optimize-intro.mjs --check` auf. Der Check kodiert nichts, er misst nur die vorhandenen Dateien gegen das Budget.

Beide Skripte lesen die Originale nur. Sie verschieben oder löschen nichts. Mehrfaches Ausführen ergibt dasselbe Ergebnis.

## Intro-Fotos: `assets:intro`

**Originale ablegen:** `assets-src/intro/<slug>.jpg` (auch `.jpeg`, `.png`, `.webp`). Der Ordner wird nicht ausgeliefert. Slugs in Reihenfolge der Dramaturgie: `towers`, `yacht`, `storm`, `water`, `terrace`, `rooftop`, `fireworks`.

**Was passiert:**

1. Zuschnitt 1:1 um einen Fokuspunkt, sonst mittig. `fireworks` wird um das Zentrum des Feuerwerks beschnitten (≈ 52 % / 43 % des Originals), damit das Amber-Zentrum genau in der Blasenmitte liegt.
2. Selektives Grading: Violett bis Pink (255–345°) wird fast grau, helles LED-Cyan (172–198°) gedämpft. Stahlblau und Graphit bleiben unverändert. `--no-grade` schaltet das ab.
3. Ausgabe nach `public/intro/<slug>.avif` (640 px, `fireworks` 1300 px) und `<slug>.jpg` (1200 px, Fallback und OG-Bild).
4. Größentabelle mit den echten Dateigrößen.
5. `--manifest` schreibt zusätzlich `src/config/intro-manifest.ts` neu.

**Budget (1 KB = 1000 Byte):** AVIF ≤ 55 KB, `fireworks` ≤ 150 KB, Intro gesamt (AVIF) ≤ 500 KB. Bei Überschreitung endet das Skript mit Exit-Code 1. Abhilfe: `--avif-quality 45`.

**Hinweis:** Die Originale sind 1024 px groß. `fireworks` (880 px Zuschnitt → 1300 px) und die JPGs (1024 → 1200 px) werden deshalb hochskaliert. Mit größeren Originalen entfällt das ohne Codeänderung.

## Etikett: `assets:label`

**Master ablegen:** `design/labels/<sorte>.png` (auch `.tif`, `.jpg`) mit `<sorte>` = `tropical` bzw. `limette-minze`. Alternativ `public/can/<sorte>/label-master.png` (wird dann mit ausgeliefert). Format nach D.4: PNG, 8 bit, sRGB, ohne Alpha.

**Was passiert:**

1. Aus dem Seitenverhältnis wird die Dose bestimmt. Die Werte kommen aus `src/config/can.ts` (Umfang : bedruckte Höhe), die Toleranz ist ±4 %:
   - Sleek 58 × 146 mm: ≈ 1,47 : 1, Ausgabe 2048 × 1394 px (D nennt 2048 × 1400 als Master, das passt)
   - Standard 66 × 115 mm: ≈ 2,10 : 1, Ausgabe 2048 × 976 px

   Passt ein Etikett zu keiner Dose oder passen die Sorten zu verschiedenen Dosen, schreibt das Skript nichts und endet mit Exit-Code 1. Die Meldung erklärt die Vorgabe.
2. Ausgabe nach `public/can/<sorte>/label.webp` (q90) in der Pixelgröße der Dose. Kleine Abweichungen im Verhältnis werden gestreckt, nicht beschnitten, damit die Naht erhalten bleibt. 16-bit-Master und eingebettete Farbprofile werden nach 8 bit sRGB umgerechnet.
3. Hinweise erscheinen bei zu kleinem Master, bei Transparenz (wird auf `#130E0B` gelegt), bei 16 bit und bei sichtbarer Naht.
4. Das Skript ändert keinen Code. Es gibt aus:
   - die Zeile für `src/content/flavors.ts`: `label: "/can/<sorte>/label.webp",`
   - ob `activeCan` in `src/config/can.ts` umgestellt werden muss

`--metal` ist für eine spätere Metall-Maske reserviert (`design/labels/<sorte>-metal.png`) und gibt derzeit nur einen TODO-Hinweis aus.

## Optionen beider Skripte

- `--root <dir>` (oder `ASSETS_ROOT=<dir>`): anderer Projektordner, zum Beispiel für Tests in einem Temp-Ordner. Er braucht dieselbe Struktur (`src/config/…`, `src/content/flavors.ts`).
- `--help`: kurze Hilfe.
