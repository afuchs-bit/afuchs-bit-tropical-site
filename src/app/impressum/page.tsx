import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Impressum", robots: { index: false } };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {brand.legal.entity}
        <br />
        {brand.legal.street}
        <br />
        {brand.legal.city}
      </p>
      <h2>Vertreten durch</h2>
      <p>{brand.legal.representatives}</p>
      <h2>Kontakt</h2>
      <p>E-Mail: {brand.legal.email}</p>
      <h2>Umsatzsteuer-ID</h2>
      <p>{brand.legal.vatId}</p>
      <h2>Jugendschutz</h2>
      <p>
        Dieses Angebot richtet sich ausschließlich an Personen ab 18 Jahren.
        Alkoholische Getränke werden nicht an Minderjährige abgegeben.
      </p>
    </LegalPage>
  );
}
