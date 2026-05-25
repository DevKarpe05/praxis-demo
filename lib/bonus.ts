"use client";

import { useEffect, useState } from "react";

const KEY = "praxis_bonus_payout";
const EVENT = "praxis-bonus-changed";

export interface BonusEvent {
  source: string;
  amount: number;
  at: number;
}

export function getBonus(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 0;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function addBonus(amount: number, source: string): void {
  if (typeof window === "undefined") return;
  const current = getBonus();
  const next = current + amount;
  localStorage.setItem(KEY, String(next));
  const detail: BonusEvent = { source, amount, at: Date.now() };
  window.dispatchEvent(new CustomEvent(EVENT, { detail }));
}

export function resetBonus(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { source: "reset", amount: 0, at: Date.now() } }));
}

export function useBonus(): number {
  const [bonus, setBonus] = useState<number>(0);

  useEffect(() => {
    setBonus(getBonus());
    const handler = () => setBonus(getBonus());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return bonus;
}
