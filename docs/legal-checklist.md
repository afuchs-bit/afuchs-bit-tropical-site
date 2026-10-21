# Rechts-Checkliste für die Website

Recherchierte Punkte, keine Rechtsberatung. Vor Launch durch Lebensmittel- und Werberechtler prüfen lassen. Quellen in `site-structure.md` und in der Projekt-Bewertung.

## Muss vor dem Launch

- [ ] **Impressum** (§ 5 DDG) mit Anbieter, Anschrift, Kontakt, Vertretungsberechtigte, ggf. Registernummer, USt-ID.
- [ ] **Datenschutzerklärung**: Hosting, Formular-Verarbeitung (Drop-Liste, B2B-Anfragen), Analytics, Schriften (self-hosted über `next/font`, keine Google-Fonts-Requests).
- [ ] **Double-Opt-in** für die Drop-Liste, Einwilligungstext am Formular, Abmeldelink.
- [ ] **18+-Hinweis** im Footer und an jedem Formular, das zum Kauf führt.
- [ ] **„Verantwortungsvoll genießen“** im Footer (Werberat-Empfehlung, kein Gesetz).
- [ ] **Pflichtangaben online**, sobald konkrete Produkte gezeigt werden: Alkoholgehalt in % vol, Zutaten, Allergene, Füllmenge, bei Alkopops der gesetzliche Warnhinweis („Abgabe an Personen unter 18 Jahren verboten, § 9 Jugendschutzgesetz“) in gleicher Schrift wie der Markenname.

## Darf nicht auf der Seite

- Alkoholgehalt als Kaufargument oder Markenmerkmal (Werberat-Kodex 2026).
- Aufforderung zu oder Darstellung von missbräuchlichem Konsum; Slogans, die große Mengen in kurzer Zeit nahelegen. Das trifft jede Form von „Leiter“, „Challenge“, „wer schafft“.
- Gesundheitsbezogene Angaben bei Getränken über 1,2 % vol (Elektrolyte, Kater, „leicht“, „bekömmlich“). Gilt auch für Werbung und Social.
- Verbindung von Alkohol mit dem Führen von Fahrzeugen (Jetski, Boot, Auto).
- Gestaltung, die gezielt Minderjährige anspricht (Comic-Optik, Schulkontext, Kinderstars). Tropisch und bunt ist erlaubt, aber im Entwurf mitdenken.
- Erfundene Testimonials oder Bewertungen (UWG).

## Wenn später verkauft wird

- [ ] Zweistufige Altersprüfung: Alter bei Bestellung abfragen und Übergabe nur an Volljährige (DHL Ident-Check oder vergleichbar). Ein LG hat § 9 JuSchG auf den Versand erstreckt.
- [ ] AGB, Widerrufsbelehrung, Grundpreisangabe (€/l), Pfandhinweis, Versandkosten.
- [ ] Verbrauchsteuer-Status (Alkoholsteuer, bei < 10 % vol zusätzlich Alkopopsteuer) und Steuerlager des Abfüllers im Impressum nicht nötig, aber in der Kalkulation.
- [ ] Versand ins Ausland: eigene Kennzeichnung und Steuern pro Land. UK: Portman-Code gilt für jedes dort vermarktete Produkt.

## Technik, die Recht vereinfacht

- Cookiefreies Analytics (Plausible, Umami) → kein Consent-Banner, Intro bleibt sauber.
- Age Gate in `sessionStorage`, keine Cookies, keine personenbezogenen Daten.
- Fonts und Scripts self-hosted, keine Third-Party-Requests vor der Einwilligung.
- Instagram-Embed erst nach Klick laden (Zwei-Klick-Lösung) oder statische Kacheln mit Link.
