"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Age gate state, shared with the hero so the intro can start the moment
 * "Ja" is clicked (that click is also the user gesture that unlocks audio).
 *
 * Stored in sessionStorage: no cookie, no personal data, gone when the tab
 * closes. `firstPass` is true only in the session where the gate was answered,
 * which is exactly when the intro should play.
 */
type Status = "pending" | "verified" | "denied";

type AgeGateContextValue = {
  status: Status;
  /** True once per session, right after the visitor confirmed 18+. */
  firstPass: boolean;
  confirm: () => void;
  deny: () => void;
};

const STORAGE_KEY = "age-gate";

const AgeGateContext = createContext<AgeGateContextValue | null>(null);

export function AgeGateProvider({ children }: { children: ReactNode }) {
  // Start "pending" on the server and the first client render to avoid a
  // hydration mismatch; read storage after mount.
  const [status, setStatus] = useState<Status>("pending");
  const [firstPass, setFirstPass] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored === "verified" || stored === "denied") setStatus(stored);
    } catch {
      // Storage blocked (private mode etc.): keep the gate visible.
    }
    setHydrated(true);
  }, []);

  const confirm = useCallback(() => {
    setStatus("verified");
    setFirstPass(true);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "verified");
    } catch {
      /* ignore */
    }
  }, []);

  const deny = useCallback(() => {
    setStatus("denied");
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "denied");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ status: hydrated ? status : "pending", firstPass, confirm, deny }),
    [hydrated, status, firstPass, confirm, deny],
  );

  return <AgeGateContext.Provider value={value}>{children}</AgeGateContext.Provider>;
}

export function useAgeGate(): AgeGateContextValue {
  const ctx = useContext(AgeGateContext);
  if (!ctx) throw new Error("useAgeGate must be used inside <AgeGateProvider>");
  return ctx;
}
