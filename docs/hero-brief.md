# Hero-Brief (Intro-Sequenz)

Dieser Brief ist der Prompt für die Hero-Runde in Claude Code. Zwei Runden: erst Design-Direction freigeben, dann bauen. Platzhalter in eckigen Klammern ersetzen.

## Vorbedingungen

- Assets in `/public/intro/` (`party.jpg`, `jetski.jpg`, `yacht.jpg`, `lobby.jpg`, `garten.jpg`, `club.jpg`) und `/public/can/label.png`. Gleiches Licht und gleicher Look (Nacht, warmes Licht, leichte Körnung).
- Design-Tokens aus der Galerie nach `src/styles/theme.css` übernehmen (Platzhalter liegt dort).
- Nur Bausteine aus `tokens/licenses.md` der Galerie.

## Prompt

```text
/design-taste

Ich baue eine Landingpage für ein neues alkoholisches Party-Getränk: [MARKENNAME], [SORTE/GESCHMACK], Dose 330 ml.
Zielgruppe: 18–30, Nachtleben, Sommer, Freunde. Stimmung: Nacht, warmes Licht, Luxus mit Leichtigkeit, nicht protzig.

Das Repo steht (Next.js App Router, TS strict, Tailwind v4, Framer Motion, R3F). Struktur und Sections in docs/site-structure.md.
Du baust jetzt NUR src/components/sections/Hero.tsx und src/components/age-gate/AgeGate.tsx aus.

Zuerst NUR die Design-Direction nach Workflow A (noch kein Code):
Palette nach Papier · Tinte · Signal · Tiefe, Schriftpaarung (nur OFL), Hero-Konzept, Motion-Haltung, welche Prinzipien du nutzt und welche eigene Idee dazukommt.
Leitreferenz für den Hero: 010 Pure Zero (Licht, schwebende Elemente, die dem Cursor ausweichen, Dose dreht sich mit der Maus, Sortenwechsel). Ergänzend: 006 (Partikel), 003 (Text-Reveal), 008 (Licht als Akzentfarbe).
Übernimm von 010 ausdrücklich NICHT: verschwindenden Header, blassen Infotext, Objekte über Fließtext.

Intro-Sequenz (das Herzstück), als Drehbuch:
0,0 s  Schwarzer Bildschirm. Mittig klein die Altersabfrage: „Bist du mindestens 18?“ Ja / Nein. Erst nach „Ja“ startet alles.
+0,4 s Stille Schwärze, ein feines Korn ist zu sehen.
+0,8 s Sechs Erinnerungsblasen erscheinen nacheinander an unterschiedlichen Stellen, je ca. 0,6–0,8 s sichtbar, leicht überlappend:
       Party · Jetski-Tag · Yacht bei Sonnenuntergang · große Hotellobby · Garten mit Freunden · auf dem Weg zum Club.
       Jede Blase ist eine runde Maske mit Foto, wirkt wie eine aufsteigende Kohlensäure-Blase: wächst aus einem Punkt,
       leichter Glanzrand oben, steigt ein Stück nach oben, zerplatzt weich. Dazu ein winziges Mono-Label (z. B. „SAMSTAG, 01:40“).
       Schnell und prägnant, wie Erinnerungsfetzen, nicht wie eine Diashow.
+5,0 s Die letzte Blase wächst in die Bildmitte, platzt, Lichtschein von oben.
+5,6 s Die Dose erscheint aus dem Licht (Bloom auf der Oberkante), Zutaten/Eiswürfel/Limettenscheiben verteilen sich und schweben.
+6,4 s Headline per Signatur-Reveal, danach Header, Infotext, CTA. Optional ein tiefer Bass-Schlag beim Erscheinen der Dose.
Gesamtdauer Intro max. 7 s. „Intro überspringen“ immer sichtbar. Intro nur beim ersten Besuch, danach direkt der Hero.
Bei „Bewegung reduzieren“: kein Intro, direkt der fertige Hero.

Hero im Ruhezustand:
- Dose groß in der Mitte im Lichthof, dreht sich leicht mit der Maus.
- Schwebende Elemente aus der Welt des Getränks (Eis, Limette, Minze, Lichtpunkte wie Partylichter) weichen dem Cursor aus (Prinzip 31).
- Sortenwechsel oben rechts, falls mehrere Sorten: Dose, Hintergrundfarbe und Elemente wechseln gemeinsam (Prinzip 32). Sorten kommen aus src/content/flavors.ts.
- Header nach Prinzip 33, bleibt immer sichtbar (src/components/layout/Header.tsx existiert).
- Infotext gut lesbar: volle Tinte, eigene ruhige Zone, nichts fliegt darüber.
- Zwei CTAs aus src/config/site.ts: primär „Zum ersten Drop“ (#drop), sekundär „Für Bars & Handel“ (#handel).

Technik: Next.js App Router, TypeScript, Tailwind v4 mit src/styles/theme.css, Framer Motion,
React Three Fiber + drei + @react-three/postprocessing (Bloom, Noise, Vignette). Dose prozedural als Zylinder mit Etikett-Textur.
R3F-Canvas als Client Component mit next/dynamic (ssr: false) laden, Hero-Shell bleibt Server Component.
Nur Bausteine aus tokens/licenses.md.

Assets liegen in /public/intro/ (party.jpg, jetski.jpg, yacht.jpg, lobby.jpg, garten.jpg, club.jpg) und /public/can/label.png.

Rechtliches: Kein Bezug von Alkohol zum Führen von Fahrzeugen (Jetski/Yacht nur als Stimmung, ohne Getränk am Steuer).
Kein Alkoholgehalt in der Headline, keine Stärke als Argument. Footer-Hinweis „Verantwortungsvoll genießen“ und 18+ sind schon da.

Nach dem Bauen: Selbstkontrolle nach Workflow A Schritt 6, Desktop und Mobil, Ladezeit prüfen (Lighthouse Mobile Performance ≥ 85, Intro-Assets ≤ 1,5 MB gesamt).
```

## Vorgehen

1. Design-Direction lesen. Passen Palette und Schrift nicht, jetzt korrigieren, bevor Code entsteht.
2. Bauen lassen.
3. Intro einzeln feinschleifen: „Blasen 20 % schneller, Jetski-Blase größer, Label weg.“
4. Wenn gut: `theme.css` und Hero als Referenz in die Galerie.

## Hinweise

- Der Klick auf „Ja“ ist die User-Geste, die Audio freischaltet. Ohne Geste blockieren Browser Ton.
- Jetski und Yacht nur als Stimmung. Niemand trinkt am Steuer. Werberat-Kodex, vor Launch prüfen lassen.
- Intro-Bilder als `.webp` oder `.avif` liefern, 1200 px Kante reicht für die Blasen.
