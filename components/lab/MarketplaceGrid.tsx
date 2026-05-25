"use client";

import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { DatasetCard } from "./DatasetCard";
import type { DatasetCard as DatasetCardType } from "@/lib/types";

export function MarketplaceGrid({ datasets }: { datasets: DatasetCardType[] }) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<"all" | "premium" | "standard">("all");
  const [scene, setScene] = useState<string>("all");

  const scenes = useMemo(() => {
    return ["all", ...Array.from(new Set(datasets.map((d) => d.sceneCategory)))];
  }, [datasets]);

  const filtered = useMemo(() => {
    return datasets.filter((d) => {
      if (format !== "all" && d.format !== format) return false;
      if (scene !== "all" && d.sceneCategory !== scene) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.task.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [datasets, query, format, scene]);

  return (
    <div className="space-y-5">
      <div className="card p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-[color:var(--color-text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by task, scene…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--color-text-dim)]"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-[color:var(--color-border)] p-0.5">
          {(["all", "premium", "standard"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={[
                "px-2.5 py-1 text-[11px] rounded uppercase tracking-wider transition-colors",
                format === f
                  ? "bg-[color:var(--color-accent)] text-[#14110a]"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-md border border-[color:var(--color-border)] p-0.5">
          <Filter className="h-3.5 w-3.5 text-[color:var(--color-text-muted)] mx-1.5" />
          {scenes.map((s) => (
            <button
              key={s}
              onClick={() => setScene(s)}
              className={[
                "px-2.5 py-1 text-[11px] rounded uppercase tracking-wider transition-colors",
                scene === s
                  ? "bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]"
                  : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <DatasetCard key={d.id} dataset={d} />
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 card p-10 text-center text-sm text-[color:var(--color-text-muted)]">
            No datasets match those filters.
          </div>
        )}
      </div>
    </div>
  );
}
