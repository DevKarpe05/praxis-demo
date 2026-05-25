"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Check,
  Loader2,
  PartyPopper,
  ArrowRight,
  Video,
  LineChart,
  MessageSquare,
} from "lucide-react";
import {
  PIPELINE_STAGES,
  PIPELINE_TOTAL_SEC,
  type PipelineStage,
  type PipelineStatus,
} from "@/lib/pipeline";

interface UploadResponse {
  jobId: string;
  startedAtMillis: number;
  totalDurationSec: number;
  episodeId: string;
  datasetId: string;
  stages: PipelineStage[];
}

interface JobPollResponse {
  jobId: string;
  status: PipelineStatus;
  currentStage: string;
  stageIndex: number;
  stageProgress: number;
  elapsed: number;
  totalDuration: number;
  stages: PipelineStage[];
}

const DEFAULT_INSTRUCTION = "tidy shoe cabinet";
const DEFAULT_DATASET_ID = "ds_home_tidy_shoe_cabinet";
const DEFAULT_FILENAME = "episode_1778330002413_bundle.zip";
const DEFAULT_SIZE_BYTES = 92_847_201;

const POLL_INTERVAL_MS = 350;
const MAX_TRANSIENT_RETRIES = 5;

export interface PipelineSimulatorProps {
  /**
   * High-level instruction surfaced in the typewriter micro-animation. Defaults
   * to the bundled-in episode's task ("tidy shoe cabinet").
   */
  instruction?: string;
  /**
   * Marketplace dataset id the released triplet deep-links to. May be
   * overridden by the value returned from POST /api/upload.
   */
  datasetId?: string;
}

export function PipelineSimulator({
  instruction = DEFAULT_INSTRUCTION,
  datasetId: datasetIdProp = DEFAULT_DATASET_ID,
}: PipelineSimulatorProps = {}) {
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [poll, setPoll] = useState<JobPollResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const datasetId = upload?.datasetId ?? datasetIdProp;
  const jobId = upload?.jobId ?? null;

  const startUpload = useCallback(async () => {
    setError(null);
    setPoll(null);
    setUpload(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`upload status ${res.status}`);
      const data: UploadResponse = await res.json();
      setUpload(data);
    } catch (e) {
      setError(`Failed to start upload: ${String(e)}`);
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let transientRetries = 0;

    const tick = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data: JobPollResponse = await res.json();
        if (cancelled) return;
        transientRetries = 0;
        setPoll(data);
        if (data.status !== "complete") {
          pollTimerRef.current = window.setTimeout(tick, POLL_INTERVAL_MS);
        }
      } catch (e) {
        if (cancelled) return;
        if (transientRetries < MAX_TRANSIENT_RETRIES) {
          transientRetries += 1;
          // Exponential-ish backoff: 300, 600, 900, 1200, 1500 ms.
          const backoff = 300 * transientRetries;
          pollTimerRef.current = window.setTimeout(tick, backoff);
          return;
        }
        setError(`Polling failed after retries: ${String(e)}`);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [jobId]);

  const stages = poll?.stages ?? upload?.stages ?? PIPELINE_STAGES;
  const stageIndex = poll?.stageIndex ?? -1;
  const stageProgress = poll?.stageProgress ?? 0;
  const isComplete = poll?.status === "complete";
  const totalBytes = DEFAULT_SIZE_BYTES;
  const filename = DEFAULT_FILENAME;
  const totalDurationSec = upload?.totalDurationSec ?? PIPELINE_TOTAL_SEC;

  return (
    <div className="space-y-5">
      <Dropzone
        onSubmit={startUpload}
        active={!!jobId}
        complete={isComplete}
        filename={filename}
        sizeBytes={totalBytes}
        totalDurationSec={totalDurationSec}
      />

      <AnimatePresence>
        {jobId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
                  Pipeline · job
                </div>
                <div className="mt-1 mono text-xs">{jobId}</div>
              </div>
              {isComplete ? (
                <span className="tag border-emerald-500/30 bg-emerald-500/10 text-emerald-300 uppercase">
                  released
                </span>
              ) : (
                <span className="tag border-amber-500/30 bg-amber-500/10 text-amber-300 uppercase">
                  processing
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {stages.map((s, i) => (
                <StageRow
                  key={s.id}
                  stage={s}
                  index={i}
                  current={stageIndex}
                  stageProgress={stageProgress}
                  done={isComplete}
                  totalBytes={totalBytes}
                  instruction={instruction}
                />
              ))}
            </div>

            <AnimatePresence>
              {isComplete && (
                <ReleaseCard datasetId={datasetId} instruction={instruction} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComplete && (
          <FlyToMarketplaceToast
            datasetId={datasetId}
            instruction={instruction}
          />
        )}
      </AnimatePresence>

      {error && (
        <div className="card p-3 text-xs text-rose-400 border-rose-500/30">
          {error}
        </div>
      )}
    </div>
  );
}

function Dropzone({
  onSubmit,
  active,
  complete,
  filename,
  sizeBytes,
  totalDurationSec,
}: {
  onSubmit: () => void;
  active: boolean;
  complete: boolean;
  filename: string;
  sizeBytes: number;
  totalDurationSec: number;
}) {
  const sizeMB = sizeBytes / 1024 / 1024;

  return (
    <div className="card p-6 border-dashed">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-[color:var(--color-accent-soft)] border border-[color:var(--color-accent)]/30 flex items-center justify-center text-[color:var(--color-accent)]">
          <Upload className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{filename}</div>
          <div className="text-xs text-[color:var(--color-text-muted)] mono">
            {sizeMB.toFixed(1)} MB · ZED2i head + L/R wrist + HDF5 + camera.json · ~{totalDurationSec}s pipeline
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={active && !complete}
          className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {active && !complete ? "Processing…" : complete ? "Re-upload" : "Start upload"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StageRow({
  stage,
  index,
  current,
  stageProgress,
  done,
  totalBytes,
  instruction,
}: {
  stage: PipelineStage;
  index: number;
  current: number;
  stageProgress: number;
  done: boolean;
  totalBytes: number;
  instruction: string;
}) {
  const isDone = done || index < current;
  const isActive = index === current && !done;
  const isPending = !isDone && !isActive;
  const localProgress = isDone ? 1 : isActive ? stageProgress : 0;

  return (
    <div className="relative rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-[color:var(--color-accent)]/10 transition-[width] duration-200"
        style={{ width: `${localProgress * 100}%` }}
      />
      <div className="relative flex items-center gap-3 px-3 py-2">
        <div
          className="h-7 w-7 rounded-md flex items-center justify-center border"
          style={{
            borderColor: isPending
              ? "var(--color-border)"
              : isActive
                ? "var(--color-accent)"
                : "rgba(74, 222, 128, 0.4)",
            background: isPending
              ? "transparent"
              : isActive
                ? "var(--color-accent-soft)"
                : "rgba(74, 222, 128, 0.1)",
          }}
        >
          {isDone ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : isActive ? (
            <Loader2 className="h-3.5 w-3.5 text-[color:var(--color-accent)] animate-spin" />
          ) : (
            <span className="mono text-[10px] text-[color:var(--color-text-dim)]">
              {index + 1}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium">{stage.label}</div>
          <div className="text-[10px] text-[color:var(--color-text-muted)] truncate">
            {stage.description}
          </div>
        </div>
        <div className="mono text-[10px] text-[color:var(--color-text-dim)] tabular-nums">
          {isDone ? "100%" : isActive ? `${Math.floor(localProgress * 100)}%` : "—"}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key={`${stage.id}-anim`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0.5 border-t border-[color:var(--color-border)]/60">
              <StageMicroAnim
                stage={stage}
                progress={localProgress}
                totalBytes={totalBytes}
                instruction={instruction}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageMicroAnim({
  stage,
  progress,
  totalBytes,
  instruction,
}: {
  stage: PipelineStage;
  progress: number;
  totalBytes: number;
  instruction: string;
}) {
  switch (stage.id) {
    case "ingest":
      return <IngestAnim progress={progress} totalBytes={totalBytes} />;
    case "sync":
      return <SyncAnim progress={progress} />;
    case "decode":
      return <DecodeAnim progress={progress} />;
    case "skeleton":
      return <SkeletonAnim progress={progress} />;
    case "instruction":
      return <InstructionAnim progress={progress} instruction={instruction} />;
    case "released":
      return <ReleasedAnim progress={progress} />;
    default:
      return null;
  }
}

function IngestAnim({
  progress,
  totalBytes,
}: {
  progress: number;
  totalBytes: number;
}) {
  const lanes = ["head ZED2i", "wrist L", "wrist R"];
  const ingested = Math.floor(totalBytes * progress);
  const fmt = (b: number) =>
    b > 1_000_000
      ? `${(b / 1_000_000).toFixed(1)} MB`
      : b > 1000
        ? `${(b / 1000).toFixed(0)} KB`
        : `${b} B`;
  return (
    <div className="mt-2 space-y-1.5">
      {lanes.map((label, i) => {
        const laneProgress = Math.max(
          0,
          Math.min(1, progress * 1.15 - i * 0.04),
        );
        return (
          <div key={label} className="flex items-center gap-2">
            <span className="mono text-[9px] text-[color:var(--color-text-dim)] w-16 truncate">
              {label}
            </span>
            <div className="relative flex-1 h-1.5 rounded-full bg-[color:var(--color-bg)] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[color:var(--color-accent)]/80"
                initial={{ width: 0 }}
                animate={{ width: `${laneProgress * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        );
      })}
      <div className="mt-1 flex items-center justify-between text-[9px] text-[color:var(--color-text-dim)] mono tabular-nums">
        <span>{fmt(ingested)} / {fmt(totalBytes)}</span>
        <span>{Math.floor(progress * 100)}%</span>
      </div>
    </div>
  );
}

function SyncAnim({ progress }: { progress: number }) {
  // 1.0 = perfectly aligned, 0.0 = max jitter
  const settle = Math.min(1, progress * 1.2);
  const jitter = (1 - settle) * 28;
  const lanes = [
    { label: "head", offset: 0, color: "#f4a13b" },
    { label: "L wrist", offset: 1, color: "#60a5fa" },
    { label: "R wrist", offset: 2, color: "#a3e635" },
  ];
  const ticks = Array.from({ length: 12 });
  return (
    <div className="mt-2">
      <div className="space-y-1">
        {lanes.map((lane) => (
          <div key={lane.label} className="flex items-center gap-2">
            <span className="mono text-[9px] text-[color:var(--color-text-dim)] w-12">
              {lane.label}
            </span>
            <div className="relative flex-1 h-3 rounded bg-[color:var(--color-bg)] overflow-hidden">
              <motion.div
                className="absolute top-0 bottom-0 flex items-center"
                initial={false}
                animate={{
                  x:
                    (lane.offset - 1) * jitter * (lane.offset === 1 ? -1 : 1),
                }}
                transition={{ type: "spring", stiffness: 80, damping: 14 }}
                style={{ left: 0, right: 0 }}
              >
                <div className="flex w-full items-center gap-[3px] px-1">
                  {ticks.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-sm"
                      style={{
                        background: lane.color,
                        opacity: 0.4 + (i / ticks.length) * 0.4,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1.5 mono text-[9px] text-[color:var(--color-text-dim)] tabular-nums">
        Δt drift {(jitter / 28 * 33).toFixed(1)}ms → {(settle * 100).toFixed(0)}% aligned
      </div>
    </div>
  );
}

function DecodeAnim({ progress }: { progress: number }) {
  const W = 320;
  const H = 30;
  const N = 80;
  const cap = Math.max(1, Math.floor(progress * N));
  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i < cap; i++) {
      const x = (i / (N - 1)) * W;
      const t = i / (N - 1);
      // pleasant noisy sine — feels like a real trajectory
      const y =
        H / 2 -
        Math.sin(t * Math.PI * 2.4) * (H * 0.32) +
        Math.sin(t * Math.PI * 7) * (H * 0.07) +
        (Math.sin(t * 13.1) - 0.5) * 1.5;
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return d;
  }, [cap]);
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="mono text-[9px] text-[color:var(--color-text-dim)] w-16">
        end-effector
      </span>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="flex-1 h-7 rounded bg-[color:var(--color-bg)]"
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
          d={path}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>
      <span className="mono text-[9px] text-[color:var(--color-text-dim)] tabular-nums">
        {Math.floor(progress * 30)}Hz
      </span>
    </div>
  );
}

function SkeletonAnim({ progress }: { progress: number }) {
  // 20 finger joints + wrist arranged in a hand-like fan
  // five fingers, each with 4 joints, all radiating from a wrist origin
  const fingers: Array<Array<{ x: number; y: number }>> = [];
  const cx = 140;
  const cy = 38;
  const fingerAngles = [-0.95, -0.45, 0, 0.45, 0.95];
  const lengths = [22, 28, 30, 27, 22];
  const segLens = [0.32, 0.55, 0.78, 1.0];
  for (let f = 0; f < 5; f++) {
    const base = fingerAngles[f] - Math.PI / 2;
    const dir = { x: Math.cos(base), y: Math.sin(base) };
    const total = lengths[f];
    const joints: Array<{ x: number; y: number }> = [];
    for (let j = 0; j < 4; j++) {
      const len = total * segLens[j];
      // slight curl for realism
      const curlAngle = base + j * 0.08 * (f === 0 ? 0.3 : 1);
      const cos = Math.cos(curlAngle);
      const sin = Math.sin(curlAngle);
      joints.push({
        x: cx + cos * len + (dir.x - cos) * len * 0.2,
        y: cy + sin * len + (dir.y - sin) * len * 0.2,
      });
    }
    fingers.push(joints);
  }

  const total = 20;
  const visible = Math.floor(progress * total);

  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="mono text-[9px] text-[color:var(--color-text-dim)] w-16">
        20 joints
      </span>
      <svg
        viewBox="0 0 280 60"
        preserveAspectRatio="xMidYMid meet"
        className="flex-1 h-12"
      >
        {/* wrist */}
        <circle
          cx={cx}
          cy={cy + 10}
          r={3}
          fill="var(--color-accent)"
          fillOpacity={0.85}
        />
        {fingers.map((joints, fi) => {
          const path = `M${cx},${cy + 10} L${joints
            .slice(0, Math.max(0, visible - fi * 4 + 4))
            .map((j) => `${j.x.toFixed(1)},${j.y.toFixed(1)}`)
            .join(" L")}`;
          return (
            <g key={fi}>
              <path
                d={path}
                stroke="var(--color-accent)"
                strokeWidth={0.9}
                strokeOpacity={0.55}
                fill="none"
                strokeLinecap="round"
              />
              {joints.map((j, ji) => {
                const idx = fi * 4 + ji;
                const visibleJoint = idx < visible;
                return (
                  <motion.circle
                    key={ji}
                    cx={j.x}
                    cy={j.y}
                    r={1.7}
                    fill="var(--color-accent)"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{
                      opacity: visibleJoint ? 0.9 : 0,
                      scale: visibleJoint ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.25 }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <span className="mono text-[9px] text-[color:var(--color-text-dim)] tabular-nums">
        {visible}/20
      </span>
    </div>
  );
}

function InstructionAnim({
  progress,
  instruction,
}: {
  progress: number;
  instruction: string;
}) {
  const cap = Math.max(0, Math.min(instruction.length, Math.floor(progress * (instruction.length + 4))));
  const visible = instruction.slice(0, cap);
  const showCursor = progress < 0.98;
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="mono text-[9px] text-[color:var(--color-text-dim)] w-16">
        VLA instr.
      </span>
      <div className="flex-1 rounded bg-[color:var(--color-bg)] px-2.5 py-1.5 text-xs">
        <span className="mono text-[color:var(--color-accent)]">$ </span>
        <span className="font-medium">"{visible}</span>
        {showCursor && (
          <motion.span
            className="inline-block w-[2px] h-3 align-middle bg-[color:var(--color-accent)] ml-[1px]"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
        <span className="font-medium">{cap >= instruction.length ? '"' : ""}</span>
      </div>
    </div>
  );
}

function ReleasedAnim({ progress }: { progress: number }) {
  const offset = (1 - progress) * 26;
  const items = [
    { label: "video", icon: <Video className="h-3.5 w-3.5" />, dx: -offset },
    {
      label: "trajectory",
      icon: <LineChart className="h-3.5 w-3.5" />,
      dx: 0,
    },
    {
      label: "instruction",
      icon: <MessageSquare className="h-3.5 w-3.5" />,
      dx: offset,
    },
  ];
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className="mono text-[9px] text-[color:var(--color-text-dim)] w-16">
        triplet
      </span>
      <div className="relative flex-1 h-9 rounded bg-[color:var(--color-bg)] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          {items.map((it) => (
            <motion.div
              key={it.label}
              animate={{ x: it.dx }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="flex items-center gap-1 rounded border border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent-soft)] px-2 py-1 text-[10px] text-[color:var(--color-accent)] mono uppercase tracking-wider"
            >
              {it.icon}
              <span>{it.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReleaseCard({
  datasetId,
  instruction,
}: {
  datasetId: string;
  instruction: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.15 }}
      layoutId="released-triplet-card"
      className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4"
    >
      <div className="flex items-center gap-2 text-emerald-300">
        <PartyPopper className="h-4 w-4" />
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
          VLA Triplet released to marketplace
        </span>
      </div>
      <div className="mt-2 text-sm">
        "{instruction}" now visible to subscribed Robotics Labs. Your annotation
        bonus of{" "}
        <span className="text-[color:var(--color-accent)] font-medium">$4/hr</span>{" "}
        is now eligible to accrue against this episode.
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/lab/datasets/${datasetId}`}
          className="btn btn-primary text-xs"
        >
          View on marketplace
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/ops/review/1778330002413"
          className="btn btn-ghost text-xs"
        >
          Open in Ops Reviewer
        </Link>
      </div>
    </motion.div>
  );
}

function FlyToMarketplaceToast({
  datasetId,
  instruction,
}: {
  datasetId: string;
  instruction: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ delay: 0.7, type: "spring", stiffness: 220, damping: 22 }}
      className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-auto"
    >
      <Link
        href={`/lab/datasets/${datasetId}`}
        className="block rounded-lg border border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)] p-4 shadow-2xl backdrop-blur-md hover:border-[color:var(--color-accent)] transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-7 w-7 rounded-md bg-[color:var(--color-accent)]/20 border border-[color:var(--color-accent)]/40 flex items-center justify-center flex-none">
            <PartyPopper className="h-3.5 w-3.5 text-[color:var(--color-accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-accent)] font-medium">
              Released to marketplace
            </div>
            <div className="mt-1 text-sm font-medium truncate">
              "{instruction}"
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-[color:var(--color-accent)]">
              Now available in Robotics Lab
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
