import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Coins, Info } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { EarningsTrendChart } from "@/components/factory/EarningsTrendChart";
import { loadOperators, loadPricing } from "@/lib/data";

const NEXT_PAYOUT = "Friday, May 29";

export default async function FactoryEarningsPage() {
  const [operators, pricing] = await Promise.all([
    loadOperators(),
    loadPricing(),
  ]);

  const totalHours = operators.reduce((a, o) => a + o.hoursThisMonth, 0);
  const r = pricing.factoryRates;
  const monthRaw = totalHours * r.rawPerHour;
  const monthAnnotation = totalHours * r.annotationBonusPerHour;
  const monthTotal = monthRaw + monthAnnotation;

  const ranked = [...operators].sort(
    (a, b) => b.hoursThisMonth - a.hoursThisMonth,
  );
  const topHours = ranked[0]?.hoursThisMonth ?? 1;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 space-y-6">
      <Link
        href="/factory"
        className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to factory
      </Link>

      <SectionHeader
        eyebrow="Factory · earnings"
        title="$10.00 / hr earned"
        subtitle="Raw $6/hr at upload + Annotation bonus $4/hr once data passes QA/QC. Payouts every Friday."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 relative overflow-hidden bg-grid lg:col-span-1">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[color:var(--color-accent)]/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
              <Coins className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
                Headline rate
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-5xl font-semibold tracking-tight tabular-nums text-[color:var(--color-accent)]">
                ${r.totalPerHour}.00
              </span>
              <span className="text-sm text-[color:var(--color-text-muted)]">
                /hr earned
              </span>
            </div>
            <div className="mt-2 text-xs text-[color:var(--color-text-muted)]">
              Raw{" "}
              <span className="mono text-[color:var(--color-text)]">
                ${r.rawPerHour}
              </span>{" "}
              + Annotation bonus{" "}
              <span className="mono text-[color:var(--color-text)]">
                ${r.annotationBonusPerHour}
              </span>
            </div>

            <div className="mt-5 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs text-[color:var(--color-text-muted)] flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-[color:var(--color-accent)] mt-0.5 flex-none" />
              <span>
                Praxis pays for raw capture, plus a bonus once your data passes
                QA/QC.
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            label="hours · this mo."
            value={totalHours.toFixed(1)}
            hint="captured by factory_024"
          />
          <Stat
            label="raw paid"
            value={`$${monthRaw.toFixed(0)}`}
            hint={`@ $${r.rawPerHour}/hr`}
          />
          <Stat
            label="annotation bonus"
            value={`$${monthAnnotation.toFixed(0)}`}
            hint={`@ $${r.annotationBonusPerHour}/hr · QA-cleared`}
            accent
          />
          <Stat
            label="month-to-date"
            value={`$${monthTotal.toFixed(0)}`}
            hint={`Next payout ${NEXT_PAYOUT}`}
            large
          />
        </div>
      </div>

      <EarningsTrendChart />

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-[color:var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
              Per-operator earnings
            </div>
            <div className="mt-0.5 text-sm font-medium">
              Anonymized · this month
            </div>
          </div>
          <div className="text-[10px] text-[color:var(--color-text-dim)] mono">
            sorted by hours
          </div>
        </div>
        <div className="divide-y divide-[color:var(--color-border)]">
          {ranked.map((o, i) => {
            const raw = o.hoursThisMonth * r.rawPerHour;
            const ann = o.hoursThisMonth * r.annotationBonusPerHour;
            const tot = raw + ann;
            const widthPct = Math.max(8, (o.hoursThisMonth / topHours) * 100);
            return (
              <div
                key={o.id}
                className="px-5 py-3 flex items-center gap-4"
              >
                <div className="w-6 text-center mono text-[10px] text-[color:var(--color-text-dim)] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[color:var(--color-accent)]/40 to-[color:var(--color-accent)]/10 border border-[color:var(--color-accent)]/30 flex items-center justify-center mono text-[10px] flex-none">
                  {o.id.slice(-3)}
                </div>
                <div className="min-w-0 flex-none w-48">
                  <div className="text-xs font-medium truncate">{o.label}</div>
                  <div className="mono text-[10px] text-[color:var(--color-text-dim)] truncate">
                    {o.currentDevice}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="relative h-2 rounded-full bg-[color:var(--color-surface-2)] overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[color:var(--color-accent)]/60"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[color:var(--color-text-muted)]">
                    <span className="mono tabular-nums">
                      {o.hoursThisMonth.toFixed(1)}h · ★{" "}
                      {o.averageQuality.toFixed(1)}
                    </span>
                    <span className="mono tabular-nums">
                      ${raw.toFixed(0)} raw · ${ann.toFixed(0)} bonus
                    </span>
                  </div>
                </div>
                <div className="flex-none w-20 text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    ${tot.toFixed(0)}
                  </div>
                  <div className="flex items-center justify-end gap-0.5 text-[10px] text-emerald-400">
                    <ArrowUpRight className="h-2.5 w-2.5" />
                    <span className="mono">
                      {(8 + (i % 3) * 3).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5 text-xs text-[color:var(--color-text-muted)]">
        <span className="text-[color:var(--color-text)] font-medium">
          How it works.
        </span>{" "}
        Praxis settles raw capture immediately on upload (
        <span className="mono text-[color:var(--color-text)]">
          ${r.rawPerHour}/hr
        </span>
        ). The annotation bonus (
        <span className="mono text-[color:var(--color-text)]">
          ${r.annotationBonusPerHour}/hr
        </span>
        ) accrues once your captured episode passes QA/QC and is released into
        the marketplace as a (video, trajectory, instruction) triplet. Both
        components are paid out together every Friday in {pricing.factoryRates.currency}.
      </div>
    </div>
  );
}
