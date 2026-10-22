/** Storage access that never throws (private mode, blocked site data). */
type Area = "local" | "session";

function area(which: Area): Storage | null {
  try {
    return which === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage(which: Area, key: string): string | null {
  try {
    return area(which)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(which: Area, key: string, value: string): void {
  try {
    area(which)?.setItem(key, value);
  } catch {
    /* ignore */
  }
}
