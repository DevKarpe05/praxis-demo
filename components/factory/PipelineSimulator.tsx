"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Check,
  Loader2,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import {
  PIPELINE_STAGES,
  type PipelineProgress,
  type PipelineStage,
} from "@/lib/pipeline";

interface JobResponse {
  job: { jobId: string; startedAt: number; filename: string; sizeBytes: number };
  progress: PipelineProgress;
  stages: PipelineStage[];
}

export function PipelineSimulator() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const startUpload = useCallback(async () => {
    setError(null);
    setJob(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          filename: "episode_1778330002413_bundle.zip",
          sizeBytes: 92_847_201,
        }),
      });
      const data = await res.json();
      setJobId(data.jobId);
    } catch (e) {
      setError("Failed to start upload");
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data: JobResponse = await res.json();
        if (cancelled) return;
        setJob(data);
        if (!data.progress.done) {
          pollRef.current = window.setTimeout(tick, 220);
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    };
    tick();
    return () => {
      cancelled = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [jobId]);

  const stages = job?.stages ?? PIPELINE_STAGES;
  const progress = job?.progress;

  return (
    <div className="space-y-5">
      <Dropzone onSubmit={startUpload} active={!!jobId} job={job} />

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
              {progress?.released ? (
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
                  current={progress?.currentStageIndex ?? -1}
                  stageProgress={progress?.currentStageProgress ?? 0}
                  done={progress?.done ?? false}
                />
              ))}
            </div>

            <AnimatePresence>
              {progress?.released && <ReleaseCard />}
            </AnimatePresence>
          </motion.div>
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
  job,
}: {
  onSubmit: () => void;
  active: boolean;
  job: JobResponse | null;
}) {
  const filename = job?.job.filename ?? "episode_1778330002413_bundle.zip";
  const sizeMB = (job?.job.sizeBytes ?? 92_847_201) / 1024 / 1024;

  return (
    <div className="card p-6 border-dashed">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-[color:var(--color-accent-soft)] border border-[color:var(--color-accent)]/30 flex items-center justify-center text-[color:var(--color-accent)]">
          <Upload className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{filename}</div>
          <div className="text-xs text-[color:var(--color-text-muted)] mono">
            {sizeMB.toFixed(1)} MB · ZED2i head + L/R wrist + HDF5 + camera.json
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={active && !job?.progress.released}
          className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {active ? "Processing…" : "Start upload"}
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
}: {
  stage: PipelineStage;
  index: number;
  current: number;
  stageProgress: number;
  done: boolean;
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
        <div className="h-7 w-7 rounded-md flex items-center justify-center border"
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
    </div>
  );
}

function ReleaseCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4"
    >
      <div className="flex items-center gap-2 text-emerald-300">
        <PartyPopper className="h-4 w-4" />
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
          VLA Triplet released to marketplace
        </span>
      </div>
      <div className="mt-2 text-sm">
        Now visible to subscribed Robotics Labs. Your annotation bonus of{" "}
        <span className="text-[color:var(--color-accent)] font-medium">$4/hr</span>{" "}
        is now eligible to accrue against this episode.
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/lab/datasets/ds_home_tidy_shoe_cabinet"
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
