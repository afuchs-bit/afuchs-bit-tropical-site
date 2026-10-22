/**
 * TextRollButton · Prinzip 8 + 15 (Referenzen: 003 Lando Norris, 009 Verso)
 *
 * Flächiger Button, beim Hover rollt der Text vertikal durch,
 * der Pfeil im Akzentkreis schiebt sich nach rechts oben.
 * Reines CSS (Tailwind), keine JS-Abhängigkeit, funktioniert auch als Server-Komponente.
 *
 * <TextRollButton href="/kontakt">Projekt anfragen</TextRollButton>
 * <TextRollButton href="/leistungen" variant="outline">Leistungen</TextRollButton>
 */
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "solid" | "outline" | "signal";

type Props = ComponentPropsWithoutRef<"a"> & {
  children: ReactNode;
  variant?: Variant;
  /** Formsprache der Marke: eine Stufe wählen und auf der ganzen Seite beibehalten */
  shape?: "sharp" | "soft" | "pill";
};

const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper",
  outline: "border border-current text-current",
  signal: "bg-signal text-ink",
};
const shapes = { sharp: "rounded-none", soft: "rounded-soft", pill: "rounded-full" } as const;

export function TextRollButton({
  children,
  variant = "solid",
  shape = "pill",
  className = "",
  ...rest
}: Props) {
  return (
    <a
      {...rest}
      className={`group inline-flex items-center gap-3 py-2 pl-5 pr-2 text-small font-medium ${variants[variant]} ${shapes[shape]} ${className}`}
    >
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-out-expo motion-safe:group-hover:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo motion-safe:group-hover:translate-y-0"
        >
          {children}
        </span>
      </span>
      <span
        aria-hidden
        className={`grid size-8 place-items-center overflow-hidden ${shape === "pill" ? "rounded-full" : shapes[shape]} ${
          variant === "signal" ? "bg-ink text-signal" : "bg-signal text-ink"
        }`}
      >
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="transition-transform duration-500 ease-out-expo motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
        >
          <path d="M4 12 12 4M6 4h6v6" />
        </svg>
      </span>
    </a>
  );
}
