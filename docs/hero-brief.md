# Hero-Brief (Intro-Sequenz)

Stand 22.10.2026. Dieser Brief ersetzt den ersten Stand („warme Golden-Hour-Erinnerungen“, sechs Blasen von Party bis Club). Die Bildwelt ist jetzt eine Großstadt-Sommernacht. Zwei Runden: erst die Design-Direction freigeben (`docs/design-direction.md`), dann bauen.

## Bildwelt

Eine Sommernacht in einer namenlosen Großstadt, mit dem Handy mitgefilmt:

- **Licht:** fast schwarz, kühles Graphit und Stahlblau, harte einzelne Lichtquellen.
- **Kamera:** Handkamera-Unschärfe, Ich-Perspektive.
- **Amber:** In jedem Bild gibt es genau ein Licht in Mango-Amber (Farbton 24–35°, gemessen im Mittel 31°). Dieses Amber ist der rote Faden, der am Ende zur Dose führt.
- **Tempo:** wie in Lifestyle-Reels, harte Schnitte unter einer Sekunde, Erinnerungsfetzen statt Diashow.
- **Bewusst nicht im Bild:** Geld, Uhren, Schmuck, Autos, Jets. Der Werberat verbietet, Alkohol mit sozialem Erfolg zu verknüpfen. Das gilt auch für die Copy.

## Die sieben Bilder

Originale liegen in `assets-src/intro/` (nicht ausgeliefert). `npm run assets:intro` (`scripts/optimize-intro.mjs`) erzeugt daraus `public/intro/<slug>.avif` (1024 px, `fireworks` 1300 px; ≤ 80 KB je Bild, zusammen ≤ 500 KB) und `<slug>.jpg` (1200 px, Fallback und OG).

| # | slug | Motiv | Label | Amber-Licht im Bild |
|---|---|---|---|---|
| 01 | towers | Blick nach oben zwischen zwei Hochhäusern, ein Fenster in Amber | 01 · 22:14 | x 58 % / y 52 % |
| 02 | yacht | Frau läuft übers Yachtdeck weg, Rückenansicht | 02 · 22:51 | x 68 % / y 67 % |
| 03 | storm | Blitz über der Skyline, Silhouette am Fenster | 03 · 23:08 | x 86 % / y 71 % |
| 04 | water | Skyline spiegelt sich im schwarzen Wasser, vom Boot aus | 04 · 23:26 | x 80 % / y 73 % |
| 05 | terrace | Leere Hotelterrasse, Jacke über dem Stuhl | 05 · 23:47 | x 52 % / y 63 % |
| 06 | rooftop | Frau tanzt auf dem Rooftop, Arme hoch, Gegenlicht | 06 · 23:58 | x 48 % / y 48 % |
| 07 | fireworks | Feuerwerk zwischen zwei Türmen, Amber-Gold | 07 · 00:00 | Bildmitte (Zuschnitt um das Feuerwerk) |

- **Reihenfolge = Dramaturgie:** Stadt → Bewegung → Spannung → Weite → Atempause → Höhepunkt → Knall. `yacht` und `water` folgen nie direkt aufeinander.
- **Labels:** eine einzige Nacht, die auf Mitternacht zuläuft, ohne Wochentage. Label 07 rollt nach dem Platzen auf „HEUTE NACHT“.
- **Amber-Positionen:** gemessen am Schwerpunkt der Amber-Pixel. Grundlage für die eigene Idee der Direction.

## Intro-Drehbuch (max. 7 s)

| Zeit | Was passiert |
|---|---|
| 0,0 s | Age Gate. „Ja“ startet das Intro; der Klick schaltet auch Audio frei. |
| +0,4 s | Schwärze mit feinem Korn (CSS-Ebene, etwa 7 %, über allem). |
| +0,8–5,0 s | Sieben Blasen im Abstand von etwa 0,6 s, je etwa 0,7 s sichtbar, leicht überlappend. Siehe „Blase“ unten. |
| +5,0 s | `fireworks` wandert in die Mitte und wächst auf 70vmin; das Amber-Zentrum liegt exakt in der Bildmitte. Es wird zur flachen Lichtscheibe, dann zum Lichthof: ein Shader, dessen Uniforms Mittelpunkt und Radius der Blase übernehmen. |
| +5,6 s | Die Dose erscheint aus dem Licht, Bloom auf der Oberkante. Optional ein tiefer Bass-Schlag. |
| +6,4 s | Headline-Reveal, danach Header, Infotext, CTAs. |

**Blase**
- **Form:** runde Maske (Inkreis). Das Foto skaliert darin von 1,15 auf 1,0.
- **Bewegung:** wächst aus einem Punkt, leichte Glanzsichel oben links, steigt ein Stück und platzt.
- **Rand:** weich und etwas schwammig. Das Foto läuft am Rand in die Schwärze aus, statt einer Linie gibt es einen unscharfen Lichtsaum; auch der Ring beim Platzen ist weich.
- **Größe:** 34–46vmin (bei 1440 × 900 rund 300–410 px), auf Mobil ×1,7 (58–78 % der Breite). Jede Erinnerung füllt kurz den Blick.
- **Verteilung:** über die ganze Fläche, nie zwei direkt hintereinander auf derselben Bildhälfte.
- **Tempo:** härter als im alten Brief. Erscheinen in etwa 120 ms mit ease-out-expo, Platzen ebenso schnell. Es soll wie ein Schnitt wirken, nicht wie eine Überblendung.

**Immer:**
- „Intro überspringen“ ist sichtbar.
- Das Intro läuft nur bei `firstPass`.
- Bei `prefers-reduced-motion` kein Intro; der Hero steht sofort.

**Preload:** Die sieben AVIFs laden schon während des Age Gates. Vor dem Start wird `img.decode()` abgewartet, damit keine Blase leer aufploppt.

## Ruhezustand

- Dose groß im Lichthof, dreht sich leicht mit der Maus.
- Schwebende Elemente weichen dem Cursor aus.
- Sortenwechsel aus `src/content/flavors.ts`: Dose, Lichthof und Elemente wechseln gemeinsam.
- Header immer sichtbar.
- Copy-Zone in voller Tinte, nichts fliegt darüber.
- CTAs: „Zum ersten Drop“ und „Für Bars & Handel“.

## Fallbacks (Assets noch nicht da)

- **Etikett:** prozedurale CanvasTexture aus Sortenfarbe und `brand.name`. Ein späteres Etikett unter `/public/can/` greift ohne Codeänderung.
- **Zutaten:** einfache Geometrie (Eiswürfel, Lichtpunkte, prozedurale Früchte).

## Technik

- Hero-Shell bleibt Server Component.
- Intro (DOM/CSS mit Framer Motion und nativen Animationen, Blasen ohne WebGL) und Szene (R3F über `next/dynamic({ ssr: false })`) sind Client Components.
- Der Canvas lädt parallel zum Intro und ist bei +5,0 s bereit. Ist er das nicht, hält der Lichthof als CSS-Fallback, bis die Dose da ist. Kein Loch.
- Kein Layout Shift. LCP ist das Age Gate bzw. die Headline, kein Bild.

## Rechtliches

- Kein Alkoholgehalt in der Headline, keine Stärke oder Menge als Argument.
- Kein Status- oder Erfolgsbezug in der Copy.
- Kein Fahrzeugbezug: Yacht und Boot nur als Stimmung, niemand am Steuer, kein Getränk am Fahrzeug.
- Vor dem Launch vom Werberechtler prüfen lassen.

## Abnahme

- `npm run typecheck`, `npm run lint`, `npm run build` fehlerfrei.
- Screenshots bei 1440 × 900 und 390 × 844, jeweils 1,5 s, 3,5 s, 5,3 s und 7,5 s nach „Ja“, unter `docs/screens/`.
- Lighthouse Mobile Performance ≥ 85, CLS 0, Intro-Assets ≤ 500 KB.
