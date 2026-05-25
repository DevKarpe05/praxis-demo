"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Tag, Database, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MultiViewPlayer } from "@/components/player/MultiViewPlayer";
import { PlayerProvider } from "@/components/player/PlayerContext";
import { InstructionTrack } from "@/components/player/InstructionTrack";
import { SubTaskTimeline } from "@/components/player/SubTaskTimeline";
import { TrajectoryPanel } from "@/components/player/TrajectoryPanel";
import {
  HandSkeleton,
  HandSkeletonWristOverlay,
} from "@/components/player/HandSkeletonOverlay";
import { IntrinsicsPanel } from "@/components/player/IntrinsicsPanel";
import type {
  CameraData,
  EpisodeMeta,
  SubtaskSegment,
  TracksData,
} from "@/lib/types";

export interface EpisodeReviewerProps {
  meta: EpisodeMeta;
  tracks: TracksData;
  subtasks: SubtaskSegment[];
  camera: CameraData;
}

export function EpisodeReviewer({
  meta,
  tracks,
  subtasks,
  camera,
}: EpisodeReviewerProps) {
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );

  return (
    <PlayerProvider initialDuration={meta.slice.durationSec}>
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <Header meta={meta} />

        <div className="mt-5 grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-8 space-y-4">
            <MultiViewPlayer
              videos={meta.videos}
              wristLeftOverlay={
                <HandSkeletonWristOverlay tracks={tracks} hand="left" />
              }
              wristRightOverlay={
                <HandSkeletonWristOverlay tracks={tracks} hand="right" />
              }
            />
            <SubTaskTimeline
              subtasks={subtasks}
              duration={meta.slice.durationSec}
            />
            <TrajectoryPanel tracks={tracks} duration={meta.slice.durationSec} />
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <InstructionTrack task={meta.task} subtasks={subtasks} />
            <HandSkeleton tracks={tracks} />
            <IntrinsicsPanel camera={camera} />
            <DecisionPanel decision={decision} onDecide={setDecision} />
            <AnimatePresence>
              {decision === "approved" && (
                <TripletReveal episodeId={meta.episodeId} task={meta.task} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PlayerProvider>
  );
}

function Header({ meta }: { meta: EpisodeMeta }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Link
          href="/ops"
          className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to pipeline
        </Link>
        <div className="mt-2 flex items-center gap-2 text-[color:var(--color-text-muted)] text-xs">
          <span className="tag">QA Reviewer</span>
          <span className="mono">episode {meta.episodeId}</span>
          <span className="opacity-60">·</span>
          <span className="mono">{meta.coordinateFrame}</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{meta.task}</h1>
        <div className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Scene · {meta.sceneCategory} &nbsp;·&nbsp;
          slice {meta.slice.startSec.toFixed(0)}–
          {(meta.slice.startSec + meta.slice.durationSec).toFixed(0)}s
          ({meta.slice.frameCount} frames @ {meta.fps}fps)
          &nbsp;·&nbsp;
          full episode {meta.fullEpisode.durationSec.toFixed(0)}s
          / {meta.fullEpisode.subtaskCount} subtasks
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="tag tag-accent">86% QA</span>
        <span className="tag">multi-modal · VLA-ready</span>
      </div>
    </div>
  );
}

function DecisionPanel({
  decision,
  onDecide,
}: {
  decision: "pending" | "approved" | "rejected";
  onDecide: (d: "pending" | "approved" | "rejected") => void;
}) {
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
        QA Decision
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onDecide("approved")}
          className={[
            "flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
            decision === "approved"
              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
              : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
          ].join(" ")}
        >
          <Check className="h-3.5 w-3.5" />
          Approve & release
        </button>
        <button
          onClick={() => onDecide("rejected")}
          className={[
            "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
            decision === "rejected"
              ? "border-rose-500/50 bg-rose-500/15 text-rose-300"
              : "border-[color:var(--color-border)] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]",
          ].join(" ")}
        >
          <X className="h-3.5 w-3.5" />
          Reject
        </button>
      </div>
    </div>
  );
}

function TripletReveal({ episodeId, task }: { episodeId: string; task: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="card p-4 border-[color:var(--color-accent)]/40"
    >
      <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
        <Database className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
          VLA Triplet released
        </span>
      </div>
      <div className="mt-3 space-y-2 mono text-[11px]">
        <Row label="instruction" value={`"${task}"`} icon={<Tag className="h-3 w-3" />} />
        <Row label="video" value="head + L_wrist + R_wrist · H.264" />
        <Row
          label="trajectory"
          value="head + 2 hands + 40 finger joints · 30Hz"
        />
        <Row label="episode_id" value={episodeId} />
      </div>
      <div className="mt-3 text-[10px] text-[color:var(--color-text-muted)]">
        Now visible to subscribed Robotics Labs.
      </div>
    </motion.div>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[color:var(--color-text-dim)] w-20 flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className="flex-1 text-[color:var(--color-text)] break-all">
        {value}
      </span>
    </div>
  );
}
