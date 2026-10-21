# Seitenstruktur: Landingpage für ein alkoholisches RTD-Getränk (Dose)

Stand 21.10.2026. Gilt für den Prototyp-Launch, nicht für einen fertigen Shop.

## Was die Seite leisten muss

Drei Jobs, in dieser Reihenfolge:

1. **Begehrlichkeit in unter 10 Sekunden.** Der Besucher kann nicht probieren. Die Seite muss Geschmack, Gefühl und Anlass ersetzen. Das macht der Hero (Intro-Sequenz, siehe `hero-brief.md`).
2. **Ein hartes Signal einsammeln.** Vor der Produktion ist „Kaufen“ nicht möglich. Die Conversion ist deshalb nicht der Warenkorb, sondern (a) Eintrag für den ersten Drop und (b) Anfrage von Bars, Spätis und Händlern. Beides zahlt direkt auf die Tests aus der Bewertung ein (Dream-Ten-Liste, Bar-Pilot).
3. **Vertrauen und Rechtssicherheit.** 18+, Pflichtangaben, keine Stärke als Kaufargument, keine Gesundheitsversprechen, kein Fahrzeugbezug. Was auf der Seite nicht geht, geht auch nicht in Ads.

## Was die Recherche hergibt

- **Anlass schlägt Produkt.** Purpose-built RTD-Marken, die um klare Trinkanlässe gebaut sind, wachsen; Spirituosen-Extensions tun sich schwer (BCG 2026). Die Seite erzählt deshalb den Abend, nicht die Rezeptur.
- **Vor dem Launch: Splash + Warteliste.** Delola (Barrel) ging mit einer Splash-Page für E-Mail-Capture live, bevor die volle Seite kam. Pre-Order-/Drop-Pages mit sichtbarer Stückzahl und SMS/E-Mail-Alert sind Standard bei limitierten Getränke-Releases.
- **Immer dabei:** Sorten mit Geschmacksbeschreibung, Zutaten-Transparenz, Serviervorschlag („ways to drink“), Social Proof (UGC, Bars, Presse), Store Locator oder „Wo gibt's das“, FAQ, Story.
- **Altersabfrage:** Für eine reine Marken-Website rechtlich nicht vorgeschrieben (IT-Recht Kanzlei), aber marketingseitig sinnvoll: signalisiert Erwachsenenangebot und verantwortungsvollen Umgang. Für uns zusätzlich technisch nützlich: Der Klick erlaubt Audio. Beim späteren Versand ist eine zweistufige Altersprüfung Pflicht (Bestellung + Übergabe), siehe `legal-checklist.md`.
- **Performance ist in der Kategorie schwach** (Inviqa DTC-Report: kein Alkohol-Brand mit Punkten für Mobile-Speed). Ein schnelles Intro, das nach 7 s fertig ist und auf Mobil nicht ruckelt, ist bereits Differenzierung.

## Die Struktur

Eine Seite, 10 Blöcke, plus Rechtsseiten. Reihenfolge ist Dramaturgie: Gefühl → Produkt → Beweis → Handlung.

| # | Block | Zweck | Inhalt | Komponente |
|---|---|---|---|---|
| 0 | **Age Gate** | Erwachsenenangebot signalisieren, Audio freischalten, Intro starten | Schwarz, Mono-Label, „Bist du mindestens 18?“ Ja/Nein. „Nein“ → neutrale Seite mit Hinweis. Entscheidung in `sessionStorage` | `age-gate/AgeGate` |
| 1 | **Hero mit Intro** | Begehrlichkeit, Markenwelt, erste Botschaft | Intro-Sequenz (6 Erinnerungsblasen → Dose aus dem Licht), Ruhezustand mit drehbarer Dose, Sortenwechsel, Headline, 1 Satz, 2 CTAs: „Zum ersten Drop“ und „Für Bars & Handel“ | `sections/Hero` (Platzhalter, Build nach `hero-brief.md`) |
| 2 | **Der Abend** | Anlass statt Produktmerkmal; die 6 Bilder aus dem Intro bekommen einen zweiten Auftritt | Horizontaler Strip oder Grid: Party · Jetski-Tag · Yacht · Hotellobby · Garten · Weg zum Club. Je ein Satz, Zeitlabel im Mono. Keine Trink-Szenen am Steuer | `sections/Occasions` |
| 3 | **Sorten** | Geschmack beschreiben, Variantenwahl, Farbcode der Marke | Pro Sorte: Name, Geschmacksnote (3 Wörter), % vol, Farbfläche. Pflichtangaben hier, nicht im Footer versteckt | `sections/Lineup` |
| 4 | **Was drin ist** | Transparenz, Qualitätsanker | Zutatenliste, Alkoholgehalt, 330 ml, ggf. Nährwerte. Sachlich, in voller Tinte. Keine „natürlich/gesund/leicht“-Claims | `sections/Ingredients` |
| 5 | **So trinkst du's** | Ritual, Geschenk-/Gruppenanlass, Serviervorschlag | Gekühlt pur, auf Eis, als Basis für einen Longdrink. Max. 3 Varianten mit Foto | `sections/Serve` |
| 6 | **Wo es läuft** | Social Proof. Vor dem Launch: Bar-Partner und Pilot-Orte, danach UGC/Instagram | Logos oder Namen der Pilot-Bars, Zitate von Betreibern, später Instagram-Embed. Leer? Block ausblenden, nie mit Fake füllen | `sections/Proof` |
| 7 | **Erster Drop** (Haupt-CTA) | Konsumentensignal | Limitierte Stückzahl sichtbar, E-Mail-Feld, Datum oder „Sommer 2027“, kurzer Hinweis auf 18+ und Versand nur in DE. Double-Opt-in | `sections/Drop` |
| 8 | **Für Bars & Handel** (B2B-CTA) | Wiederverkäufer-Signal, der eigentliche Engpass laut Bewertung | Zwei Sätze zum Angebot (Set als Hausdrink, Kartendesign inklusive), Onepager-Download, Kontaktformular mit Feld „Betrieb“. Eigene Ankerseite `/handel` möglich | `sections/Trade` |
| 9 | **Story** | Wer steckt dahinter, warum glaubwürdig | 3 Gründer, ein Absatz, ein Foto. Keine Mission-Statement-Prosa | `sections/Story` |
| 10 | **FAQ** | Einwände abfangen, SEO-Longtail | Alkoholgehalt, Versand/Alter, Allergene, Pfand, Verfügbarkeit, Bar-Anfragen. Accordion mit `<details>` | `sections/Faq` |
| – | **Footer** | Pflicht und Haltung | „Verantwortungsvoll genießen“, 18+, Impressum, Datenschutz, Instagram, Pflichtangaben-Link | `layout/Footer` |

Rechtsseiten: `/impressum`, `/datenschutz`. Später `/agb`, `/widerruf`, wenn verkauft wird.

### Header

Immer sichtbar (Vorgabe aus dem Hero-Brief). Logo links, 3 Anker (Sorten · Der Abend · Für Bars & Handel), rechts der Drop-CTA. Kein Hamburger auf Desktop, auf Mobil ein Sheet.

### CTA-Logik

| Phase | Primär | Sekundär |
|---|---|---|
| Jetzt (Prototyp, keine Produktion) | Eintrag für den ersten Drop | Bar/Handel-Anfrage |
| Bar-Pilot läuft | „Hier gibt's das“ mit Karte | Drop-Eintrag |
| Produkt existiert | Kaufen / Store Locator | Bar/Handel |

Die Komponenten sind so gebaut, dass nur `config/site.ts` (Phase) umgeschaltet wird, nicht die Sections.

## Was bewusst fehlt

- **Kein Abschnitt „Die Leiter“** und nichts, was Alkoholmenge, Stärke oder „wer schafft“ inszeniert. Das ist nach Werberat-Kodex nicht bewerbbar und würde die Ads blockieren.
- **Kein Elektrolyt-/Kater-Block.** Gesundheitsbezogene Angaben sind für Getränke über 1,2 % vol unzulässig, auch in der Werbung.
- **Kein Shop.** Vor Abfüllung und Steuerlager wäre ein Kaufen-Button eine Lüge. Pre-Order mit Zahlung erst, wenn Lieferdatum und AGB stehen.
- **Kein Testimonial-Block mit erfundenen Zitaten.** Social Proof kommt aus dem Bar-Pilot oder gar nicht.

## Content-Bedarf vor dem Build

| Asset | Für Block | Status |
|---|---|---|
| 6 Erinnerungsbilder (party, jetski, yacht, lobby, garten, club), gleiches Licht | 1, 2 | offen, Higgsfield |
| Etikett-Grafik `label.png` (2048 × 1024, kachelbar um den Zylinder) | 1 | offen |
| Sortennamen, Geschmacksnoten, % vol | 3, 4 | offen, hängt an Partnerentscheidung |
| Zutatenliste | 4 | offen, kommt vom Abfüller |
| 3 Serve-Fotos | 5 | offen |
| Gründerfoto, 3 Sätze | 9 | offen |
| Onepager für Handel (PDF) | 8 | offen |
| Impressum, Datenschutz (Wer ist Anbieter: GbR oder GmbH der Agentur?) | Footer | offen |

## Offene Entscheidungen

1. **Variante:** A (einheitliche Stärke), B („Die Landung“) oder C/D. Die Sorten-Section ist variantenneutral gebaut; die Headline nicht.
2. **Markenname und Domain.** Bis dahin Platzhalter `[MARKE]` in `config/brand.ts`.
3. **Formular-Backend:** Resend + eigene API-Route (empfohlen, DSGVO-tauglich mit EU-Region) oder Brevo. Noch nicht verdrahtet, die Formulare rendern nur.
4. **Analytics:** Plausible oder Umami (cookiefrei, kein Banner nötig). Google Analytics würde einen Consent-Banner erzwingen, der das Intro kaputtmacht.

## Quellen

- BCG, *Owning the Moment Wins in a Changing Alcohol Market* (Mai 2026)
- Barrel, Case Study Delola (Splash-Page, Store Locator, Zutaten-Transparenz)
- Replo, *Drinks & Beverages* Landing-Page-Formate (Sample Pack, Pre-Order, Drop)
- Inviqa, *DTC Ecommerce Report 2024*, Kategorie Alkohol/Non-Alcohol
- IT-Recht Kanzlei, *Alkohol online verkaufen: Braucht der Shop eine Altersabfrage?* und *FAQ Jugendschutz beim Online-Alkoholverkauf*
- Händlerbund, *Online-Verkauf von Alkohol* (Pflichtangaben online)
- Projektdoku *Bewertung Vodka Tropical – Tropical-Leiter* (Werberat, Alkopopsteuer, Health Claims)
