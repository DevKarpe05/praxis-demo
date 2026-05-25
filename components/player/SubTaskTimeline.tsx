"use client";

import { usePlayerControls, usePlayerState } from "./PlayerContext";
import type { SubtaskSegment } from "@/lib/types";

export interface SubTaskTimelineProps {
  subtasks: SubtaskSegment[];
  duration: number;
}

const PALETTE = [
  "#f4a13b",
  "#60a5fa",
  "#a3e635",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#c084fc",
  "#22d3ee",
];

export function SubTaskTimeline({ subtasks, duration }: SubTaskTimelineProps) {
  const { currentTime } = usePlayerState();
  const controls = usePlayerControls();

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
          Sub-task Timeline
        </span>
        <span className="mono text-[10px] text-[color:var(--color-text-dim)]">
          {subtasks.length} segments · {duration.toFixed(1)}s
        </span>
      </div>
      <div className="mt-3 relative h-9 rounded-md bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] overflow-hidden">
        {subtasks.map((s, i) => {
          const left = (s.start / duration) * 100;
          const width = ((s.end - s.start) / duration) * 100;
          const color = PALETTE[i % PALETTE.length];
          const isActive =
            currentTime >= s.start && currentTime < s.end;
          return (
            <button
              key={i}
              onClick={() => controls.seek(s.start + 0.05)}
              title={s.label}
              className="absolute top-0 h-full transition-all"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                background: isActive ? color : `${color}66`,
                borderLeft: i === 0 ? "none" : "1px solid rgba(0,0,0,0.5)",
              }}
            >
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[9px] mono text-black/80 font-medium">
                {i + 1}
              </span>
            </button>
          );
        })}
        <div
          className="absolute top-0 h-full w-px bg-white"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-white shadow" />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {subtasks.map((s, i) => {
          const color = PALETTE[i % PALETTE.length];
          const isActive =
            currentTime >= s.start && currentTime < s.end;
          return (
            <button
              key={i}
              onClick={() => controls.seek(s.start + 0.05)}
              className={[
                "rounded px-1.5 py-0.5 text-[10px] mono transition-all",
                isActive
                  ? "border-white/30 bg-white/5 text-white"
                  : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
                "border",
              ].join(" ")}
              style={isActive ? { borderColor: color, color } : undefined}
            >
              <span className="opacity-60">{i + 1}</span>
              <span className="ml-1">{s.start.toFixed(1)}–{s.end.toFixed(1)}s</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
