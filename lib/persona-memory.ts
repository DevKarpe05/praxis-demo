"use client";

import { useEffect, useState } from "react";
import type { PersonaId } from "./personas";

const KEY = "praxis_last_persona";

/**
 * Persist the most recently visited persona. This is a side store consumed
 * ONLY by <LastVisitedTag /> on the landing page — it must never feed back
 * into the active state of the TopBar's PersonaSwitcher (which is URL-driven).
 *
 * We deliberately do NOT dispatch a custom in-tab event here: same-tab updates
 * naturally take effect on the next route change (when the consuming component
 * re-mounts and reads localStorage), and cross-tab sync is handled by the
 * browser's native `storage` event below.
 */
export function rememberLastPersona(id: PersonaId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export function readLastPersona(): PersonaId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === "factory" || raw === "ops" || raw === "lab") return raw;
    return null;
  } catch {
    return null;
  }
}

export function useLastPersona(): PersonaId | null {
  const [persona, setPersona] = useState<PersonaId | null>(null);

  useEffect(() => {
    setPersona(readLastPersona());
    // Only react to cross-tab storage changes. We intentionally do not listen
    // to any custom in-tab event — see rememberLastPersona above.
    const handler = (e: StorageEvent) => {
      if (e.key && e.key !== KEY) return;
      setPersona(readLastPersona());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return persona;
}
