import type { Operator } from "@/lib/data";

const STATUS_COLORS: Record<Operator["status"], string> = {
  active: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  idle: "text-amber-300 bg-amber-500/15 border-amber-500/30",
  offline: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
};

export function OperatorsList({ operators }: { operators: Operator[] }) {
  return (
    <div className="card p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
        Operators · anonymized
      </div>
      <div className="mt-4 space-y-2">
        {operators.map((o) => (
          <div
            key={o.id}
            className="flex items-center justify-between rounded-md bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] px-3 py-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[color:var(--color-accent)]/40 to-[color:var(--color-accent)]/10 border border-[color:var(--color-accent)]/30 flex items-center justify-center mono text-[10px]">
                {o.id.slice(-3)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium">{o.label}</div>
                <div className="mono text-[10px] text-[color:var(--color-text-dim)] truncate">
                  {o.currentDevice}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs tabular-nums">{o.hoursThisMonth.toFixed(1)}h</div>
                <div className="text-[10px] text-[color:var(--color-text-dim)]">this mo.</div>
              </div>
              <span
                className={`tag border ${STATUS_COLORS[o.status]}`}
                style={{ textTransform: "uppercase" }}
              >
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
