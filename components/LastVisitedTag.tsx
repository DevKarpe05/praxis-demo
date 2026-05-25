"use client";

import { useLastPersona } from "@/lib/persona-memory";
import { PERSONAS, type PersonaId } from "@/lib/personas";
import { History } from "lucide-react";

/**
 * Subtle "Last visited" hint surfaced on the landing page's pillar cards. Renders
 * nothing when the persona doesn't match the most recently visited one.
 */
export function LastVisitedTag({ persona }: { persona: PersonaId }) {
  const last = useLastPersona();
  if (last !== persona) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] mono text-[color:var(--color-accent)]">
      <History className="h-2.5 w-2.5" />
      Last: {PERSONAS[persona].label}
    </span>
  );
}
