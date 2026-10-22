# Bildpaket „Heute / Nacht.“: Prompts für Artlist, Export und Etikett-Spezifikation

Stand: 21.10.2026 (Review-Fassung). Die Erklärungen sind auf Deutsch, die Prompts auf Englisch und modellunabhängig, ohne Flags. Das Dokument ersetzt die älteren Angaben in `docs/site-structure.md` („Higgsfield“, „label.png 2048 × 1024“), in `docs/hero-brief.md` (nur `.jpg`) und die Zeitstempel und Bildpfade in `src/content/occasions.ts`.

---

## Review: Änderungen gegenüber dem Entwurf

Die Ziffern in Klammern verweisen auf die Prüfkriterien: (1) Konsistenz, (2) runde Maske, (3) Recht/Werberat, (4) typische KI-Fehler, (5) Passung zur Direction.

1. **Style-Block (1, 4):**
   - „warm summer night“ heißt jetzt „summer evening running into night“. Jetski, Yacht und Garten spielen in der Dämmerung, die alte Angabe widersprach den Motiven.
   - „Tungsten and amber practical lights“ heißt jetzt allgemein „all light is warm“, weil Strand und Bucht keine Lampen haben.
   - „35mm“ ist durch „full-bleed square“ ersetzt. 35 mm ist 3:2 und verleitet zu Filmrändern und Letterbox-Balken.
   - Die Halation ist ausdrücklich bernsteinfarben. Halation im Filmlook ist sonst oft rot, das führt zu Pink-Stichen.
   - Der globale Weichzeichner („slightly soft focus“) ist ersetzt: Das Hauptmotiv ist scharf, nur der Hintergrund weich, und Bewegungsunschärfe gibt es nur an Haar, Händen und Stoff. Grund: Die Blasen sind auf dem Handy nur 100–150 px groß.
   - Die Prozentangabe zur Sättigung ist entfernt, weil sie mit dem Grading doppelt entsättigt hätte.
   - Neuer Schlusssatz „plain and unmarked; every hand is empty …“. Er sichert Modelle ohne Negativ-Feld positiv gegen Getränke, Text und Logos ab.
2. **Avoid-Block (3, 4):** Neu sind:
   - Kinder und Jugendliche, „propping each other up“, „lying on the ground“
   - Datums- und Zeitstempel (der Filmlook erzeugt oft orangefarbene Datumsstempel), Polaroid- und Sprocket-Ränder, Letterbox
   - rotes Licht und rote Halation
   - Doppelbelichtung, zusätzliche Gliedmaßen, verschmolzene oder doppelte Körper, Vaping
3. **Ecke oben links (2):** Fünf Motive verstießen gegen die eigene Regel: Sonnenhimmel bei Jetski und Yacht, Zickzack-Lichterkette im Garten, Discokugel-Punkte „across the walls“ auf der Party und der Kronleuchter in der Lobby. Alle Lichtquellen sitzen jetzt so, dass es oben links dunkel bleibt. Im Club leuchten die Wandlaternen nur rechts.
4. **A6 Club (2, 3, 4):**
   - Die drei Freunde standen mittig vor dem mittigen Eingang und verdeckten so den hellsten Punkt. Sie gehen jetzt in der unteren Bildhälfte, die Kamera ist knapp über Kopfhöhe.
   - „Arm in arm“ ist durch „side by side, upright and steady“ ersetzt. Untergehakt liest sich wie Stützen, also wie Trunkenheit, und Generatoren lassen dabei oft Arme verschmelzen.
   - „Free of vehicles“ ist durch „pedestrian-only alley“ ersetzt, damit die Verneinung das Verbotene nicht erst ins Bild holt.
   - Statt „glowing doorway“ steht jetzt eine unmarkierte Holztür in Mango-Bernstein. Sonst kommen Clubschild oder Neon ins Bild.
5. **A2/A3 (1, 2):**
   - Jetski und Yacht kommen direkt nacheinander (1,4 s und 2,0 s) und stehen beide rechts im Bild. Im Entwurf waren beide „Sonne am Wasser“ und kaum zu unterscheiden. Jetzt ist der Jetski nah und niedrig, mit Sand im Vordergrund und Seitenlicht. Die Yacht ist weit, die Sonne steht genau hinter dem Heck.
   - Verneinungen im Hauptprompt sind positiv umformuliert („seat is empty“, „helm dark and empty“, „plain white and unmarked“).
   - „Small silhouettes“ ist entfernt, sonst besteht das Bild den 120-px-Test nicht. Handtücher sind jetzt „plain linen“, damit keine Muster oder Logos entstehen.
6. **A1 Party (3, 4):** „Slip dress“ heißt jetzt „midi dress“, weil der Werberat keine Verknüpfung mit sexueller Attraktivität will. Die erhobenen Hände sind bewegungsunscharf, das vermeidet Fingerfehler. Neu ist „upright and steady“.
7. **A4 Lobby (1, 4):**
   - Der Blitz ist entfernt, weil Marmor und Blitz harte Reflexe ergeben. Damit hat nur noch die Party einen Blitz. Der Hinweis in A.3 („optional Club“) widersprach dem A6-Prompt und ist korrigiert.
   - Gesichter sind im Profil.
   - Personal, Uniformen und Prunk stehen jetzt im Avoid (Werberat: Alkohol nicht mit Status oder sozialem Erfolg verknüpfen).
8. **A5 Garten (2, 3, 4):**
   - Statt der Zickzack-Lichterkette läuft eine Kette im Bogen von oben rechts.
   - Der Tisch ist nur noch als Kante unten im Bild zu sehen. Einen gedeckten Tisch ohne Gläser ergänzen Generatoren fast immer um Gläser.
   - Die Geste ist als Unschärfe beschrieben.
   - Label-Empfehlung 21:30, weil 19:30 im Sommer heller Tag ist.
9. **Abschnitt 0 (4):**
   - Die Stilreferenz gilt nur für den Stil, nicht für die Komposition. Sonst taucht die Gasse in jedem Bild auf.
   - Ohne Negativ-Feld wird die lange Liste nicht angehängt.
   - Neu ist eine Kürzungsregel für Modelle mit Zeichenlimit. Der Upscaler ist generisch beschrieben, weil der Funktionsumfang von Artlist nicht belegt ist.
10. **Kreistest (2):** Statt 200 px gilt jetzt **120 px und 200 px**. Nachgerechnet: Die Blasen sind auf 390 px Breite 100–150 px groß, auf 1440 × 900 sind es 144–216 px. Die alte Angabe „170–260 px“ gilt nur für 1920 × 1080.
11. **Grading (1, 5):** Der Farbtonbereich der Lichter ist an die Direction angeglichen (22–40° statt 20–45°), Hauttöne sind ausgenommen. Die sharp-Kette ist geprüft: sharp 0.35.5 führt `modulate` vor `linear` aus, unabhängig von der Aufrufreihenfolge. Das ist korrekt.
12. **Export (5):**
    - Die Größenangabe „38vmin“ ist klargestellt.
    - Neuer Hinweis: `src/content/occasions.ts` hat abweichende Zeitstempel und `.jpg`-Pfade.
13. **B Texturen (5, 4):**
    - Zwei Begründungen standen nicht in der finalen Direction: „mango cubes glowing translucent“ (das widerspricht auch „keine Transmission“) und „2–3 lange Blätter“. Beide sind ersetzt.
    - B3 „glossy pulp“ widersprach „no glossy highlights“.
    - Die Atlas-Rechnung ist korrigiert: 1024² mit 512-px-Zellen fasst nur 4 Zellen, Tropical braucht 5 und dazu die Normal-Maps.
14. **D Etikett:** Die Umfänge sind korrigiert (π × 58 = 182,2 mm, π × 66 = 207,3 mm), ebenso die px/mm-Werte. Die Pixelhöhen sind als gerundete Werte gekennzeichnet.
15. **Checklisten:** Neu sind die Unterscheidbarkeit von A2 und A3, Datumsstempel, „kein Status-Protz“ und `occasions.ts`.

---

## Überblick: was generiert wird und was nicht

| Nr. | Datei | Wofür | Mit Artlist? |
|---|---|---|---|
| A1–A6 | `party`, `jetski`, `yacht`, `lobby`, `garten`, `club` | Erinnerungsblasen im Intro | **ja, Pflicht** |
| B1–B7 | Foto-Texturen für Limette, Minze, Maracuja, Ananas, Eis, Mango | Atlas der schwebenden Zutaten | optional |
| C | Lichthof-Plate je Sorte | – | **nein**, kommt aus dem Shader (siehe Abschnitt C) |
| D | Etikett je Sorte | Textur der 3D-Dose | **nein**, Upload vom Nutzer bzw. Designer (Spezifikation in D) |
| – | Mini-Dosen, Poster | Sortenkarten, Fallback | **nein**, werden aus der fertigen 3D-Szene gerendert, damit das Etikett exakt stimmt |

---

## 0. So arbeitest du mit den Prompts in Artlist

1. **Seitenverhältnis 1:1 im Generator einstellen.** Es reicht nicht, wenn es nur im Prompt steht.
2. **Reihenfolge:** Zuerst **A6 club** erzeugen. Es ist das wichtigste Bild, weil es zum Lichthof wird. Danach A1 party.
   - Bietet Artlist eine Stil- oder Referenzbild-Option, nimm das beste A6 als **Stil**referenz für alle weiteren Bilder, mit niedriger bis mittlerer Stärke.
   - Prüfe jedes Ergebnis darauf, dass es nicht die **Komposition** von A6 übernimmt: keine Gasse, kein Fluchtpunkt-Tor im Garten.
   - Kopiert das Modell die Komposition, nimm die Referenz heraus und verlass dich auf den Style-Block und das Grading (A.5).
3. **Pro Prompt 4 Varianten erzeugen** und mit dem **Kreistest** auswählen: Bild auf **120 px und auf 200 px** verkleinern, eine Kreismaske darüberlegen und eine Sekunde hinsehen. Erkennst du die Szene sofort?
   - Eine Blase ist im Intro nur 0,75 s zu sehen.
   - Auf dem Handy (390 px Breite) ist sie 100–150 px groß, auf einem Laptop (1440 × 900) 144–216 px.
4. **Negativ-Prompts:** Hat Artlist ein Feld für den Negativ-Prompt, kommt die „Avoid“-Zeile dort hinein.
   - Fehlt das Feld, **lass die Avoid-Zeile ganz weg**. Hänge sie nicht an den Prompt an, denn manche Modelle erzeugen bei Verboten genau das Verbotene („no cans“ führt dann zu einer Dose).
   - Jeder Hauptprompt beschreibt deshalb schon positiv, was in den Händen ist und was im Bild steht. Der Style-Block endet mit „plain and unmarked; every hand is empty, relaxed or out of frame“.
5. **Hex-Codes:** Sie stehen im Style-Block als Zusatz zu den Farbwörtern. Schreibt ein Modell sie als Text ins Bild, lösch die Klammern. Die Farbwörter reichen, die exakten Werte setzt danach die Farbkorrektur (A.5).
6. **Zeichenlimit:** Kürzt ein Modell den Prompt, streich in dieser Reihenfolge:
   1. die Hex-Klammern
   2. den Satz „Feels like a fleeting …“
   3. Die Szenen-Sätze am Anfang und den Kompositions-Satz für die runde Maske nie kürzen.
7. **Auflösung:** mindestens 1200 × 1200 px, für **A6 club 2048 × 2048 px**, weil diese Blase auf 70vmin wächst. Liefert das Modell nur 1024 px, nimm einen Upscaler (×2), falls Artlist einen anbietet, sonst einen lokalen. Danach prüfen, dass der Upscaler keine künstlichen Details in Gesichter und Hände gerechnet hat.
8. **Nachweis:** Notiere je Bild Prompt, Modell, Datum und, falls angezeigt, den Seed, als Nachweis für die Nutzungsrechte (siehe Checkliste Recht).

---

## A. Die sechs Intro-Erinnerungsbilder

### A.1 Gemeinsamer Style-Block

Der Block steht unverändert am Ende jedes Prompts unten. Er ist dort schon eingefügt, du musst ihn nicht selbst einsetzen.

```text
Candid analogue film snapshot from one warm summer evening running into night, full-bleed square 1:1 frame. Lit by one dominant warm light source; everything around it falls off into warm near-black shadow. All light is warm: low sun, tungsten or amber practical lamps. Colour palette of warm near-black (#130E0B), mango amber (#FFA940) and candle-cream highlights (#FFE2B8). Highlights roll off softly and never clip to pure white. Lifted warm blacks, muted, gently desaturated colours. The main subject is in crisp focus and reads as one clear, simple shape; the background melts into shallow depth-of-field blur, with a touch of motion blur only on moving hair, hands or fabric. Soft amber halation around light sources, very fine subtle film grain, gentle dark vignette. Feels like a fleeting, half-remembered moment: nostalgic, intimate, adult, understated luxury, never flashy. Composition made for a circular crop: the main subject sits centred inside the middle 70 percent of the frame on a simple, uncluttered background, nothing important near the edges or corners, the upper-left area calm and dark. Everyone shown is clearly a grown adult in their late twenties to mid-thirties, natural and unposed, not looking into the camera. All surfaces, clothes and objects are plain and unmarked; every hand is empty, relaxed or out of frame.
```

### A.2 Gemeinsamer Avoid-Block

Er ist in jeder Avoid-Zeile unten schon enthalten.

```text
drinks of any kind, bottles, cans, glasses, cups, straws, ice buckets, bar counters with bottles, shot glasses, cigarettes, vaping, smoking, drunk, stumbling, swaying or sloppy behaviour, people propping each other up, anyone lying on the ground, children, teenagers, anyone who looks younger than 25, logos, brand names, readable text, letters, numbers, signs, licence plates, date stamp, timestamp, watermark, signature, red, pink, magenta, purple or violet light, red halation, blue or cyan neon, RGB LED or laser lighting, cold white light, cartoon, illustration, anime, 3D render, CGI look, plastic skin, airbrushed faces, HDR look, oversaturated colours, teal-and-orange grade, starburst lens flare, border, frame, polaroid or instant-film border, film sprocket holes, letterbox bars, collage, split image, double exposure, extra fingers, extra limbs, merged or duplicated bodies, distorted hands or faces
```

### A.3 Komposition für die runde Blasen-Maske

- **Maske und sichtbarer Ausschnitt**
  - Die Maske ist der Inkreis des Quadrats. Die vier Ecken fallen weg, das sind **21,5 % der Bildfläche**.
  - Das Foto skaliert in der Blase von 1,15 auf 1,0. Am Anfang ist deshalb nur ein Kreis mit **87 % der Kantenlänge** sichtbar.
  - **Sicherer Bereich:** Alles Wichtige liegt im zentralen Kreis mit **70 % der Kantenlänge**, also etwa 840 px bei 1200 px.
- **Oben links bleibt es ruhig und dunkel.** Dort sitzt die Glanzsichel der Blase, Gesichter oder Lichter stören an dieser Stelle. Jeder Prompt legt deshalb die Lichtquellen ausdrücklich nach oben rechts, in die Mitte oder nach unten.
- **Eine klare Form pro Bild:** eine Lichtquelle und eine Silhouette, ohne Wimmelbild. Was bei 120 px nicht als Form lesbar ist, fliegt raus.
- **Gesichter** sind angeschnitten, im Profil, von hinten oder unscharf. Das wirkt wie Erinnerung, vermeidet KI-Gesichtsfehler und verhindert Ähnlichkeit mit realen Personen.
- **Hände** sind leer und entweder bewegungsunscharf, entspannt oder aus dem Bild. Scharfe Hände im Vordergrund sind die häufigste Fehlerquelle der Generatoren.
- **Blitz nur auf der Party**, dort warm gefiltert („warm-gelled flash“). Lobby und Club bleiben ohne Blitz: Marmor und nasses Pflaster würden harte Blitzreflexe zeigen, und zwei verschiedene Lichtarten in sechs Bildern brechen die Einheitlichkeit.
- **A2 und A3 müssen sich unterscheiden.** Sie folgen im Intro direkt aufeinander und liegen beide rechts im Bild (x 74 % und x 68 %).
  - Jetski: nah, niedrig, Sand im Vordergrund, Sonne seitlich rechts.
  - Yacht: weiter, Wasser im Vordergrund, Sonne genau hinter dem Heck.
  - Im Kontaktbogen dürfen die beiden nicht wie dasselbe Motiv wirken.

---

### A1 · Party → `party`

| | |
|---|---|
| Mono-Label | `01 · SAMSTAG, 01:40` |
| Position im Intro | x 22 % / y 30 % |
| Licht | warme Pendelleuchte rechts über der Gruppe, warm gefilterter Blitz, Langzeitbelichtung |
| Alt-Text (DE) | Freunde tanzen nachts in einer Altbauwohnung unter einer warmen Lampe. |

```text
Late-night house party in a high-ceilinged old city apartment, a few friends dancing close together in the warm dark. In the centre, a woman in her late twenties in a simple dark midi dress turns mid-dance, hair swinging, laughing, her face half hidden by her hair; two friends behind her are soft, out-of-focus silhouettes. Their arms are loosely raised while dancing, hands empty and softened by motion blur; everyone looks joyful, upright and steady. One warm pendant lamp hangs just above and to the right of her as the key light, and a few tiny amber light specks from a small mirror ball dot the far wall behind them. Shot with a warm-gelled on-camera flash and a slow shutter, so the lamp light drags into soft amber streaks around the sharp moment. Candid analogue film snapshot from one warm summer evening running into night, full-bleed square 1:1 frame. Lit by one dominant warm light source; everything around it falls off into warm near-black shadow. All light is warm: low sun, tungsten or amber practical lamps. Colour palette of warm near-black (#130E0B), mango amber (#FFA940) and candle-cream highlights (#FFE2B8). Highlights roll off softly and never clip to pure white. Lifted warm blacks, muted, gently desaturated colours. The main subject is in crisp focus and reads as one clear, simple shape; the background melts into shallow depth-of-field blur, with a touch of motion blur only on moving hair, hands or fabric. Soft amber halation around light sources, very fine subtle film grain, gentle dark vignette. Feels like a fleeting, half-remembered moment: nostalgic, intimate, adult, understated luxury, never flashy. Composition made for a circular crop: the main subject sits centred inside the middle 70 percent of the frame on a simple, uncluttered background, nothing important near the edges or corners, the upper-left area calm and dark. Everyone shown is clearly a grown adult in their late twenties to mid-thirties, natural and unposed, not looking into the camera. All surfaces, clothes and objects are plain and unmarked; every hand is empty, relaxed or out of frame.
```

```text
Avoid: drinks of any kind, bottles, cans, glasses, cups, straws, ice buckets, bar counters with bottles, shot glasses, cigarettes, vaping, smoking, drunk, stumbling, swaying or sloppy behaviour, people propping each other up, anyone lying on the ground, children, teenagers, anyone who looks younger than 25, logos, brand names, readable text, letters, numbers, signs, licence plates, date stamp, timestamp, watermark, signature, red, pink, magenta, purple or violet light, red halation, blue or cyan neon, RGB LED or laser lighting, cold white light, cartoon, illustration, anime, 3D render, CGI look, plastic skin, airbrushed faces, HDR look, oversaturated colours, teal-and-orange grade, starburst lens flare, border, frame, polaroid or instant-film border, film sprocket holes, letterbox bars, collage, split image, double exposure, extra fingers, extra limbs, merged or duplicated bodies, distorted hands or faces, red party cups, beer pong, drinking games, tables or kitchen counters full of drinks, stage, DJ booth, crowd of strangers, revealing clothes, light specks all over the ceiling
```

---

### A2 · Jetski → `jetski`

| | |
|---|---|
| Mono-Label | Direction: `02 · SONNTAG, 14:20`. **Empfehlung: `02 · SONNTAG, 19:20`** (siehe Hinweis) |
| Position im Intro | x 74 % / y 64 % |
| Licht | tief stehende Abendsonne rechts hinter dem Rumpf, Seiten- und Gegenlicht |
| Alt-Text (DE) | Zwei Freunde sitzen im Abendlicht am Strand neben einem abgestellten Jetski. |

**Hinweis:** 14:20 ist heller Mittag und passt nicht zum gemeinsamen Dämmerungs- und Nacht-Look. Das Bild ist deshalb in der goldenen Stunde gedacht. Das Label sollte dazu passen, die Entscheidung fällt im Build.

```text
Golden hour on a small, quiet beach, the sun low in the sky. A plain white, unmarked jet ski stands on the sand, pulled fully out of the water, seen up close from a low angle at sand level, angled three-quarters, so its hull and handlebars form one large, clear shape in the centre of the frame; its seat is empty and the engine is off. Two friends sit on the sand just to its right, side by side, backs to the camera, plain linen towels around their shoulders, wet hair, looking out over the calm, dark-gold sea. The low sun sits at the right, just behind the hull, and rims its edges and the friends' shoulders with amber light; the rest of the beach falls into warm shadow, and the sky darkens toward the top of the frame, the upper left a deep warm dusk. Candid analogue film snapshot from one warm summer evening running into night, full-bleed square 1:1 frame. Lit by one dominant warm light source; everything around it falls off into warm near-black shadow. All light is warm: low sun, tungsten or amber practical lamps. Colour palette of warm near-black (#130E0B), mango amber (#FFA940) and candle-cream highlights (#FFE2B8). Highlights roll off softly and never clip to pure white. Lifted warm blacks, muted, gently desaturated colours. The main subject is in crisp focus and reads as one clear, simple shape; the background melts into shallow depth-of-field blur, with a touch of motion blur only on moving hair, hands or fabric. Soft amber halation around light sources, very fine subtle film grain, gentle dark vignette. Feels like a fleeting, half-remembered moment: nostalgic, intimate, adult, understated luxury, never flashy. Composition made for a circular crop: the main subject sits centred inside the middle 70 percent of the frame on a simple, uncluttered background, nothing important near the edges or corners, the upper-left area calm and dark. Everyone shown is clearly a grown adult in their late twenties to mid-thirties, natural and unposed, not looking into the camera. All surfaces, clothes and objects are plain and unmarked; every hand is empty, relaxed or out of frame.
```

```text
Avoid: drinks of any kind, bottles, cans, glasses, cups, straws, ice buckets, bar counters with bottles, shot glasses, cigarettes, vaping, smoking, drunk, stumbling, swaying or sloppy behaviour, people propping each other up, anyone lying on the ground, children, teenagers, anyone who looks younger than 25, logos, brand names, readable text, letters, numbers, signs, licence plates, date stamp, timestamp, watermark, signature, red, pink, magenta, purple or violet light, red halation, blue or cyan neon, RGB LED or laser lighting, cold white light, cartoon, illustration, anime, 3D render, CGI look, plastic skin, airbrushed faces, HDR look, oversaturated colours, teal-and-orange grade, starburst lens flare, border, frame, polaroid or instant-film border, film sprocket holes, letterbox bars, collage, split image, double exposure, extra fingers, extra limbs, merged or duplicated bodies, distorted hands or faces, anyone riding, sitting on or steering the jet ski, hands on the handlebars, jet ski in the water, spray, wake, speed, racing, life jackets, decals or stickers on the hull, printed or striped beach towels, beach bar, crowded beach, harsh midday sun, bright blue sky, sun touching the horizon behind a boat
```

---

### A3 · Yacht → `yacht`

| | |
|---|---|
| Mono-Label | `03 · FREITAG, 20:47` |
| Position im Intro | x 68 % / y 24 % |
| Licht | Sonne genau am Horizont hinter dem Heck, zwei, drei warme Decklichter |
| Alt-Text (DE) | Drei Freunde sitzen bei Sonnenuntergang auf der Badeplattform einer ankernden Yacht. |

```text
A sleek white motor yacht at anchor in a calm, sheltered bay at sunset, engines off, the water still as glass. Seen from water level a few metres behind the stern, so the stern and the low swim platform fill the centre of the frame. Three friends sit close together on the swim platform, shoulders touching, feet dangling in the water, warm rim-lit silhouettes. The helm and the upper deck are dark and empty. The sun has just touched the horizon directly behind the boat and edges the hull and the ripples in amber; two or three warm deck lights are already on. The hull is plain white and unmarked. The sky fades from amber at the horizon to warm near-black at the top of the frame, and the upper left stays dark. Candid analogue film snapshot from one warm summer evening running into night, full-bleed square 1:1 frame. Lit by one dominant warm light source; everything around it falls off into warm near-black shadow. All light is warm: low sun, tungsten or amber practical lamps. Colour palette of warm near-black (#130E0B), mango amber (#FFA940) and candle-cream highlights (#FFE2B8). Highlights roll off softly and never clip to pure white. Lifted warm blacks, muted, gently desaturated colours. The main subject is in crisp focus and reads as one clear, simple shape; the background melts into shallow depth-of-field blur, with a touch of motion blur only on moving hair, hands or fabric. Soft amber halation around light sources, very fine subtle film grain, gentle dark vignette. Feels like a fleeting, half-remembered moment: nostalgic, intimate, adult, understated luxury, never flashy. Composition made for a circular crop: the main subject sits centred inside the middle 70 percent of the frame on a simple, uncluttered background, nothing important near the edges or corners, the upper-left area calm and dark. Everyone shown is clearly a grown adult in their late twenties to mid-thirties, natural and unposed, not looking into the camera. All surfaces, clothes and objects are plain and unmarked; every hand is empty, relaxed or out of frame.
```

```text
Avoid: drinks of any kind, bottles, cans, glasses, cups, straws, ice buckets, bar counters with bottles, shot glasses, cigarettes, vaping, smoking, drunk, stumbling, swaying or sloppy behaviour, people propping each other up, anyone lying on the ground, children, teenagers, anyone who looks younger than 25, logos, brand names, readable text, letters, numbers, signs, licence plates, date stamp, timestamp, watermark, signature, red, pink, magenta, purple or violet light, red halation, blue or cyan neon, RGB LED or laser lighting, cold white light, cartoon, illustration, anime, 3D render, CGI look, plastic skin, airbrushed faces, HDR look, oversaturated colours, teal-and-orange grade, starburst lens flare, border, frame, polaroid or instant-film border, film sprocket holes, letterbox bars, collage, split image, double exposure, extra fingers, extra limbs, merged or duplicated bodies, distorted hands or faces, anyone at the wheel, on the bridge or steering, boat moving, wake, spray, speedboat action, champagne, bottles or glasses on deck, crew or staff in uniform, boat names, registration numbers, flags with emblems, marina full of boats, cold blue twilight, bright sky in the upper corners
```

**Alternative**, falls der Generator immer jemanden ans Steuer setzt: Den zweiten und dritten Satz ersetzen durch:
`Seen from the end of a wooden jetty: three friends sit close together at the edge of the jetty, feet over the water, backs to the camera, while the anchored yacht rests further out in the bay behind them, large and clearly visible in the centre of the frame, its helm dark and empty.`

---

### A4 · Hotellobby → `lobby`

| | |
|---|---|
| Mono-Label | `04 · SAMSTAG, 23:10` |
| Position im Intro | x 28 % / y 70 % |
| Licht | großer Kronleuchter oben mittig als Key-Light, Messinglampen, **kein Blitz** |
| Alt-Text (DE) | Zwei Freunde in Abendgarderobe durchqueren nachts eine Hotellobby unter einem Kronleuchter. |

```text
A grand old hotel lobby late at night: polished dark marble floor, tall columns, a sweeping staircase soft in the background, a few brass table lamps and one large chandelier glowing low and warm in the upper centre of the frame. Two friends in their early thirties in evening clothes, a long satin dress and a dark unstructured suit, cross the lobby mid-stride toward the stairs, seen from slightly behind, their heads turned in profile as they laugh with each other, the fabric softly motion-blurred. The chandelier is the key light and drops a warm pool of light around them, softly mirrored in the marble, while the far corners of the hall sink into deep warm shadow. The hall is otherwise empty and quiet. Candid analogue film snapshot from one warm summer evening running into night, full-bleed square 1:1 frame. Lit by one dominant warm light source; everything around it falls off into warm near-black shadow. All light is warm: low sun, tungsten or amber practical lamps. Colour palette of warm near-black (#130E0B), mango amber (#FFA940) and candle-cream highlights (#FFE2B8). Highlights roll off softly and never clip to pure white. Lifted warm blacks, muted, gently desaturated colours. The main subject is in crisp focus and reads as one clear, simple shape; the background melts into shallow depth-of-field blur, with a touch of motion blur only on moving hair, hands or fabric. Soft amber halation around light sources, very fine subtle film grain, gentle dark vignette. Feels like a fleeting, half-remembered moment: nostalgic, intimate, adult, understated luxury, never flashy. Composition made for a circular crop: the main subject sits centred inside the middle 70 percent of the frame on a simple, uncluttered background, nothing important near the edges or corners, the upper-left area calm and dark. Everyone shown is clearly a grown adult in their late twenties to mid-thirties, natural and unposed, not looking into the camera. All surfaces, clothes and objects are plain and unmarked; every hand is empty, relaxed or out of frame.
```

```text
Avoid: drinks of any kind, bottles, cans, glasses, cups, straws, ice buckets, bar counters with bottles, shot glasses, cigarettes, vaping, smoking, drunk, stumbling, swaying or sloppy behaviour, people propping each other up, anyone lying on the ground, children, teenagers, anyone who looks younger than 25, logos, brand names, readable text, letters, numbers, signs, licence plates, date stamp, timestamp, watermark, signature, red, pink, magenta, purple or violet light, red halation, blue or cyan neon, RGB LED or laser lighting, cold white light, cartoon, illustration, anime, 3D render, CGI look, plastic skin, airbrushed faces, HDR look, oversaturated colours, teal-and-orange grade, starburst lens flare, border, frame, polaroid or instant-film border, film sprocket holes, letterbox bars, collage, split image, double exposure, extra fingers, extra limbs, merged or duplicated bodies, distorted hands or faces, flash glare, harsh reflections on the floor, reception desk with signage, hotel name or crest, bar counter, cocktail glasses, luggage trolleys, staff, doormen or uniforms, gold-and-glitter excess, red carpet, fluorescent light, crowds, phones held up
```

---

### A5 · Garten mit Freunden → `garten`

| | |
|---|---|
| Mono-Label | Direction: `05 · SONNTAG, 19:30`. **Empfehlung: `05 · SONNTAG, 21:30`** (19:30 ist im Sommer noch heller Tag; das Bild zeigt späten Abend mit fast schwarzem Himmel). Entscheidung im Build. |
| Position im Intro | x 42 % / y 36 % |
| Licht | eine warme Lichterkette im Bogen von oben rechts als Hauptlicht, Kerzen auf dem Tisch |
| Alt-Text (DE) | Freunde lachen spätabends an einem langen Tisch im Garten unter einer Lichterkette. |

```text
A summer garden late in the evening, a few friends gathered at a long wooden table. A single string of warm festoon bulbs runs in a gentle arc from the upper right down behind the table and is the main light; small candles glow on the table. Beyond them the sky is almost black with a faint warm afterglow, the trees are soft dark silhouettes, and the upper left of the frame stays dark. In the centre, a man in his early thirties leans back laughing, while the woman beside him tells a story, one hand caught in a soft blur mid-gesture; the others at the table are soft and out of focus. Only the near edge of the table shows at the bottom of the frame: a linen cloth, candles, bread and a bowl of cut mango, pineapple and lime. Candid analogue film snapshot from one warm summer evening running into night, full-bleed square 1:1 frame. Lit by one dominant warm light source; everything around it falls off into warm near-black shadow. All light is warm: low sun, tungsten or amber practical lamps. Colour palette of warm near-black (#130E0B), mango amber (#FFA940) and candle-cream highlights (#FFE2B8). Highlights roll off softly and never clip to pure white. Lifted warm blacks, muted, gently desaturated colours. The main subject is in crisp focus and reads as one clear, simple shape; the background melts into shallow depth-of-field blur, with a touch of motion blur only on moving hair, hands or fabric. Soft amber halation around light sources, very fine subtle film grain, gentle dark vignette. Feels like a fleeting, half-remembered moment: nostalgic, intimate, adult, understated luxury, never flashy. Composition made for a circular crop: the main subject sits centred inside the middle 70 percent of the frame on a simple, uncluttered background, nothing important near the edges or corners, the upper-left area calm and dark. Everyone shown is clearly a grown adult in their late twenties to mid-thirties, natural and unposed, not looking into the camera. All surfaces, clothes and objects are plain and unmarked; every hand is empty, relaxed or out of frame.
```

```text
Avoid: drinks of any kind, bottles, cans, glasses, cups, straws, ice buckets, bar counters with bottles, shot glasses, cigarettes, vaping, smoking, drunk, stumbling, swaying or sloppy behaviour, people propping each other up, anyone lying on the ground, children, teenagers, anyone who looks younger than 25, logos, brand names, readable text, letters, numbers, signs, licence plates, date stamp, timestamp, watermark, signature, red, pink, magenta, purple or violet light, red halation, blue or cyan neon, RGB LED or laser lighting, cold white light, cartoon, illustration, anime, 3D render, CGI look, plastic skin, airbrushed faces, HDR look, oversaturated colours, teal-and-orange grade, starburst lens flare, border, frame, polaroid or instant-film border, film sprocket holes, letterbox bars, collage, split image, double exposure, extra fingers, extra limbs, merged or duplicated bodies, distorted hands or faces, wine glasses, cocktail glasses, beer bottles, jugs, carafes, cups or cans on the table, a fully laid table filling the frame, barbecue smoke, cold white LED fairy lights, multicoloured lights, zig-zag light strings across the whole sky, blue-hour sky
```

---

### A6 · Auf dem Weg zum Club → `club` (wichtigstes Bild, in 2048 × 2048 erzeugen)

| | |
|---|---|
| Mono-Label | `06 · SAMSTAG, 00:15` (rollt im Intro auf `07 · HEUTE, 22:41` bzw. `07 · HEUTE ABEND`) |
| Position im Intro | x 56 % / y 58 %, wandert dann in die Mitte und wächst auf 70vmin |
| Licht | warmes Türlicht in Mango-Bernstein am Fluchtpunkt **exakt in der Bildmitte**. Es ist der hellste Punkt des Bildes und geht im Intro nahtlos in die flache Lichtscheibe und dann in den Lichthof (Kern `#AE5E12`, Farbton 29°) über. Die Freunde verdecken es nicht. |
| Alt-Text (DE) | Drei Freunde gehen um Mitternacht zu Fuß durch eine Altstadtgasse auf einen hell erleuchteten Eingang zu. |

```text
Midnight in a narrow, pedestrian-only old-town alley, only a few metres wide and paved with cobblestones. Three friends walk away from the camera side by side, upright and steady, mid-stride, toward an open, unmarked wooden doorway at the far end of the alley. Warm mango-amber light pours out of the doorway; it is the brightest spot in the whole image and sits exactly in the centre of the frame at the vanishing point. The camera is slightly above head height, so the friends walk in the lower half of the frame, a little right of centre, and the glowing doorway stays fully visible above and beyond them. The light spills down the alley and makes the damp cobblestones shine. The friends are dark silhouettes rimmed with amber light, with slight motion blur; their faces are not visible. The house walls on both sides fall off into warm near-black; one or two old wall lanterns glow softly on the right-hand wall. Candid analogue film snapshot from one warm summer evening running into night, full-bleed square 1:1 frame. Lit by one dominant warm light source; everything around it falls off into warm near-black shadow. All light is warm: low sun, tungsten or amber practical lamps. Colour palette of warm near-black (#130E0B), mango amber (#FFA940) and candle-cream highlights (#FFE2B8). Highlights roll off softly and never clip to pure white. Lifted warm blacks, muted, gently desaturated colours. The main subject is in crisp focus and reads as one clear, simple shape; the background melts into shallow depth-of-field blur, with a touch of motion blur only on moving hair, hands or fabric. Soft amber halation around light sources, very fine subtle film grain, gentle dark vignette. Feels like a fleeting, half-remembered moment: nostalgic, intimate, adult, understated luxury, never flashy. Composition made for a circular crop: the main subject sits centred inside the middle 70 percent of the frame on a simple, uncluttered background, nothing important near the edges or corners, the upper-left area calm and dark. Everyone shown is clearly a grown adult in their late twenties to mid-thirties, natural and unposed, not looking into the camera. All surfaces, clothes and objects are plain and unmarked; every hand is empty, relaxed or out of frame.
```

```text
Avoid: drinks of any kind, bottles, cans, glasses, cups, straws, ice buckets, bar counters with bottles, shot glasses, cigarettes, vaping, smoking, drunk, stumbling, swaying or sloppy behaviour, people propping each other up, anyone lying on the ground, children, teenagers, anyone who looks younger than 25, logos, brand names, readable text, letters, numbers, signs, licence plates, date stamp, timestamp, watermark, signature, red, pink, magenta, purple or violet light, red halation, blue or cyan neon, RGB LED or laser lighting, cold white light, cartoon, illustration, anime, 3D render, CGI look, plastic skin, airbrushed faces, HDR look, oversaturated colours, teal-and-orange grade, starburst lens flare, border, frame, polaroid or instant-film border, film sprocket holes, letterbox bars, collage, split image, double exposure, extra fingers, extra limbs, merged or duplicated bodies, distorted hands or faces, cars, taxis, scooters, motorbikes, bicycles, parked vehicles, headlights, readable club sign, neon lettering, white or yellow doorway light, people blocking the doorway, arms around shoulders, linked arms, queue, bouncers, police lights, falling rain, lanterns on the left wall
```

---

### A.4 Mono-Labels auf einen Blick

| Blase | Datei | Label | Position |
|---|---|---|---|
| 01 | `party` | `01 · SAMSTAG, 01:40` | x 22 / y 30 |
| 02 | `jetski` | `02 · SONNTAG, 14:20` → Empfehlung `02 · SONNTAG, 19:20` | x 74 / y 64 |
| 03 | `yacht` | `03 · FREITAG, 20:47` | x 68 / y 24 |
| 04 | `lobby` | `04 · SAMSTAG, 23:10` | x 28 / y 70 |
| 05 | `garten` | `05 · SONNTAG, 19:30` → Empfehlung `05 · SONNTAG, 21:30` | x 42 / y 36 |
| 06 | `club` | `06 · SAMSTAG, 00:15` → rollt auf `07 · HEUTE, hh:mm` | x 56 / y 58 → Mitte |

**Achtung Build:** `src/content/occasions.ts` hat noch abweichende Zeitstempel und `.jpg`-Pfade. Im Build auf die Werte oben (bzw. die gewählten Empfehlungen) und auf die AVIF-Dateien umstellen, z. B. `SONNTAG, 14:10` → `14:20`, `DONNERSTAG, 23:30` → `SAMSTAG, 23:10`.

### A.5 Nachbearbeitung: ein Grading für alle sechs Bilder

Die Generatoren streuen. Den gleichen Look garantiert erst **dieselbe Korrektur auf allen sechs Bildern**:

1. **Zuschnitt:** 1:1. Das Hauptmotiv liegt im zentralen 70-%-Kreis, oben links ist es ruhig.
2. **Sättigung −20 %** als Startwert. Der Style-Block nennt bewusst keine Prozentzahl, damit nicht doppelt entsättigt wird. Wirkt ein Bild danach schlammig, nur −10 %.
3. **Schwarz- und Weißpunkt auf die Palette legen**, per Gradationskurve pro Kanal (Photoshop, Affinity, Lightroom oder das kostenlose Photopea im Browser):
   - Rot: 0 → 19, 255 → 255
   - Grün: 0 → 14, 255 → 226
   - Blau: 0 → 11, 255 → 184

   Damit wird Schwarz zu `#130E0B` (= Tinte und Intro-Schwarz, die Blasenränder verschmelzen so mit dem Hintergrund) und Weiß zu `#FFE2B8`. Wirkt das zu sepia, setz den Weißpunkt nur auf `#FFF0DB` (halbe Stärke) und lass den Schwarzpunkt, wie er ist.

   *Im Build-Skript mit sharp* (über Next.js installiert, Version 0.35.5): `.modulate({ saturation: 0.8 }).linear([0.9255, 0.8314, 0.6784], [19, 14, 11])`. sharp führt `modulate` intern immer vor `linear` aus, die Reihenfolge stimmt also. Ein Tausch der Aufrufe würde daran nichts ändern.
4. **Farbton prüfen:**
   - Die Lichter (Lampen, Himmel, Türlicht, Lichtflächen) liegen im Bernstein-Bereich, Farbton **etwa 22–40°**. Das entspricht der Direction: Tropical-Signal 33°, Lichthof-Kern 29°, Kerzencreme 36°.
   - Töne zwischen 280° und 345° (Violett bis Pink) selektiv entsättigen.
   - Hauttöne nicht anfassen.
   - Einen Blaustich am Himmel anwärmen.
5. **Korn:**
   - Feines Korn aus der Generierung darf bleiben. Was nach dem Verkleinern auf 640 px grob wirkt, leicht entrauschen.
   - Das sichtbare Korn liefert im Intro die CSS-Ebene (7 %), gleichmäßig über alle Blasen.
   - Grobes Bildkorn würde die AVIF-Dateien bis etwa doppelt so groß machen.
6. **Kontaktbogen:**
   - Alle sechs Bilder als Kreise nebeneinander auf `#130E0B` legen, einmal in 200 px und einmal in 120 px.
   - Kein Bild darf deutlich heller, kälter oder bunter sein; Ausreißer über die Belichtung angleichen.
   - A2 und A3 dürfen nicht wie dasselbe Motiv wirken.

### A.6 Export und Ablage

| Datei | Zweck | Maße | Format | Zielgröße |
|---|---|---|---|---|
| `/public/intro/<name>.jpg` | Master (Archiv, optional später für einen Abschnitt „Der Abend“ via `next/image`; die aktuelle Seite zeigt nur den Hero) | 1200 × 1200 (club 2048 × 2048) | JPG, Qualität ≈ 82, sRGB | **150–220 KB** (club ≤ 450 KB) |
| `/public/intro/<name>.avif` | **lädt das Intro** | 640 × 640 (club **1300 × 1300**) | AVIF | **≤ 55 KB** (club **≤ 150 KB**) |
| `/public/intro/<name>.webp` | Fallback ohne AVIF | wie AVIF | WebP | ≤ 75 KB (club ≤ 200 KB) |

`<name>` ∈ `party`, `jetski`, `yacht`, `lobby`, `garten`, `club`. Mindestens die JPG-Master musst du liefern. AVIF und WebP kann der Build-Schritt per sharp aus den Mastern erzeugen.

**Warum das Intro nicht die 150–220-KB-Dateien lädt:** Bei sechs Bildern zu je etwa 185 KB wären es allein ≈ 1,1 MB. Zusammen mit dem 3D-Code und dem Basis-JS (≈ 460 KB), dem Etikett (≈ 180 KB) und den Schriften (≈ 90 KB) läge die Seite über 1,8 MB und damit über dem Budget von 1,5 MB. Darum lädt das Intro nur die AVIF-Dateien: 5 × ≤ 55 KB + 150 KB ≈ **425 KB**. Das entspricht genau dem Posten in der Design-Direction.

**Reichen die Auflösungen?**
- **Blasen 01–06:** Sie sind 16–24vmin groß, auf Mobil im Hochformat ×1,6, also höchstens ≈ 38vmin (≈ 150 px auf 390 px Breite). Mit Startskalierung 1,15 und DPR 3 braucht das ≈ 520 px, also reichen 640 px.
- **Club-Blase:** Sie braucht 1300 px für 70vmin bei DPR 2 auf einem Bildschirm mit 900 px Höhe. Auf 1440p-Bildschirmen wird minimal hochskaliert. Das ist unkritisch, weil die Blase in dieser Phase ohnehin zur flachen Lichtscheibe wird.

---

## B. Optionale Foto-Texturen für die schwebenden Zutaten

**Wofür:** Die Direction will die Zutaten mit einem Atlas aus Albedo und Normal-Map oder als CC0-glTF umsetzen, „nie rein prozedural“. Diese Fotos sind die Quelle für den Albedo-Atlas. Die Normal-Map leitet der Build aus dem Albedo ab; sie wird nicht generiert. Zuordnung laut Direction: Tropical = Maracuja · Mango · Ananas, Limette Minze = Limette · Minze · Eis.

**Wichtigster Unterschied zu A:** Texturen werden **flach und schattenlos** beleuchtet. Licht, Glanz und Randlicht kommen in der 3D-Szene vom Key-Light und vom Lichthof. Gebackene Glanzlichter oder Schatten würden sich beim Drehen falsch mitbewegen.

### B.1 Gemeinsamer Textur-Block (in den Prompts schon enthalten)

```text
Professional studio macro photograph made as a texture source for a 3D model. Square 1:1 frame. Camera exactly perpendicular to the object, orthographic top-down view, no perspective distortion. The object is centred and fills about 80 percent of the frame with an even margin on all sides. Isolated on a pure, flat black background (#000000): no table, no surface, no cast shadow, no reflection. Soft, even, shadowless light from all sides, like a light tent with cross-polarised light: no specular highlights, no rim light, no glare. Sharp from edge to edge, no depth-of-field blur, no vignette, no grain, no colour grading. True-to-life natural colours, slightly muted, photoreal micro detail.
```

Gemeinsamer Avoid-Block für B: `cartoon, illustration, 3D render, CGI, candy colours, neon colours, oversaturated, glossy highlights, water droplets, cast shadows, surfaces, plates, cutting boards, knives, hands, glasses, drinks, multiple objects, cropped object, text, watermark`

### B1 · Limettenscheibe, Draufsicht → `lime-wheel` (Limette Minze)
Wird verwendet für die Deckflächen eines flachen Zylinders. Den Limettenschnitz baut der Build aus Scheibe und Schale; dafür ist kein eigenes Bild nötig.
```text
A single fresh lime wheel, about 5 mm thick, cut cleanly straight across, seen exactly from above. Thin dark-green rind (#4E8A2A), a narrow pale pith ring, juicy pale-green segments with fine radial membranes and a small white centre, the flesh slightly translucent. Professional studio macro photograph made as a texture source for a 3D model. Square 1:1 frame. Camera exactly perpendicular to the object, orthographic top-down view, no perspective distortion. The object is centred and fills about 80 percent of the frame with an even margin on all sides. Isolated on a pure, flat black background (#000000): no table, no surface, no cast shadow, no reflection. Soft, even, shadowless light from all sides, like a light tent with cross-polarised light: no specular highlights, no rim light, no glare. Sharp from edge to edge, no depth-of-field blur, no vignette, no grain, no colour grading. True-to-life natural colours, slightly muted, photoreal micro detail.
```
`Avoid: cartoon, illustration, 3D render, CGI, candy colours, neon colours, oversaturated, glossy highlights, water droplets, cast shadows, surfaces, plates, cutting boards, knives, hands, glasses, drinks, multiple objects, cropped object, text, watermark, whole limes, wedges, lemon, yellow tones, dried or browned edges`

### B2 · Minzblatt → `mint-leaf` (Limette Minze)
Wird auf eine leicht gebogene Ebene mit Alpha gelegt; die Wölbung kommt aus der Geometrie. **Zusätzlich eine Variante auf Weiß erzeugen** (`mint-leaf-white`): Dazu im Prompt `pure, flat black background (#000000)` durch `pure, flat white background (#FFFFFF)` ersetzen. Dunkle Blattränder verschwinden im Schwarz, und auf Weiß lässt sich das Blatt sauber freistellen.
```text
A single fresh spearmint leaf lying perfectly flat, seen exactly from above, short stem pointing down, finely serrated edge, clearly visible network of veins, matte natural mid-green with slightly darker edges, no curl, no folds, no holes. Professional studio macro photograph made as a texture source for a 3D model. Square 1:1 frame. Camera exactly perpendicular to the object, orthographic top-down view, no perspective distortion. The object is centred and fills about 80 percent of the frame with an even margin on all sides. Isolated on a pure, flat black background (#000000): no table, no surface, no cast shadow, no reflection. Soft, even, shadowless light from all sides, like a light tent with cross-polarised light: no specular highlights, no rim light, no glare. Sharp from edge to edge, no depth-of-field blur, no vignette, no grain, no colour grading. True-to-life natural colours, slightly muted, photoreal micro detail.
```
`Avoid: cartoon, illustration, 3D render, CGI, candy colours, neon colours, oversaturated, glossy highlights, water droplets, cast shadows, surfaces, plates, cutting boards, knives, hands, glasses, drinks, multiple objects, cropped object, text, watermark, sprig with several leaves, basil, wilted or torn leaf, shiny wet look`

### B3 · Maracuja-Hälfte, Draufsicht → `passionfruit-half` (Tropical)
Wird verwendet für die Schnittfläche einer Halbkugel. **Nur die gelbe Maracuja verwenden**; die violette Sorte verstößt gegen die Regel „kein Violett“ (Direction: „Maracuja als gelbe Sorte bzw. nur das Fruchtfleisch“).
```text
One yellow passion fruit (golden maracuja) cut exactly in half, the cut half seen straight from above. Smooth golden-yellow rind ring, a thin white inner layer, filled with moist, jelly-like golden-yellow pulp and dark black-brown seeds in translucent jelly sacs. Professional studio macro photograph made as a texture source for a 3D model. Square 1:1 frame. Camera exactly perpendicular to the object, orthographic top-down view, no perspective distortion. The object is centred and fills about 80 percent of the frame with an even margin on all sides. Isolated on a pure, flat black background (#000000): no table, no surface, no cast shadow, no reflection. Soft, even, shadowless light from all sides, like a light tent with cross-polarised light: no specular highlights, no rim light, no glare. Sharp from edge to edge, no depth-of-field blur, no vignette, no grain, no colour grading. True-to-life natural colours, slightly muted, photoreal micro detail.
```
`Avoid: cartoon, illustration, 3D render, CGI, candy colours, neon colours, oversaturated, glossy highlights, water droplets, cast shadows, surfaces, plates, cutting boards, knives, hands, glasses, drinks, multiple objects, cropped object, text, watermark, purple passion fruit, wrinkled dark purple skin, pink or red tones, spoon`

### B4 · Ananas-Stück → `pineapple-wedge` (Tropical)
Wird verwendet für die Schnittflächen eines Keils.
```text
A single pineapple wedge cut from a thick ring, lying on its side so the large flat cut face looks straight up at the camera: golden-yellow fibrous flesh with fine radial fibres, a paler core strip at the narrow tip, the brown-green spiky rind along the outer curved edge. Professional studio macro photograph made as a texture source for a 3D model. Square 1:1 frame. Camera exactly perpendicular to the object, orthographic top-down view, no perspective distortion. The object is centred and fills about 80 percent of the frame with an even margin on all sides. Isolated on a pure, flat black background (#000000): no table, no surface, no cast shadow, no reflection. Soft, even, shadowless light from all sides, like a light tent with cross-polarised light: no specular highlights, no rim light, no glare. Sharp from edge to edge, no depth-of-field blur, no vignette, no grain, no colour grading. True-to-life natural colours, slightly muted, photoreal micro detail.
```
`Avoid: cartoon, illustration, 3D render, CGI, candy colours, neon colours, oversaturated, glossy highlights, water droplets, cast shadows, surfaces, plates, cutting boards, knives, hands, glasses, drinks, multiple objects, cropped object, text, watermark, whole pineapple, pineapple rings, canned pineapple, syrup, cocktail umbrella`

### B5 · Ananasblatt → `pineapple-leaf` (Tropical, optional)
Optionale Ergänzung zum Keil, nicht von der Direction gefordert: 1–2 schmale Blätter, gebaut als gebogene Ebene mit Alpha. Machen sie die Szene unruhig, weglassen. Auch hier zusätzlich eine Variante auf Weiß erzeugen.
```text
A single long pineapple crown leaf lying perfectly flat, seen exactly from above, narrow and pointed, deep green (#2F4A22) with a faint silvery bloom and finely serrated edges. Professional studio macro photograph made as a texture source for a 3D model. Square 1:1 frame. Camera exactly perpendicular to the object, orthographic top-down view, no perspective distortion. The object is centred and fills about 80 percent of the frame with an even margin on all sides. Isolated on a pure, flat black background (#000000): no table, no surface, no cast shadow, no reflection. Soft, even, shadowless light from all sides, like a light tent with cross-polarised light: no specular highlights, no rim light, no glare. Sharp from edge to edge, no depth-of-field blur, no vignette, no grain, no colour grading. True-to-life natural colours, slightly muted, photoreal micro detail.
```
`Avoid: cartoon, illustration, 3D render, CGI, candy colours, neon colours, oversaturated, glossy highlights, water droplets, cast shadows, surfaces, plates, cutting boards, knives, hands, glasses, drinks, multiple objects, cropped object, text, watermark, whole pineapple crown, palm leaf, yellowed or dry leaf`

### B6 · Eiswürfel → `ice-cube` (beide Sorten, auch für Crushed Ice)
**Eigenes Licht (Dunkelfeld):** Auf Schwarz zeigt Eis nur seine Kanten, Risse und Bläschen. Der Build nutzt das Bild als Detail- und Rauheitskarte auf einem abgerundeten Würfel aus MeshPhysical mit Clearcoat (Direction: keine Transmission). Das Bild bleibt **farbneutral**; die Tönung in Bernstein oder Limette kommt aus der Szene.
```text
A single clear ice cube, one flat face turned straight toward the camera, slightly rounded melting edges, crystal clear with a few fine internal fracture lines and tiny trapped air bubbles near the centre. Isolated on a pure, flat black background (#000000), no surface, no reflection. Dark-field lighting: light comes only from the sides and from behind, so only the cube's edges, cracks and bubbles glow softly in neutral, colourless white while the clear body stays nearly black. Square 1:1 frame, camera exactly perpendicular, orthographic, the cube centred and filling about 80 percent of the frame, sharp from edge to edge, no vignette, no grain, no colour grading, photoreal macro detail.
```
`Avoid: blue tint, amber tint, coloured light, crushed ice, multiple cubes, glass, drink, water puddle, frost cloud, smoke, cartoon, 3D render, CGI, text, watermark`

### B7 · Mangowürfel → `mango-cube` (Tropical, optional)
Mango gehört zur Sorte Tropical (Maracuja · Mango · Ananas). Die Textur liefert nur Farbe und Faser. Ein Leuchten im Gegenlicht entsteht, wenn überhaupt, im Material (z. B. leichter Emissive- oder Sheen-Anteil), nicht über Transmission; die Direction schließt Transmission aus.
```text
A single cube of ripe mango flesh, about 2 cm, one face looking straight at the camera: deep golden-orange, fine fibrous texture, moist but without highlights, edges cleanly cut. Professional studio macro photograph made as a texture source for a 3D model. Square 1:1 frame. Camera exactly perpendicular to the object, orthographic top-down view, no perspective distortion. The object is centred and fills about 80 percent of the frame with an even margin on all sides. Isolated on a pure, flat black background (#000000): no table, no surface, no cast shadow, no reflection. Soft, even, shadowless light from all sides, like a light tent with cross-polarised light: no specular highlights, no rim light, no glare. Sharp from edge to edge, no depth-of-field blur, no vignette, no grain, no colour grading. True-to-life natural colours, slightly muted, photoreal micro detail.
```
`Avoid: cartoon, illustration, 3D render, CGI, candy colours, neon colours, oversaturated, glossy highlights, water droplets, cast shadows, surfaces, plates, cutting boards, knives, hands, glasses, drinks, multiple objects, cropped object, text, watermark, mango skin, peel, hedgehog-cut mango, red or pink tones`

### B.2 Export und Ablage der Texturen
- **Erzeugen:** 1:1, mindestens 1024 px, besser 2048 px.
- **Ablage der Rohdaten:** `design/textures/<name>.png` (PNG, sRGB) **außerhalb von `/public`**, damit die Rohdaten nicht ausgeliefert werden. Freistellen per Hintergrund-Entfernung oder über die Weiß-Variante.
- **Atlas:** Der Build packt die Bilder zu Atlanten pro Sorte, Albedo und Normal getrennt mit gleicher Aufteilung.
  - Tropical hat bis zu 5 Motive (Maracuja, Ananas-Keil, Ananasblatt, Eis, Mango), Limette Minze hat 3 (Limette, Minze, Eis).
  - **Mobil und Intro:** 1024 × 512 mit Zellen zu 256 px (8 Zellen). Das reicht für beide Sorten.
  - **Desktop:** optional 2048 × 1024 mit 512-px-Zellen, nur wenn Objekte groß im Vordergrund stehen. Diese Atlanten laden nach dem Intro.
  - Dateien: `/public/scene/atlas-tropical.avif` (+ `-normal`), `/public/scene/atlas-limette-minze.avif` (+ `-normal`).
  - Budget: **≤ 80 KB für Albedo und Normal der Standard-Sorte zusammen** (Posten „Atlas“ der Direction). Der Atlas der zweiten Sorte lädt erst nach 7 s im Leerlauf.
- **Farbcheck:** Limette bleibt natürlich grün (kein Neon, kein Gelbstich), Maracuja gelb und nie violett, Mango orange und nie rosa.

---

## C. Warum es kein Hintergrund- oder Lichthof-Plate gibt

Der Lichthof wird je Sorte **nicht** als Bild erzeugt:

1. **Er ist animiert:** Er entsteht aus der platzenden Blase 06, mit derselben Mitte und demselben Radius als Shader-Uniform. Beim Sortenwechsel läuft eine Welle in OKLab durch, und das Key-Light dimmt dabei auf 70 %. Ein Foto kann weder wachsen noch umfärben.
2. **Die Farben sind nachgerechnet:** Alle WCAG-Werte der Direction hängen an exakten Hex-Werten, zum Beispiel Papier auf dem Kern mit 4,10 und Infotext auf der Ruhezone mit 11,81. Ein generiertes Plate hätte unkontrollierte Helligkeiten und würde diese Kontraste brechen.
3. **Licht aus einem Guss:** Dose, Spiegelungen, Zutaten und Lichtpunkte bekommen ihr Licht aus derselben Szene. Ein gebackenes Plate würde nicht zur Spiegelung der Dose passen, sobald sie sich mit der Maus dreht.
4. **Budget:** Der Shader kostet 0 KB statt 100–250 KB pro Sorte und bleibt auf jeder Auflösung scharf.
5. **Korn und Vignette** kommen ohnehin aus der CSS-Ebene bzw. dem Postprocessing.

Aus denselben Gründen werden auch **Dose, Mini-Dosen, Poster und Lichtpunkte** nicht generiert. Die Mini-Dosen und das Poster werden nach dem Etikett-Upload aus der fertigen Szene gerendert. Eine KI kann Etikett, Schrift und Pflichttexte nicht exakt wiedergeben.

---

## D. Etikett-Spezifikation (Upload je Sorte)

### D.1 Format und Seitenverhältnis

| | **Sleek 330 ml** (Direction, Standard im Build) | Standard 330 ml (falls doch diese Dose kommt) |
|---|---|---|
| Dose (Durchmesser × Höhe) | 58 × 146 mm | 66 × 115 mm |
| Umfang (π × Durchmesser) | ≈ 182,2 mm | ≈ 207,3 mm |
| Bedruckte Zylinderhöhe (ohne Schulter, Hals, Bodenrundung) | ≈ 124 mm | ≈ 99 mm |
| Verhältnis Umfang : Höhe | **≈ 1,47 : 1** | **≈ 2,09 : 1** |
| **Pixelmaß** | **2048 × 1400 px** (rechnerisch 1394, auf ein Vielfaches von 8 gerundet) | **2048 × 976 px** (rechnerisch 978, gerundet) |
| Auflösung | ≈ 11,24 px/mm | ≈ 9,88 px/mm |

- Die Maße sind Richtwerte. Maßgeblich ist die **Druckvorlage (Dieline) des Dosenherstellers bzw. Abfüllers**. Liegt sie vor: den zylindrischen Bereich der flachen Abwicklung ausschneiden und auf 2048 px Breite skalieren; die Höhe ergibt sich daraus.
- Das alte Maß 2048 × 1024 aus `docs/site-structure.md` passt zu keiner der beiden Dosen. Bei der Standarddose wäre das Bild etwa 5 % zu hoch und würde gestaucht. Es ist damit ersetzt.
- Für spätere Fotos oder Druck kann zusätzlich ein Master in doppelter Größe geliefert werden (4096 × 2800 px), das ist optional.

### D.2 Ausrichtung und Naht

- **Bildmitte (x = 1024) = Vorderseite.** Sie zeigt im Ruhezustand zum Betrachter.
- **Linke und rechte Bildkante treffen sich hinten an der Naht** (Bildstoß).
- **Oben im Bild = Deckelseite.** Nicht spiegeln, flach abwickeln wie die Druckvorlage.
- **Die Naht muss nahtlos sein:** Hintergrund und Muster laufen über die Kante durch; Spalte 0 schließt an Spalte 2047 an. Zum Testen das Bild um 50 % horizontal verschieben (Photoshop: Filter → Sonstige → Verschiebungseffekt) und prüfen, ob in der Mitte eine Kante sichtbar ist.
- Die Rückseite ist **sichtbar**: Beim Sortenwechsel dreht sich die Dose um 180°. Sie muss also gestaltet sein und darf kein bloßer Textblock sein.

### D.3 Zonen und Sicherheitsabstände (Sleek, 2048 × 1400)

```text
x:  0    120         512     717            1024            1331     1536         1928  2048
    |Naht| Rückseite  | Seite |  KERNZONE (Front: Marke) | Seite | Rückseite   |Naht|
y:  0–24      Beschnitt: nur Hintergrund läuft weiter
    0–140     keine Schrift/kein Logo (Schulter-Spiegelung, Bloom-Glühen der Oberkante)
    140–1316  Inhalt
    1316–1400 keine Schrift (Bodenkante); 1376–1400 Beschnitt
```

| Zone | x-Bereich (px) | Bogen | Inhalt |
|---|---|---|---|
| **Kernzone** | 717–1331 (mittlere 30 %) | ≈ 108° | Wortmarke „[MARKE]“, Sortenname. Bleibt bei ±14° Mausdrehung und 9° Neigung voll lesbar. |
| **Sichtzone** | 512–1536 (mittlere 50 %) | 180° | Sortenmotiv, „330 ml“, Warnhinweis § 9 JuSchG (siehe D.5) |
| **Rückseite** | 120–512 und 1536–1928 | | Pflichtangaben: Zutaten, % vol (sachlich), Allergene, Hersteller, Pfandzeichen |
| **Naht** | 0–120 und 1928–2048 | je ≈ 21° | nur durchlaufender Hintergrund oder Muster; keine Schrift, kein Logo, keine Kante |

Bei der Standarddose (2048 × 976) gelten dieselben Anteile: Naht je 120 px, oben 10 % (≈ 98 px), unten 6 % (≈ 59 px) frei, Beschnitt je 24 px.

### D.4 Datei

- **PNG, 8 bit pro Kanal, RGB, sRGB-Profil eingebettet**
- **ohne Transparenz:** Alpha weglassen. Transparente Bereiche würden je nach Material schwarz oder falsch gerendert.
- ohne Ebenen, Schrift in Pixel umgewandelt
- Die Dateigröße ist egal, das ist der Master
- **Nur die flache Abwicklung:** kein Mockup, keine eingebauten Glanzlichter, Schatten, Metallverläufe oder Lichtbänder. Glanz und Licht kommen aus dem 3D-Material.
- Druckdaten in CMYK oder Pantone nach sRGB umwandeln. Metallic- und Sonderfarben werden als ihre Bildschirmfarbe angelegt.

### D.5 Gestaltung für die Nachtszene und das Recht

- **Kein großflächiges Reinweiß.** Die hellste Fläche liegt etwa bei Papier `#F5EDE0`, sonst überstrahlt Weiß unter dem warmen Key-Light im Bloom.
- **Die Grundfarbe ist nicht die Kernfarbe des Lichthofs,** also nicht Tropical `#AE5E12` oder ähnlich und nicht Limette `#3A7A45` oder ähnlich. Sonst verschwindet die Dose im Licht. Gut funktionieren eine dunkle Basis (Tinte oder Tiefe) oder Papier mit dem Signal als Akzent.
- **Mindestmaße:**
  - Linien ≥ 3 px
  - Versalhöhe auf der Front ≥ 28 px (≈ 11 px am Desktop-Bildschirm), auf der Rückseite ≥ 20 px
  - keine feinen Streifen oder Raster, sie flimmern beim Drehen (Moiré)
- **Keine Comic-Optik.** Früchte sind fotoreal oder grafisch reduziert.
- **Alkoholgehalt** klein und sachlich, kein Gestaltungselement.
- **Keine Gesundheitsbegriffe** wie „leicht“, „natürlich“ oder „bekömmlich“.
- **Warnhinweis bei Alkopops** (ein Vodka-RTD unter 10 % vol fällt wahrscheinlich darunter): „Abgabe an Personen unter 18 Jahren verboten, § 9 Jugendschutzgesetz“.
  - Er steht **in gleicher Schriftart, Größe und Farbe wie der Marken- oder Phantasiename**.
  - Das von Anfang an in der Sichtzone einplanen, weil er bei großer Wortmarke entsprechend groß wird.
  - Vom Lebensmittel- bzw. Werberechtler bestätigen lassen.

### D.6 Varianten je Sorte

| Datei | Inhalt | Pflicht |
|---|---|---|
| `design/labels/tropical.png` | Etikett Tropical | **ja** |
| `design/labels/limette-minze.png` | Etikett Limette Minze | **ja** |
| `design/labels/tropical-metal.png` | Graustufen-Maske, 1024 × 700 (Sleek): Weiß = blankes Alu, Schwarz = deckende Druckfarbe | optional |
| `design/labels/limette-minze-metal.png` | dito | optional |

- **Beide Etiketten haben dasselbe Layout.** Die Wortmarke steht an exakt derselben Stelle und in derselben Größe; es wechseln nur Farben, Sortenname und Motiv. Grund: Beim Wechsel wird das neue Etikett auf der abgewandten Hälfte eingemischt. Bei gleichem Layout bleibt die Marke stehen und der Wechsel liest sich als Farbwechsel derselben Marke.
- **Deckel und Lasche:** Farbe angeben (Alu natur oder eingefärbt). Dafür ist keine Datei nötig, das wird als Material gesetzt.
- **Nach dem Upload (Build):**
  - Umwandlung in AVIF bzw. KTX2 mit ≈ 180 KB, dazu eine Mobilversion in 1024 × 700
  - Pfade in `src/content/flavors.ts` (Feld `label`) eintragen, z. B. `label: "/can/tropical/label.webp"`; die Datei liegt in `public/can/<sorte>/label.webp`
  - Mini-Dosen (≈ 40 KB) und Poster (≈ 60 KB) aus der Szene rendern
  - Die PNG-Master liegen in `design/labels/` außerhalb von `/public`, werden also nicht ausgeliefert und zählen nicht zum Budget

---

## Checklisten

### Konsistenz und Maske (A)
- [ ] Alle sechs Bilder mit **unverändertem** Style-Block erzeugt, ab Bild 2 mit A6 als reiner **Stil**referenz (falls Artlist das anbietet), ohne übernommene Komposition
- [ ] Identisches Grading auf allen sechs: Sättigung −20 % (Startwert), Kurven auf `#130E0B` und `#FFE2B8`
- [ ] Kontaktbogen auf `#130E0B` in 200 px und 120 px: kein Ausreißer in Helligkeit, Wärme oder Sättigung
- [ ] Kreistest bei 120 px und 200 px: Jede Szene ist in einer Sekunde erkennbar
- [ ] A2 Jetski und A3 Yacht sind auf einen Blick unterscheidbar (nah mit Sand gegen weit mit Wasser)
- [ ] Hauptmotiv im zentralen 70-%-Kreis, **oben links dunkel** (kein Himmel, keine Lampe, keine Lichterkette)
- [ ] Lichter bei 22–40°; kein Pink, Magenta, Violett, Rot-Halation, Neon und kein Blaustich (Pipette auf Lichter und Schatten)
- [ ] A6: Der hellste Punkt liegt exakt in der Bildmitte, ist mango-bernstein (nicht weiß, nicht gelb) und wird von niemandem verdeckt
- [ ] Party als einziges Bild mit Blitz-Look; Lobby ohne Blitzreflexe auf dem Marmor
- [ ] Keine KI-Fehler: Fingerzahl, zusätzliche Gliedmaßen, verschmolzene oder doppelte Körper, verzerrte Gesichter, Pseudo-Schrift auf Schildern, **Datumsstempel in der Ecke**, Filmränder oder Letterbox-Balken
- [ ] Export: JPG-Master 150–220 KB, AVIF ≤ 55 KB (Club ≤ 150 KB), Intro-Summe ≈ 425 KB
- [ ] `src/content/occasions.ts`: Zeitstempel und Bildpfade (`.avif`) an A.4 angeglichen

### Recht (A und B)
- [ ] **Kein Getränk im Bild**, auch nicht unscharf im Hintergrund: keine Gläser, Flaschen, Dosen, Becher, Strohhalme, Shots oder Trinkspiele. Besonders den Gartentisch und den Hintergrund der Party prüfen.
- [ ] Niemand wirkt betrunken: kein Taumeln, keine glasigen Augen, kein Stützen oder Unterhaken, kein Liegen. Niemand raucht oder dampft.
- [ ] Alle Personen wirken klar erwachsen (25+), keine Kinder, keine Teenager-Codes
- [ ] **Fahrzeuge:**
  - [ ] Der Jetski steht an Land, der Sitz ist leer, niemand hält den Lenker
  - [ ] Die Yacht ankert, der Steuerstand ist leer
  - [ ] Der Weg zum Club wird zu Fuß gezeigt, ohne Auto, Taxi, Roller oder Fahrrad
- [ ] Keine Logos, Markennamen, Schiffs- oder Hotelnamen, Kennzeichen und keine lesbaren Schilder; Handtücher und Kleidung ohne Aufdruck
- [ ] **Kein Status-Protz** (Werberat: Alkohol nicht mit sozialem oder sexuellem Erfolg verknüpfen): Yacht und Lobby zurückhaltend, kein Personal, kein Champagner, keine aufreizende Kleidung
- [ ] Keine Ähnlichkeit mit realen, bekannten Personen; im Zweifel verwerfen
- [ ] Früchte fotoreal, keine Bonbonfarben; Maracuja gelb
- [ ] **Artlist-Nutzungsbedingungen** für den gewählten Plan geprüft: kommerzielle Nutzung ohne Namensnennung erlaubt. Prompt, Modell und Datum je Bild sind protokolliert.
- [ ] **EU AI Act, Art. 50 (seit 2. Aug. 2026):** Mit dem Rechtsberater klären, ob die realistisch wirkenden KI-Personenbilder kennzeichnungspflichtig sind. Eine einfache Lösung wäre ein Bildnachweis „Bilder KI-generiert“ im Impressum.
- [ ] Bilder zusammen mit „Heute / Nacht.“ und dem Infotext vor dem Launch vom Werberechtler prüfen lassen, insbesondere die Abfolge Jetski/Yacht → Dose

### Etikett (D)
- [ ] 2048 × 1400 px (Sleek) bzw. 2048 × 976 px (Standard), PNG RGB sRGB, ohne Alpha
- [ ] Bildmitte ist die Front, die Naht nahtlos (Verschiebetest gemacht)
- [ ] Marke in der Kernzone (x 717–1331), Naht- und Randzonen frei von Schrift
- [ ] Flache Abwicklung ohne Mockup-Licht; kein großflächiges Reinweiß; Grundfarbe hebt sich vom Lichthof-Kern ab
- [ ] Gleiches Layout bei beiden Sorten
- [ ] Warnhinweis nach § 9 JuSchG in Schrift, Größe und Farbe des Markennamens; rechtlich bestätigt
