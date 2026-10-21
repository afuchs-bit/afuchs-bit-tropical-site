/** Minimal class joiner; swap for clsx/tailwind-merge if conflicts show up. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
