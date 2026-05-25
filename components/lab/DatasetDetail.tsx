"use client";

import Link from "next/link";
import { ArrowLeft, Tag, Database } from "lucide-react";
import { MultiViewPlayer } from "@/components/player/MultiViewPlayer";
import { PlayerProvider } from "@/components/player/PlayerContext";
import { InstructionTrack } from "@/components/player/InstructionTrack";
import { SubTaskTimeline } from "@/components/player/SubTaskTimeline";
import { HandSkeleton } from "@/components/player/HandSkeletonOverlay";
import { TrajectoryPanel } from "@/components/player/TrajectoryPanel";
import { CheckoutPanel } from "./CheckoutPanel";
import type {
  DatasetCard,
  EpisodeMeta,
  SubtaskSegment,
  TracksData,
} from "@/lib/types";

export interface DatasetDetailProps {
  dataset: DatasetCard;
  meta?: EpisodeMeta | null;
  tracks?: TracksData | null;
  subtasks?: SubtaskSegment[] | null;
  factoryShareUsd: number;
}

export function DatasetDetail({
  dataset,
  meta,
  tracks,
  subtasks,
  factoryShareUsd,
}: DatasetDetailProps) {
  const hasEpisode = !!meta && !!tracks && !!subtasks;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <Link
        href="/lab"
        className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to marketplace
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="tag uppercase">{dataset.format}</span>
            <span className="tag uppercase">{dataset.sceneCategory}</span>
            <span className="mono text-[color:var(--color-text-dim)]">
              {dataset.id}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {dataset.title}
          </h1>
          <div className="mt-1 text-sm text-[color:var(--color-text-muted)] max-w-2xl">
            {dataset.description}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          {hasEpisode ? (
            <PlayerProvider initialDuration={meta.slice.durationSec}>
              <MultiViewPlayer videos={meta.videos} />
              <SubTaskTimeline
                subtasks={subtasks}
                duration={meta.slice.durationSec}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InstructionTrack task={meta.task} subtasks={subtasks} />
                <TripletCard meta={meta} />
              </div>
              <TrajectoryPanel tracks={tracks} duration={meta.slice.durationSec} />
              <HandSkeleton tracks={tracks} />
            </PlayerProvider>
          ) : (
            <PreviewOnly previewVideo={dataset.previewVideo} />
          )}
        </div>
        <div className="col-span-12 xl:col-span-4">
          <CheckoutPanel
            dataset={dataset}
            factoryShareUsd={factoryShareUsd}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewOnly({ previewVideo }: { previewVideo: string }) {
  return (
    <div className="space-y-3">
      <div className="card p-0 overflow-hidden">
        <video
          src={previewVideo}
          autoPlay
          muted
          playsInline
          loop
          controls
          className="w-full"
        />
      </div>
      <div className="card p-4 text-xs text-[color:var(--color-text-muted)]">
        Multi-view + trajectory preview unlocks at purchase. Sample preview shows
        head-cam capture only.
      </div>
    </div>
  );
}

function TripletCard({ meta }: { meta: EpisodeMeta }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
        <Database className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
          VLA Triplet sample
        </span>
      </div>
      <div className="mt-3 space-y-2 mono text-[11px]">
        <Row label="instruction" value={`"${meta.task}"`} icon={<Tag className="h-3 w-3" />} />
        <Row label="video" value="head 540p + L_wrist + R_wrist · 30Hz" />
        <Row
          label="trajectory"
          value="head + 2 hands + 40 finger joints · 30Hz"
        />
        <Row label="coord_frame" value={meta.coordinateFrame} />
        <Row label="episode_id" value={meta.episodeId} />
      </div>
    </div>
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
      <span className="text-[color:var(--color-text-dim)] w-24 flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className="flex-1 text-[color:var(--color-text)] break-all">
        {value}
      </span>
    </div>
  );
}
