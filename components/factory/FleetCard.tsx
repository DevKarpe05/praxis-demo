import { Battery, Wifi } from "lucide-react";
import type { Device } from "@/lib/data";

export function FleetCard({ devices }: { devices: Device[] }) {
  const totalOnline = devices.reduce((a, d) => a + d.online, 0);
  const totalUnits = devices.reduce((a, d) => a + d.total, 0);
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
            Fleet · factory_024
          </div>
          <div className="mt-1 text-lg font-semibold tracking-tight">
            {totalOnline} / {totalUnits} devices online
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300 font-medium">
            live
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {devices.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{d.type}</div>
              <div className="mono text-[10px] text-[color:var(--color-text-dim)] truncate">
                {d.spec}
              </div>
            </div>
            <div className="flex items-center gap-3 ml-3">
              <div className="flex items-center gap-1 text-[10px] text-[color:var(--color-text-muted)]">
                <Wifi className="h-3 w-3" />
                <span className="mono">
                  {d.online}/{d.total}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[color:var(--color-text-muted)]">
                <Battery className="h-3 w-3" />
                <span className="mono">{d.battery}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
