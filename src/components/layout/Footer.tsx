import Link from "next/link";
import { brand } from "@/config/brand";
import { nav } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 py-16">
      <div className="container-content grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl">{brand.name}</p>
          <p className="mt-4 max-w-sm text-sm text-ink-2">
            Verantwortungsvoll genießen. Nur für Personen ab 18 Jahren.
          </p>
        </div>

        <nav aria-label="Seitenbereiche">
          <p className="mono-label">Seite</p>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-2 hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={brand.social.instagram} rel="noopener noreferrer" target="_blank" className="text-ink-2 hover:text-ink">
                Instagram
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Rechtliches">
          <p className="mono-label">Rechtliches</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/impressum" className="text-ink-2 hover:text-ink">
                Impressum
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="text-ink-2 hover:text-ink">
                Datenschutz
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container-content mt-12 flex flex-wrap items-center justify-between gap-4">
        <p className="mono-label">
          © {year} {brand.legal.entity}
        </p>
        <p className="mono-label">18+</p>
      </div>
    </footer>
  );
}
