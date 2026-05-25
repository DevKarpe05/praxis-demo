"use client";

import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DatasetCard } from "./DatasetCard";
import {
  getSensorMeta,
  SENSOR_REGISTRY,
} from "@/components/SensorBadge";
import type { DatasetCard as DatasetCardType } from "@/lib/types";

type FormatFilter = "all" | "premium" | "standard";
type HoursBucket = "any" | "lt1" | "1to10" | "gt10";
type QualityBucket = 0 | 3 | 4 | 4.5;

const HOURS_BUCKETS: Array<{ id: HoursBucket; label: string }> = [
  { id: "any", label: "any" },
  { id: "lt1", label: "<1h" },
  { id: "1to10", label: "1–10h" },
  { id: "gt10", label: "10h+" },
];

const QUALITY_BUCKETS: Array<{ id: QualityBucket; label: string }> = [
  { id: 0, label: "any" },
  { id: 3, label: "3+" },
  { id: 4, label: "4+" },
  { id: 4.5, label: "4.5+" },
];

function inHoursBucket(hours: number, bucket: HoursBucket): boolean {
  switch (bucket) {
    case "any":
      return true;
    case "lt1":
      return hours < 1;
    case "1to10":
      return hours >= 1 && hours <= 10;
    case "gt10":
      return hours > 10;
  }
}

export function MarketplaceGrid({ datasets }: { datasets: DatasetCardType[] }) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<FormatFilter>("all");
  const [scene, setScene] = useState<string>("all");
  const [sensors, setSensors] = useState<Set<string>>(new Set());
  const [hours, setHours] = useState<HoursBucket>("any");
  const [quality, setQuality] = useState<QualityBucket>(0);

  const scenes = useMemo(() => {
    return ["all", ...Array.from(new Set(datasets.map((d) => d.sceneCategory)))];
  }, [datasets]);

  const availableSensors = useMemo(() => {
    const set = new Set<string>();
    for (const d of datasets) for (const s of d.sensors) set.add(s);
    // ordered by registry order, then unknowns
    const ordered: string[] = [];
    for (const k of Object.keys(SENSOR_REGISTRY)) if (set.has(k)) ordered.push(k);
    for (const k of set) if (!ordered.includes(k)) ordered.push(k);
    return ordered;
  }, [datasets]);

  const toggleSensor = (s: string) => {
    setSensors((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return datasets.filter((d) => {
      if (format !== "all" && d.format !== format) return false;
      if (scene !== "all" && d.sceneCategory !== scene) return false;
      if (!inHoursBucket(d.hours, hours)) return false;
      if (quality > 0 && d.qualityScore < quality) return false;
      if (sensors.size > 0) {
        for (const s of sensors) {
          if (!d.sensors.includes(s)) return false;
        }
      }
      if (query) {
        const q = query.toLowerCase();
        if (
          !(
            d.title.toLowerCase().includes(q) ||
            d.task.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q)
          )
        ) {
          return false;
        }
      }
      return true;
    });
  }, [datasets, query, format, scene, sensors, hours, quality]);

  const activeFilterCount =
    (format !== "all" ? 1 : 0) +
    (scene !== "all" ? 1 : 0) +
    sensors.size +
    (hours !== "any" ? 1 : 0) +
    (quality > 0 ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="card p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-[color:var(--color-text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by task, scene…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--color-text-dim)]"
            />
          </div>
          <FilterPills
            label="format"
            options={[
              { id: "all", label: "all" },
              { id: "premium", label: "premium" },
              { id: "standard", label: "standard" },
            ]}
            value={format}
            onChange={(v) => setFormat(v as FormatFilter)}
            accent
          />
          <FilterPills
            label="scene"
            options={scenes.map((s) => ({ id: s, label: s }))}
            value={scene}
            onChange={(v) => setScene(v)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-[color:var(--color-border)] pt-3">
          <FilterPills
            label="hours"
            options={HOURS_BUCKETS.map((b) => ({ id: b.id, label: b.label }))}
            value={hours}
            onChange={(v) => setHours(v as HoursBucket)}
          />
          <FilterPills
            label="quality"
            options={QUALITY_BUCKETS.map((b) => ({
              id: String(b.id),
              label: b.label,
              icon: b.id > 0 ? <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> : undefined,
            }))}
            value={String(quality)}
            onChange={(v) => setQuality(parseFloat(v) as QualityBucket)}
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-dim)] mr-1">
              sensors
            </span>
            {availableSensors.map((s) => {
              const meta = getSensorMeta(s);
              const Icon = meta.Icon;
              const on = sensors.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSensor(s)}
                  className={[
                    "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] mono transition-colors",
                    on
                      ? "border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                      : "border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
                  ].join(" ")}
                >
                  <Icon className="h-2.5 w-2.5" />
                  {meta.label}
                </button>
              );
            })}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setFormat("all");
                setScene("all");
                setSensors(new Set());
                setHours("any");
                setQuality(0);
              }}
              className="ml-auto text-[10px] mono uppercase tracking-wider text-[color:var(--color-text-muted)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              clear ({activeFilterCount})
            </button>
          )}
        </div>
      </div>
      <div className="text-[10px] mono text-[color:var(--color-text-dim)] tabular-nums">
        {filtered.length} dataset{filtered.length === 1 ? "" : "s"} match
      </div>
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
        }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((d) => (
            <motion.div
              key={d.id}
              layout
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            >
              <DatasetCard dataset={d} />
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 card p-10 text-center text-sm text-[color:var(--color-text-muted)]">
            No datasets match those filters.
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface PillOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

function FilterPills({
  label,
  options,
  value,
  onChange,
  accent,
}: {
  label: string;
  options: PillOption[];
  value: string;
  onChange: (v: string) => void;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-[color:var(--color-border)] p-0.5">
      <span className="px-1.5 text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-dim)]">
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={[
            "inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded uppercase tracking-wider transition-colors",
            value === o.id
              ? accent
                ? "bg-[color:var(--color-accent)] text-[#14110a]"
                : "bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]"
              : "text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
          ].join(" ")}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
