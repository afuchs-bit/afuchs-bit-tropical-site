# Design-Direction v2: „Heute / Nacht.“ in der Stadt

Stand 22.10.2026, Runde 1 (noch kein Hero-Code). Ersetzt v1 („warme Sommernacht, Mango-Licht“). Grundlage: `docs/hero-brief.md` und die sieben Bilder in `assets-src/intro/`. **Wartet auf Freigabe.**

**Haltung:** Die Komposition aus v1 bleibt, weil sie funktioniert: große gekippte Dose im Lichthof, zwei riesige Kursiv-Wörter diagonal um sie herum, Zutaten, die dem Cursor ausweichen. Neu ist die Welt drumherum: kaltes Graphit und Stahlblau, in dem genau **ein** Licht warm ist. Dieses Amber ist das Einzige, was jede Erinnerung überlebt, und am Ende ist es das Licht der Dose.

## 1. Referenzen

| Ref. | Was wir übernehmen |
|---|---|
| **010 Pure Zero** (Leitreferenz) | Produkt im Lichthof mit Bloom auf der Oberkante, ausweichende Zutaten, Sortenkarten oben rechts, zwei riesige Kursiv-Wörter. Ohne verschwindenden Header, blassen Infotext und Objekte über Text. |
| **008 SunVault** | Die Akzentfarbe ist das Licht im Bild. Hier wörtlich: Jedes Foto hat ein Amber-Licht, und dieses Amber ist Signal, CTA und Lichthof. |
| **003 Lando Norris** | Der Farbbalken-Wipe wird zum Licht-Wipe, Richtung wechselt, Fließtext folgt nach 200 ms. |

## 2. Palette (gemessen an den sieben Bildern)

| Rolle | Wert | Herkunft |
|---|---|---|
| Tinte | `#05090C` | Mittel der dunklen Pixel am Blasenrand aller sieben Bilder (Perzentil 10–40 im Kreisring 90–100 % des Radius: `#04090B`). Fast-Schwarz mit Stahlstich, kein Reinschwarz. Die Blasenränder verschmelzen damit. |
| Papier | `#EEEBE5` | neutrales Off-White mit einem Hauch Wärme, wie Displaylicht. Text auf Nacht, Sheets. |
| Signal = Amber | `#FFA647` (Farbton 31°) | Amber-Lichter der Bilder: Farbton 24–35°, Mittel 31°. Leuchtkraft für die UI angehoben. Einzige Akzentfarbe. |
| Signal-Text | `#A35400` | nur auf Papier-Sheets, per Skript abgeleitet |
| Tiefe | `#0F181D` | Graphit-Stahl, aus dem Mittelwert der Bilder (`#121C22`, `#1B272B`). Mobile Ruhezone, Grund der Szene. |

**Lichthof** Kern → Hof → Tiefe → Rand: `#A35C1C → #4A2C14 → #0F181D → #05090C`. Warmer Kern, der schnell ins kalte Graphit kippt. Gemischt in OKLab, damit der Übergang nicht schlammig wird.

**Kontraste (WCAG, Skript aus palettes.md):**
- Tinte / Papier 16,8
- Papier / Tiefe 15,1
- Tinte auf Signal 10,3 (CTA)
- Signal / Tiefe 9,2
- Signal-Text / Papier 4,61
- Papier 72 % auf Tiefe 8,3
- Infotext auf der Ruhezone 13,8
- ungünstigster Fall (Kern + Scrim) Papier 8,8 / Signal 5,4
- Papier auf dem Kern (nur Display) 4,3

**Regeln:**
- Kein Lila, keine Blau-Lila-Verläufe, kein Glow außer Amber. Das Bild-Skript dämpft Violett bis Pink und helles LED-Cyan bereits beim Kodieren.
- Abstufungen nur über Deckkraft: Papier 72 % für Meta, 16 % für Linien.

### Entscheidung: Wie unterscheiden sich die Sorten?

v1 hatte für Limette Minze ein eigenes Limettenlicht (`#CDEE62`). Das widerspricht jetzt „nur Amber, kein anderer Glow“. **Empfehlung:**

- **Gleich für beide Sorten:** Signal (`#FFA647`) und damit das Interface.
- **Was die Sorte trotzdem verwandelt (Prinzip 32):**
  - **Lichthof:** Er wechselt die Temperatur innerhalb des Amber-Bands.
    - Tropical: tiefes Mango-Amber, Kern `#A35C1C` (28°).
    - Limette Minze: helleres, gelberes Amber, Kern `#8A6A2C` (40°), dazu eine grünstichige Graphit-Tiefe `#0C1915`.
  - **Elemente:** Maracuja, Mango und Ananas gegen Limette, Minze und Eis. Grün erscheint nur auf den Objekten selbst, nicht als Licht.
  - **Etikett der Dose.**
  - **Material:** Satin bei Tropical, Kondensperlen bei Limette Minze.

Beide Lichthöfe bestehen dieselben Kontraste (Papier auf Kern 4,3 bzw. 4,2).

## 3. Schrift (nur OFL): Paarung A aus dem Skill

| Rolle | Schrift |
|---|---|
| Display | **Instrument Serif Italic** (statt Fraunces) |
| Text | **Geist** 400/500 (statt Hanken Grotesk) |
| Meta | Geist Mono 400, 12px, Versalien, tabellarische Ziffern |

**Warum der Wechsel:**
- **Display:** Ich habe den A/B-Vergleich auf der echten Szene gemacht. Fraunces ist weich und buchig, das passte zur warmen Mango-Nacht. In der kalten Stadt wirkt Instrument Serif mit ihren harten Haarstrichen urbaner, schärfer und erwachsener, näher an „Nacht in der Stadt“ als an „Hofladen“. Zusätzlich ist sie leichter, eine Datei mit etwa 25 KB.
- **Text:** Geist ist kühler und technischer als Hanken und passt zu Graphit und Stahl.
- **Meta:** Mit Geist Mono lesen sich die Zeit-Labels wie ein Handy-Zeitstempel.

## 4. Hero (Ruhezustand)

- **Komposition wie v1:**
  - „Heute“ oben links, „Nacht.“ unten rechts; der Punkt ist ein Amber-Lichtpunkt.
  - Dose mittig, etwa 72vh hoch.
  - Ruhezone links: Eyebrow, Infotext in voller Papier-Farbe, CTA „Zum ersten Drop“, Textlink „Für Bars & Handel“.
  - Sortenkarten oben rechts.
  - Header immer sichtbar: Glas-Pille in der Mitte, rechts „Kontakt“.
- **Neue Grundstimmung:** Graphit statt Braun. Der Lichthof ist das einzige Warme in der Szene. Die Partylichter sind Amber und kaltes Weiß (`#DCE6EA`).
- **Copy:**
  - „Vodka, Maracuja, Mango und Ananas, eiskalt aus der Dose. Für die Abende, an die ihr euch erinnern wollt.“ bleibt. Sie hat keinen Status-Bezug.
  - Unten links steht „07 · HEUTE NACHT“ statt der Uhrzeit. Das ist das Label, auf das die siebte Blase rollt.
- **Mobil wie gebaut:** Szene bis 62svh, darunter die Ruhezone auf Tiefe.

## 5. Intro (etwa 8 s)

| Zeit | Was passiert |
|---|---|
| Gate | Die sieben AVIFs (zusammen 172 KB) laden schon jetzt, `img.decode()` vor dem Start. |
| 0,0–0,4 | „Ja“ schaltet den Ton frei. Danach Schwärze in Tinte mit 7 % CSS-Korn über allem. |
| 0,8–5,9 | Sieben Erinnerungsbilder, Start alle 0,75 s, je 1,0 s sichtbar: towers (links oben) → yacht (rechts unten) → storm (links unten) → water (rechts oben) → terrace (links Mitte) → rooftop (rechts Mitte) → fireworks (Mitte unten). Die Bilder wechseln immer die Bildhälfte. |
| je Bild | Keine klare Blase: kein Rand, kein Glanz, kein Ring. Das Foto ist nur in der Mitte voll sichtbar und geht über die äußeren ≈ 60 % des Radius fließend ins Schwarz über. Es blendet in 0,3 s ein (Zoom 0,92 → 1,0), steigt 3–6vmin, das Foto zoomt von 1,15 auf 1,0, dann löst es sich in 0,3 s auf. Größe 42–56vmin, auf Mobil ×1,6. |
| 5,9–6,25 | `fireworks` wandert in die Mitte und wächst auf 70vmin. Das Amber-Zentrum liegt exakt in der Mitte, weil das Bild beim Kodieren um das Feuerwerk beschnitten wird. Das Label rollt von „07 · 00:00“ auf „HEUTE NACHT“. |
| 6,2–6,45 | Das Foto wird zur flachen Lichtscheibe. Sie platzt, und der Kreis bleibt als Lichthof (Shader mit Mitte und Radius der Lichtscheibe). |
| 6,55 | Die Dose steigt aus dem Licht, Bloom auf der Oberkante, tiefer Bass-Schlag. |
| 7,35–8,0 | Licht-Wipe für „Heute“ (von links) und „Nacht.“ (von rechts), danach Header, Karten, Infotext und CTAs. |

## 6. Eigene Idee: „Was bleibt, ist das Licht“

- **Was beim Platzen bleibt:** Jede Blase wird so platziert, dass ihr Amber-Licht an einer festen Stelle im Raum sitzt. Die Positionen im Bild sind gemessen: towers 58/52 %, yacht 68/67 %, storm 86/71 % usw. Platzt die Blase, verschwindet das Foto, aber **ihr Amber-Licht bleibt** als 4px-Lichtpunkt in der Schwärze hängen.
- **Wie sich die Lichter sammeln:** Nach sechs Blasen hängen sechs warme Punkte im Dunkeln, eine Spur durch die Nacht. Bei 5,9 s zieht das Feuerwerk in die Mitte, und die sechs Punkte werden mitgezogen. Sie werden zu den ersten Partylichtern um die Dose.
- **Warum:** Der rote Faden aus dem Brief wird damit sichtbar, statt nur behauptet. Jede Erinnerung hinterlässt ihr Licht, und alle Lichter landen bei der Dose.
- **Aufwand:** Die Partylichter-Übergabe aus der letzten Blase gibt es schon. Neu sind nur die gemessenen Amber-Koordinaten je Blase und sechs zusätzliche Startpunkte.

## 7. Motion-Haltung

- **Ruhig fließend:** Das Intro reiht Erinnerungsfetzen, die aus dem Schwarz auftauchen und wieder darin verschwinden (0,3-s-Überblendungen). Der Ruhezustand ist ruhig wie die Nacht danach.
- **Kurven:** outExpo und inOutQuart aus `motion.ts`, kein Bounce.
- **Drei Signatur-Effekte:** Erinnerungen, die im Schwarz verschwinden und ihr Licht zurücklassen, Licht-Wipe, ausweichende Welt.
- **Reduced motion:** kein Intro, der Hero steht sofort.

**Genutzte Prinzipien:**

| Prinzip | Umsetzung |
|---|---|
| 27 | Szene mit Stimmung |
| 28 | Das Amber im Bild ist das Signal |
| 2 | Die Fotos ordnen sich der Palette unter: Graphit, ein Amber, Lila wird entfernt |
| 29 | Zwei Wörter umfließen die Dose |
| 31 | Elemente weichen dem Cursor aus |
| 32 | Der Wechsel verwandelt die Szene |
| 33 | Der Header schwebt und bleibt |
| 11 | Licht-Wipe |
| 5 | Zeitstempel-Labels |
| 4 | Extremer Größenkontrast |
| 16 | Drei Effekte, vollständiger Fallback |

## 8. Bildregie und Recht: Befunde an den gelieferten Bildern

- **yacht:**
  - **Was zu sehen ist:** Im Hintergrund halten Gäste Weingläser, ein Glas steht auf dem Tisch.
  - **Fahrzeugbezug:** Am Steuer ist niemand zu sehen, und die Frau trinkt nicht. Trotzdem stehen Boot und Alkohol im selben Bild.
  - **Statusbezug:** Die Yacht ist das deutlichste Luxus-Signal der Serie.
  - **Was tun:** vom Werberechtler prüfen lassen. Seit die Bilder deutlich größer sind (bis 56vmin) und 1,0 s stehen, sind die Gläser eher zu erkennen.
- **rooftop:** Am linken Rand halten Gäste Flasche und Glas. Feiern mit Getränken ist zulässig, solange niemand betrunken wirkt, und das ist hier erfüllt. Die pinken und cyanfarbenen LED-Streifen sind beim Kodieren gedämpft.
- **storm:** Am Fenster stehen Parfumflakons, eine Frau trägt Fußkettchen und Armband. Das ist Schmuck im Sinne eurer Ausschlussliste, in Blasengröße aber nicht erkennbar. Hinweis, kein Blocker.
- **water:** Die Aufnahme entsteht vom Boot aus, ohne Getränk. Unkritisch.
- **Auflösung:** Die Originale sind 1024 px groß. `fireworks` wird von 880 px auf 1300 px hochskaliert, die JPGs von 1024 auf 1200 px. In der 70vmin-Phase wird `fireworks` ohnehin zur Lichtscheibe. Größere Originale greifen ohne Codeänderung.

## 9. Was sich gegenüber dem gebauten Stand ändert (Runde 2)

- **Tokens:** Palette „nachtlicht“ wird zu „stadtnacht“ (Werte oben). Die Sorten teilen sich ein Signal.
- **Schriften:** Instrument Serif Italic und Geist.
- **`config/intro.ts`:** sieben Blasen mit neuen Slugs, Labels und Positionen, 120-ms-Schnitte, Amber-Koordinaten, Übergabe ab 5,0 s.
- **Manifest:** wird per `optimize-intro.mjs --manifest` mit AVIF und JPG geschrieben. Die Blasen laden die AVIFs.
- **Unten links:** „07 · HEUTE NACHT“ statt der Uhr.
- **Szene:** Lichthof, Partylichter und Eis-Tönung bekommen die neuen Farben.
- **Abnahme:** Screenshots unter `docs/screens/`, Lighthouse.
