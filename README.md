# tropical-site

Landingpage für ein alkoholisches RTD-Getränk in der Dose. Prototyp-Phase: kein Shop, zwei Signale (Drop-Liste, Bars & Handel).

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · Framer Motion · React Three Fiber + drei + postprocessing (für den Hero, noch nicht verwendet).

## Start

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

`npm run typecheck`, `npm run lint`, `npm run build` vor jedem Commit.

## Wo was liegt

| Pfad | Inhalt |
|---|---|
| `docs/site-structure.md` | Seitenaufbau, Begründung, CTA-Logik, Content-Bedarf, offene Entscheidungen |
| `docs/hero-brief.md` | Prompt und Drehbuch für die Hero-Runde in Claude Code |
| `docs/legal-checklist.md` | Was auf die Seite muss und was nicht darf |
| `src/config/brand.ts` | Markenname, Impressumsdaten (Platzhalter in `[…]`) |
| `src/config/site.ts` | Launch-Phase, CTAs, Navigation |
| `src/content/` | Sorten, Anlässe, FAQ: die einzigen Stellen mit Inhalt |
| `src/styles/theme.css` | Design-Tokens (Papier · Tinte · Signal · Tiefe), Platzhalter bis zur Design-Direction |
| `src/components/sections/` | Ein Block pro Datei, Reihenfolge in `app/page.tsx` |
| `src/components/age-gate/` | Altersabfrage mit `sessionStorage`, Provider liefert `firstPass` für das Intro |
| `public/intro/`, `public/can/` | Bilder für Intro-Blasen und Etikett (noch leer) |

## Nächste Schritte

1. Partnerentscheidung: Markenname, Variante, Sorten. Dann `brand.ts` und `flavors.ts` füllen.
2. Assets erzeugen (6 Intro-Bilder, Etikett), siehe `docs/site-structure.md` → Content-Bedarf.
3. Hero-Runde in Claude Code mit `docs/hero-brief.md` (erst Design-Direction, dann Build).
4. Formular-Backend (`/api/drop`, `/api/trade`) und Analytics anbinden.
5. Impressum und Datenschutz final.

## Konventionen

- Code, Variablen, Kommentare auf Englisch. Copy auf Deutsch.
- Sections sind Server Components. Alles mit `useState`, Canvas oder Motion wandert in eine eigene Client Component.
- Keine Platzhalter-Bilder, keine erfundenen Zitate. Leere Blöcke rendern `null` (siehe `Proof.tsx`).
- Nur OFL-Schriften und MIT/ISC-Libraries.
