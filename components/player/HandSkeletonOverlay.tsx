"use client";

import { useMemo } from "react";
import { usePlayerState } from "./PlayerContext";
import { findIndexForTime } from "@/lib/tracks";
import type { TracksData } from "@/lib/types";

export interface HandSkeletonProps {
  tracks: TracksData;
}

const HAND_COLORS = {
  left: "#60a5fa",
  right: "#f4a13b",
};

const FINGER_COLORS = ["#fb7185", "#fbbf24", "#a3e635", "#22d3ee", "#c084fc"];

const ACCENT = "#f4a13b";

/**
 * Stylized 2D projection of finger joints + wrist onto a wrist-cam video pane.
 *
 * Uses the (X, Z) plane of robot-base (RH-FLU) — X horizontal, Z flipped so up
 * is up — normalized to a per-mount AABB across the loaded slice. This is not a
 * true camera projection (we don't have extrinsics) but reads as a translucent
 * skeleton tracking the operator's finger pose against the wrist video.
 */
export function HandSkeletonWristOverlay({
  tracks,
  hand,
}: {
  tracks: TracksData;
  hand: "left" | "right";
}) {
  const { currentTime } = usePlayerState();
  const fingers = hand === "left" ? tracks.fingersL : tracks.fingersR;
  const wristTrack = hand === "left" ? tracks.leftHand : tracks.rightHand;

  const bbox = useMemo(() => {
    let xmin = Infinity,
      xmax = -Infinity,
      zmin = Infinity,
      zmax = -Infinity;
    for (const frame of fingers.pos) {
      for (const j of frame) {
        if (j[0] < xmin) xmin = j[0];
        if (j[0] > xmax) xmax = j[0];
        if (j[2] < zmin) zmin = j[2];
        if (j[2] > zmax) zmax = j[2];
      }
    }
    for (const w of wristTrack.pos) {
      if (w[0] < xmin) xmin = w[0];
      if (w[0] > xmax) xmax = w[0];
      if (w[2] < zmin) zmin = w[2];
      if (w[2] > zmax) zmax = w[2];
    }
    const xRange = Math.max(0.05, xmax - xmin);
    const zRange = Math.max(0.05, zmax - zmin);
    const padX = xRange * 0.18;
    const padZ = zRange * 0.18;
    return {
      xmin: xmin - padX,
      xmax: xmax + padX,
      zmin: zmin - padZ,
      zmax: zmax + padZ,
    };
  }, [fingers, wristTrack]);

  const { i0, i1, frac } = findIndexForTime(tracks.t, currentTime);
  const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

  const joints = fingers.pos[i0].map((p, i) => {
    const q = fingers.pos[i1][i];
    return [
      lerp(p[0], q[0], frac),
      lerp(p[1], q[1], frac),
      lerp(p[2], q[2], frac),
    ] as [number, number, number];
  });
  const wristNow: [number, number, number] = [
    lerp(wristTrack.pos[i0][0], wristTrack.pos[i1][0], frac),
    lerp(wristTrack.pos[i0][1], wristTrack.pos[i1][1], frac),
    lerp(wristTrack.pos[i0][2], wristTrack.pos[i1][2], frac),
  ];

  const project = (p: readonly number[]): [number, number] => {
    const px = ((p[0] - bbox.xmin) / (bbox.xmax - bbox.xmin)) * 100;
    const py = 100 - ((p[2] - bbox.zmin) / (bbox.zmax - bbox.zmin)) * 100;
    return [px, py];
  };

  const w = project(wristNow);
  const filterId = `fj-glow-${hand}`;

  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {[0, 1, 2, 3, 4].map((f) => {
            const fpts = [0, 1, 2, 3].map((j) => project(joints[f * 4 + j]));
            const path = `M${w[0]},${w[1]} L${fpts
              .map((p) => `${p[0]},${p[1]}`)
              .join(" L")}`;
            return (
              <g key={f}>
                <path
                  d={path}
                  stroke={ACCENT}
                  strokeOpacity={0.78}
                  strokeWidth={0.55}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {fpts.map(([x, y], idx) => (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={idx === 3 ? 0.95 : 0.7}
                    fill={ACCENT}
                    fillOpacity={0.9}
                  />
                ))}
              </g>
            );
          })}
          <circle
            cx={w[0]}
            cy={w[1]}
            r={1.4}
            fill={ACCENT}
            fillOpacity={0.95}
            stroke="#000"
            strokeOpacity={0.4}
            strokeWidth={0.2}
          />
        </g>
      </svg>
      <div className="absolute bottom-1.5 right-1.5 mono text-[9px] font-medium tracking-[0.14em] text-[color:var(--color-accent)] bg-black/55 backdrop-blur-sm rounded px-1.5 py-0.5">
        FJ-{hand === "left" ? "L" : "R"} · 20J
      </div>
    </div>
  );
}

/**
 * 2D top-down (X-Y plane) visualization of the two hand skeletons,
 * normalized to a fixed view window computed from the full trajectory bbox.
 *
 * Finger joint indexing (per Praxis FJ_<finger>_<joint>):
 *   finger 0..4 = Thumb, Index, Middle, Ring, Little
 *   joint  0..3 = CMC, MCP, IP, Tip  (for thumb) or MCP, PIP, DIP, Tip (others)
 */
export function HandSkeleton({ tracks }: HandSkeletonProps) {
  const { currentTime } = usePlayerState();

  const bbox = useMemo(() => {
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    const consider = (p: number[]) => {
      if (p[0] < xmin) xmin = p[0];
      if (p[0] > xmax) xmax = p[0];
      if (p[1] < ymin) ymin = p[1];
      if (p[1] > ymax) ymax = p[1];
    };
    for (const arr of [tracks.fingersL.pos, tracks.fingersR.pos]) {
      for (const frame of arr) for (const j of frame) consider(j);
    }
    for (const arr of [tracks.leftHand.pos, tracks.rightHand.pos]) {
      for (const p of arr) consider(p);
    }
    const padX = (xmax - xmin) * 0.08;
    const padY = (ymax - ymin) * 0.08;
    return {
      xmin: xmin - padX,
      xmax: xmax + padX,
      ymin: ymin - padY,
      ymax: ymax + padY,
    };
  }, [tracks]);

  const { i0, i1, frac } = findIndexForTime(tracks.t, currentTime);

  const W = 560;
  const H = 400;

  const project = (p: [number, number, number] | number[]): [number, number] => {
    const x = ((p[0] - bbox.xmin) / (bbox.xmax - bbox.xmin)) * W;
    // flip Y so positive Y is up
    const y = H - ((p[1] - bbox.ymin) / (bbox.ymax - bbox.ymin)) * H;
    return [x, y];
  };

  const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
  const lerpVec3 = (a: number[], b: number[], f: number): [number, number, number] => [
    lerp(a[0], b[0], f),
    lerp(a[1], b[1], f),
    lerp(a[2], b[2], f),
  ];

  const fingersL = tracks.fingersL.pos[i0].map((p, i) =>
    lerpVec3(p, tracks.fingersL.pos[i1][i], frac),
  );
  const fingersR = tracks.fingersR.pos[i0].map((p, i) =>
    lerpVec3(p, tracks.fingersR.pos[i1][i], frac),
  );
  const leftHand = lerpVec3(
    tracks.leftHand.pos[i0],
    tracks.leftHand.pos[i1],
    frac,
  );
  const rightHand = lerpVec3(
    tracks.rightHand.pos[i0],
    tracks.rightHand.pos[i1],
    frac,
  );

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
          Hand Pose · 40 joints
        </span>
        <span className="mono text-[10px] text-[color:var(--color-text-dim)]">
          X·Y plane · RH-FLU
        </span>
      </div>
      <div className="mt-3 relative aspect-[7/5] w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
        >
          <Grid w={W} h={H} />
          <HandSvg
            joints={fingersL}
            wrist={leftHand}
            color={HAND_COLORS.left}
            project={project}
            label="L"
          />
          <HandSvg
            joints={fingersR}
            wrist={rightHand}
            color={HAND_COLORS.right}
            project={project}
            label="R"
          />
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px]">
        <Legend color={HAND_COLORS.left} label="L hand · 20 joints + wrist" />
        <Legend color={HAND_COLORS.right} label="R hand · 20 joints + wrist" />
      </div>
    </div>
  );
}

function Grid({ w, h }: { w: number; h: number }) {
  const step = 40;
  const lines = [];
  for (let x = 0; x <= w; x += step) {
    lines.push(
      <line
        key={`vx${x}`}
        x1={x}
        x2={x}
        y1={0}
        y2={h}
        stroke="rgba(255,255,255,0.04)"
      />,
    );
  }
  for (let y = 0; y <= h; y += step) {
    lines.push(
      <line
        key={`hy${y}`}
        x1={0}
        x2={w}
        y1={y}
        y2={y}
        stroke="rgba(255,255,255,0.04)"
      />,
    );
  }
  return <g>{lines}</g>;
}

function HandSvg({
  joints,
  wrist,
  color,
  project,
  label,
}: {
  joints: [number, number, number][];
  wrist: [number, number, number];
  color: string;
  project: (p: number[]) => [number, number];
  label: string;
}) {
  const wristP = project(wrist);

  return (
    <g>
      {[0, 1, 2, 3, 4].map((finger) => {
        const fingerColor = FINGER_COLORS[finger];
        const pts = [0, 1, 2, 3].map((joint) =>
          project(joints[finger * 4 + joint]),
        );
        const path = `M${wristP[0]},${wristP[1]} L${pts.map((p) => `${p[0]},${p[1]}`).join(" L")}`;
        return (
          <g key={finger}>
            <path
              d={path}
              stroke={fingerColor}
              strokeWidth={1.4}
              fill="none"
              opacity={0.6}
            />
            {pts.map((p, idx) => (
              <circle
                key={idx}
                cx={p[0]}
                cy={p[1]}
                r={idx === 3 ? 3.5 : 2}
                fill={idx === 3 ? fingerColor : "rgba(255,255,255,0.85)"}
                stroke={fingerColor}
                strokeWidth={1}
              />
            ))}
          </g>
        );
      })}
      <circle cx={wristP[0]} cy={wristP[1]} r={6} fill={color} stroke="#000" strokeWidth={1.5} />
      <text
        x={wristP[0]}
        y={wristP[1] + 2}
        textAnchor="middle"
        fontSize={8}
        fill="#000"
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[color:var(--color-text-muted)]">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
