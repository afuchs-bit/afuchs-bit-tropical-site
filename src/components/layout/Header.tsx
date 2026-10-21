import Link from "next/link";
import { brand } from "@/config/brand";
import { cta, nav } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Always visible (hero brief, Prinzip 33). Three anchors on desktop, the
 * primary CTA on the right. Mobile keeps logo + CTA; the anchors sit in the
 * footer, so no hamburger is needed for a one-pager.
 */
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-paper/70 backdrop-blur-md">
      <div className="container-content flex h-16 items-center justify-between gap-6">
        <Link href="/" className="font-display text-lg tracking-tight">
          {brand.name}
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink-2 transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ButtonLink href={cta.primary.href} className="min-h-10 px-5">
          {cta.primary.label}
        </ButtonLink>
      </div>
    </header>
  );
}
