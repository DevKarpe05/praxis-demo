"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DATA = Array.from({ length: 14 }).map((_, i) => {
  const day = i + 1;
  const base = 22 + Math.sin(i / 2) * 9 + i * 1.4;
  return {
    day: `D${day}`,
    captured: Math.round(base + Math.random() * 3),
    released: Math.round(base * 0.86 + Math.random() * 2),
  };
});

export function ThroughputChart() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
            Throughput · 14 days
          </div>
          <div className="mt-1 text-sm font-medium">Captured vs released hours</div>
        </div>
        <div className="flex gap-3 text-[10px]">
          <Legend color="#60a5fa" label="captured" />
          <Legend color="#f4a13b" label="released" />
        </div>
      </div>
      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="g_cap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g_rel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f4a13b" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#f4a13b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5d6470", fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5d6470", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: "#0f1115",
                border: "1px solid #232733",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#9aa1ad", fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="captured"
              stroke="#60a5fa"
              fill="url(#g_cap)"
              strokeWidth={1.6}
            />
            <Area
              type="monotone"
              dataKey="released"
              stroke="#f4a13b"
              fill="url(#g_rel)"
              strokeWidth={1.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[color:var(--color-text-muted)]">
      <span
        className="inline-block h-2 w-3 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
