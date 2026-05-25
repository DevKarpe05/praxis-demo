"use client";

import { useEffect, useState } from "react";
import type { PersonaId } from "./personas";

const KEY = "praxis_last_persona";
const EVENT = "praxis-persona-changed";

export function rememberLastPersona(id: PersonaId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, id);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { id } }));
  } catch {
    // ignore
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
    const handler = () => setPersona(readLastPersona());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return persona;
}
