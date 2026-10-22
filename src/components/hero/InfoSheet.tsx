"use client";

import { brand } from "@/config/brand";
import { flavors } from "@/content/flavors";
import type { SheetId } from "@/content/hero";
import { useHero } from "./store";
import { Sheet, SheetHeader } from "./ui/Sheet";
import { closeSheet } from "./ui/sheets";

/**
 * The nav targets as Papier sheets (no dead links): Sorten & Produktangaben,
 * Erster Drop, Für Bars & Handel. Honest placeholders in [brackets] until
 * the partners deliver facts; no forms before double opt-in exists.
 */
const TITLE_ID = "info-sheet-title";

const linkClass =
  "inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-signal-text underline decoration-1 underline-offset-[6px]";

export function InfoSheet() {
  const sheet = useHero((s) => s.sheet);
  return (
    <Sheet open={sheet !== null} onClose={closeSheet} labelledBy={TITLE_ID}>
      {sheet && <SheetBody id={sheet} />}
    </Sheet>
  );
}

function SheetBody({ id }: { id: SheetId }) {
  switch (id) {
    case "sorten":
      return <ProductSheet />;
    case "drop":
      return <DropSheet />;
    case "handel":
      return <TradeSheet />;
  }
}

function ProductSheet() {
  return (
    <>
      <SheetHeader titleId={TITLE_ID} title="Sorten & Produktangaben" onClose={closeSheet} />
      <div className="space-y-10 px-6 pb-12 pt-8 md:px-10">
        {flavors.map((flavor) => (
          <section key={flavor.slug} aria-labelledby={`product-${flavor.slug}`}>
            <h3 id={`product-${flavor.slug}`} className="font-hero text-[2rem] leading-none">
              {flavor.name}
            </h3>
            <p className="mt-2 meta-label">{flavor.note}</p>
            <dl className="mt-5 border-t border-ink/16">
              <Fact term="Füllmenge" value={`${brand.canSizeMl} ml`} />
              <Fact term="Alkoholgehalt" value="[x] % vol" />
              <Fact term="Zutaten" value={flavor.ingredients.join(", ")} />
              <Fact term="Allergene" value="[…]" />
            </dl>
          </section>
        ))}
        <p className="text-body text-ink-72">Abgabe an Personen unter 18 Jahren verboten (§ 9 JuSchG)</p>
      </div>
    </>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-ink/16 py-3">
      <dt className="pt-1 meta-label">{term}</dt>
      <dd className="text-body">{value}</dd>
    </div>
  );
}

function DropSheet() {
  return (
    <>
      <SheetHeader titleId={TITLE_ID} title="Erster Drop" onClose={closeSheet} />
      <div className="px-6 pb-12 pt-8 md:px-10">
        <p className="max-w-[34ch] text-body-l">
          Der erste Drop ist in Vorbereitung. Die Anmeldung mit Double-Opt-in folgt.
        </p>
        <a href={`mailto:${brand.legal.email}?subject=${encodeURIComponent("Erster Drop")}`} className={`mt-8 ${linkClass}`}>
          Vorab per E-Mail melden
          <span aria-hidden>→</span>
        </a>
      </div>
    </>
  );
}

function TradeSheet() {
  return (
    <>
      <SheetHeader titleId={TITLE_ID} title="Für Bars & Handel" onClose={closeSheet} />
      <div className="px-6 pb-12 pt-8 md:px-10">
        <p className="max-w-[34ch] text-body-l">
          [Für wen das Angebot gedacht ist, z. B. Bars, Clubs und Getränkehandel.] [Wie eine Zusammenarbeit
          startet, z. B. Probierset oder Erstbestellung.]
        </p>
        <a
          href={`mailto:${brand.legal.email}?subject=${encodeURIComponent("Bars & Handel")}`}
          className={`mt-8 ${linkClass}`}
        >
          Anfrage per E-Mail
          <span aria-hidden>→</span>
        </a>
      </div>
    </>
  );
}
