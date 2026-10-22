"use client";

import Link from "next/link";
import type { ComponentPropsWithRef } from "react";
import type { SheetId } from "@/content/hero";

type SheetLinkProps = Omit<ComponentPropsWithRef<"a">, "href"> & {
  sheet: SheetId;
  /** On the hero page a plain hash link; elsewhere a link back to "/#…". */
  onHome: boolean;
};

/** Opens a hero sheet. A real link, so it also works without JS and as a deep link. */
export function SheetLink({ sheet, onHome, ...rest }: SheetLinkProps) {
  return onHome ? <a href={`#${sheet}`} {...rest} /> : <Link href={`/#${sheet}`} {...rest} />;
}
