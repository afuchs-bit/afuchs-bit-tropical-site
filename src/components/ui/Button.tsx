import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-pill px-6 text-sm font-medium tracking-wide transition-colors duration-base ease-out-expo";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-depth hover:bg-signal",
  ghost: "border border-ink-2/40 text-ink hover:border-ink",
};

type LinkProps = ComponentPropsWithoutRef<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "primary", className, ...props }: LinkProps) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: Variant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(base, variants[variant], className)} {...props} />;
}
