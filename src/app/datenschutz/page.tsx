import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Datenschutz", robots: { index: false } };

/** Skeleton. Fill from a generator or a lawyer once hosting, forms and analytics are decided. */
export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <h2>Verantwortlicher</h2>
      <p>
        {brand.legal.entity}, {brand.legal.street}, {brand.legal.city}, {brand.legal.email}
      </p>
      <h2>Hosting</h2>
      <p>[Anbieter, Serverstandort, Auftragsverarbeitung.]</p>
      <h2>Altersabfrage</h2>
      <p>
        Die Antwort auf die Altersabfrage wird ausschließlich im Sitzungsspeicher
        deines Browsers abgelegt und nicht an uns übertragen.
      </p>
      <h2>Formulare</h2>
      <p>[Drop-Liste: Double-Opt-in, Dienstleister, Speicherdauer, Widerruf. B2B-Anfragen: Zweck, Speicherdauer.]</p>
      <h2>Reichweitenmessung</h2>
      <p>[Plausible/Umami ohne Cookies, oder Hinweis auf Verzicht.]</p>
      <h2>Deine Rechte</h2>
      <p>[Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Beschwerde bei der Aufsichtsbehörde.]</p>
    </LegalPage>
  );
}
