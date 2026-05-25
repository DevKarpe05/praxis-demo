"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const WEEKS = Array.from({ length: 8 }).map((_, i) => {
  const week = i + 1;
  // Plausibly trending up: 70 → ~115h captured per week
  const hours = Math.round(70 + i * 5.5 + Math.sin(i * 1.3) * 6);
  return {
    week: `W${week}`,
    hours,
    raw: hours * 6,
    annotation: hours * 4,
    total: hours * 10,
  };
});

export function EarningsTrendChart() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
            Earnings · last 8 weeks
          </div>
          <div className="mt-1 text-sm font-medium">
            Raw + annotation bonus, USD
          </div>
        </div>
        <div className="flex gap-3 text-[10px]">
          <Legend color="#60a5fa" label="raw $6/hr" />
          <Legend color="#f4a13b" label="annotation $4/hr" />
        </div>
      </div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={WEEKS}
            margin={{ top: 4, right: 12, left: -12, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5d6470", fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5d6470", fontSize: 10 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#0f1115",
                border: "1px solid #232733",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#9aa1ad", fontSize: 10 }}
              formatter={(value: number, name: string) => [`$${value}`, name]}
            />
            <Bar
              dataKey="raw"
              stackId="earn"
              fill="#60a5fa"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="annotation"
              stackId="earn"
              fill="#f4a13b"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
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
