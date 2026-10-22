import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Impressum / Datenschutz on Papier. The header runs in its light tone; the
 * #page wrapper lets the mobile menu sheet make the page inert, as on "/".
 */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div id="page">
      <Header tone="light" />
      <main id="main" className="container-content pt-32 pb-section">
        <h1 className="font-display text-h2">{title}</h1>
        <div className="mt-12 max-w-prose space-y-4 text-ink-2 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ink">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
