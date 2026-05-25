export type PersonaId = "factory" | "ops" | "lab";

export interface Persona {
  id: PersonaId;
  label: string;
  shortLabel: string;
  description: string;
  org: string;
  homePath: string;
  accentClass: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  factory: {
    id: "factory",
    label: "Factory",
    shortLabel: "Factory",
    description: "Capture data, get paid.",
    org: "factory_024",
    homePath: "/factory",
    accentClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  ops: {
    id: "ops",
    label: "Praxis Ops",
    shortLabel: "Ops",
    description: "Process, annotate, QA.",
    org: "praxis internal",
    homePath: "/ops",
    accentClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  lab: {
    id: "lab",
    label: "Robotics Lab",
    shortLabel: "Lab",
    description: "Browse, preview, buy.",
    org: "robotics-lab",
    homePath: "/lab",
    accentClass: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
};

export const PERSONA_ORDER: PersonaId[] = ["factory", "ops", "lab"];

export function personaFromPath(pathname: string): PersonaId | null {
  if (pathname.startsWith("/factory")) return "factory";
  if (pathname.startsWith("/ops")) return "ops";
  if (pathname.startsWith("/lab")) return "lab";
  return null;
}
