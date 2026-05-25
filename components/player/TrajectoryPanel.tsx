"use client";

import { useMemo } from "react";
import { usePlayerState } from "./PlayerContext";
import type { TracksData } from "@/lib/types";

export interface TrajectoryPanelProps {
  tracks: TracksData;
  duration: number;
}

const AXES = ["X", "Y", "Z"] as const;
const HAND_COLORS = {
  left: "#60a5fa",
  right: "#f4a13b",
};

/**
 * Plots LeftHand & RightHand end-effector position over time, one row per axis.
 * Vertical playhead tracks currentTime.
 */
export function TrajectoryPanel({ tracks, duration }: TrajectoryPanelProps) {
  const { currentTime } = usePlayerState();

  const series = useMemo(() => {
    const computed = AXES.map((_, axis) => {
      let lmin = Infinity,
        lmax = -Infinity;
      const left: number[] = [];
      const right: number[] = [];
      for (let i = 0; i < tracks.t.length; i++) {
        const lv = tracks.leftHand.pos[i][axis];
        const rv = tracks.rightHand.pos[i][axis];
        left.push(lv);
        right.push(rv);
        if (lv < lmin) lmin = lv;
        if (rv < lmin) lmin = rv;
        if (lv > lmax) lmax = lv;
        if (rv > lmax) lmax = rv;
      }
      const range = Math.max(0.01, lmax - lmin);
      const pad = range * 0.1;
      return { left, right, min: lmin - pad, max: lmax + pad };
    });
    return computed;
  }, [tracks]);

  const W = 600;
  const H = 70;

  const toPath = (vals: number[], min: number, max: number) => {
    const range = max - min || 1;
    return vals
      .map((v, i) => {
        const x = (i / (vals.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const playheadX = duration > 0 ? (currentTime / duration) * W : 0;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
          End-effector trajectory
        </span>
        <div className="flex gap-3 text-[10px]">
          <Legend color={HAND_COLORS.left} label="left hand" />
          <Legend color={HAND_COLORS.right} label="right hand" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {AXES.map((axis, ax) => {
          const { left, right, min, max } = series[ax];
          return (
            <div
              key={axis}
              className="flex items-center gap-3 rounded-md bg-[color:var(--color-surface-2)] px-2 py-1.5"
            >
              <span className="mono text-[10px] text-[color:var(--color-text-muted)] w-3">
                {axis}
              </span>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="flex-1 h-12"
              >
                <line
                  x1={0}
                  x2={W}
                  y1={H / 2}
                  y2={H / 2}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="2 4"
                />
                <path
                  d={toPath(left, min, max)}
                  stroke={HAND_COLORS.left}
                  strokeWidth={1.3}
                  fill="none"
                />
                <path
                  d={toPath(right, min, max)}
                  stroke={HAND_COLORS.right}
                  strokeWidth={1.3}
                  fill="none"
                />
                <line
                  x1={playheadX}
                  x2={playheadX}
                  y1={0}
                  y2={H}
                  stroke="#fff"
                  strokeWidth={0.8}
                  opacity={0.7}
                />
              </svg>
              <span className="mono text-[10px] tabular-nums text-[color:var(--color-text-muted)] w-20 text-right">
                {min.toFixed(2)}…{max.toFixed(2)}
              </span>
            </div>
          );
        })}
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
