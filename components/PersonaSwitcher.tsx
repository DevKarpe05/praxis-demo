"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PERSONA_ORDER, PERSONAS, personaFromPath } from "@/lib/personas";
import { rememberLastPersona } from "@/lib/persona-memory";

export function PersonaSwitcher() {
  // `active` is derived PURELY from the current URL via usePathname().
  // Do not read localStorage, custom events, or any other side-store here —
  // those would let unrelated UI (e.g. a marketplace toast on /factory/upload)
  // visibly flip the active persona pill while the user is still on /factory/*.
  const pathname = usePathname() ?? "/";
  const active = personaFromPath(pathname);

  // Side-write the last-visited persona to localStorage so the landing page's
  // LastVisitedTag can render a subtle hint. This runs only when the URL-derived
  // `active` changes — never in response to upload completion or other events.
  useEffect(() => {
    if (active) rememberLastPersona(active);
  }, [active]);

  return (
    <nav
      aria-label="Persona switcher"
      className="flex items-center gap-1 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-1"
    >
      {PERSONA_ORDER.map((id) => {
        const p = PERSONAS[id];
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={p.homePath}
            className={[
              "relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              isActive
                ? "bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]"
                : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
            ].join(" ")}
          >
            {p.label}
            {isActive && (
              <span className="absolute -bottom-px left-3 right-3 h-px bg-[color:var(--color-accent)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
