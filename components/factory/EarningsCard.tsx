"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ArrowUpRight, ArrowRight } from "lucide-react";
import { useBonus } from "@/lib/bonus";
import type { Pricing } from "@/lib/data";

export interface EarningsCardProps {
  pricing: Pricing;
  hoursThisMonth: number;
}

export function EarningsCard({
  pricing,
  hoursThisMonth,
}: EarningsCardProps) {
  const r = pricing.factoryRates;
  const bonusPayout = useBonus();
  const monthRaw = hoursThisMonth * r.rawPerHour;
  const monthAnnotation = hoursThisMonth * r.annotationBonusPerHour;
  const monthTotal = monthRaw + monthAnnotation + bonusPayout;

  return (
    <div className="card p-6 relative overflow-hidden bg-grid">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[color:var(--color-accent)]/8 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
          <Coins className="h-4 w-4" />
          <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
            Factory earnings
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-5xl font-semibold tracking-tight tabular-nums text-[color:var(--color-accent)]">
            ${r.totalPerHour}
          </span>
          <span className="text-sm text-[color:var(--color-text-muted)]">/hr earned</span>
        </div>
        <div className="mt-2 text-xs text-[color:var(--color-text-muted)]">
          Raw <span className="mono text-[color:var(--color-text)]">${r.rawPerHour}</span>
          {" + "}
          Annotation bonus <span className="mono text-[color:var(--color-text)]">${r.annotationBonusPerHour}</span>
          {" "}once QA-approved.
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat label="hours · this mo." value={`${hoursThisMonth.toFixed(1)}`} />
          <MiniStat label="paid · this mo." value={`$${monthRaw.toFixed(0)}`} />
          <MiniStat
            label="bonus accrued"
            value={`$${(monthAnnotation + bonusPayout).toFixed(0)}`}
            accent
          />
        </div>
        <motion.div
          key={monthTotal}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex items-center justify-between rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
            month-to-date
          </span>
          <span className="mono tabular-nums text-[color:var(--color-text)]">
            ${monthTotal.toFixed(0)}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            14% w/w
          </span>
        </motion.div>
        <AnimatePresence>
          {bonusPayout > 0 && (
            <motion.div
              key="bonus-pop"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 rounded-md border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)]/50 px-3 py-2 text-xs text-[color:var(--color-accent)]"
            >
              + ${bonusPayout.toFixed(0)} marketplace payout received
            </motion.div>
          )}
        </AnimatePresence>
        <Link
          href="/factory/earnings"
          className="mt-4 inline-flex items-center gap-1 text-xs text-[color:var(--color-accent)] hover:text-[color:var(--color-text)] transition-colors"
        >
          View earnings
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
        {label}
      </div>
      <div
        className={[
          "mt-1 text-lg font-semibold tabular-nums",
          accent ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-text)]",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
