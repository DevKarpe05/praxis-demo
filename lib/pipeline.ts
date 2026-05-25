export interface PipelineStage {
  id: string;
  label: string;
  description: string;
  /** Duration in seconds */
  durationSec: number;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "ingest",
    label: "Ingesting bundle",
    description: "Receiving head cam + 2 wrist cams + HDF5 sensor pack + camera intrinsics",
    durationSec: 4,
  },
  {
    id: "sync",
    label: "Syncing streams",
    description: "Aligning head/left/right video lanes against TimeStamps",
    durationSec: 3,
  },
  {
    id: "decode",
    label: "Decoding HDF5 → trajectories",
    description: "Extracting head-tracker, end-effector, and 40 finger joints",
    durationSec: 5,
  },
  {
    id: "skeleton",
    label: "Hand skeleton extraction",
    description: "20 joints / hand · CMC → Tip across 5 fingers",
    durationSec: 4,
  },
  {
    id: "instruction",
    label: "Instruction generation",
    description: "High-level VLA instruction + sub-task segmentation",
    durationSec: 4,
  },
  {
    id: "released",
    label: "Released as VLA triplet",
    description: "(video, trajectory, instruction) — now visible to subscribed Labs",
    durationSec: 2,
  },
];

export const PIPELINE_TOTAL_SEC = PIPELINE_STAGES.reduce(
  (acc, s) => acc + s.durationSec,
  0,
);

export const PIPELINE_TOTAL_MS = PIPELINE_TOTAL_SEC * 1000;

export type PipelineStatus = "running" | "complete";

export interface PipelineStageState {
  status: PipelineStatus;
  currentStage: string;
  stageIndex: number;
  /** 0..1 within the current stage */
  stageProgress: number;
  /** elapsed since job started, milliseconds */
  elapsed: number;
  /** total pipeline duration in milliseconds */
  totalDuration: number;
}

/**
 * Compute the current stage state purely from elapsed time. Stateless and
 * deterministic — safe for serverless cold-starts.
 *
 * Once `elapsed >= totalDuration`, returns the final stage at 100% with
 * `status: "complete"` forever (never wedges, never 404s).
 */
export function computeStageState(elapsedMs: number): PipelineStageState {
  const elapsed = Math.max(0, elapsedMs);
  const totalDuration = PIPELINE_TOTAL_MS;

  let accMs = 0;
  for (let i = 0; i < PIPELINE_STAGES.length; i++) {
    const s = PIPELINE_STAGES[i];
    const stageMs = s.durationSec * 1000;
    if (elapsed < accMs + stageMs) {
      return {
        status: "running",
        currentStage: s.id,
        stageIndex: i,
        stageProgress: (elapsed - accMs) / stageMs,
        elapsed,
        totalDuration,
      };
    }
    accMs += stageMs;
  }

  const last = PIPELINE_STAGES[PIPELINE_STAGES.length - 1];
  return {
    status: "complete",
    currentStage: last.id,
    stageIndex: PIPELINE_STAGES.length - 1,
    stageProgress: 1,
    elapsed,
    totalDuration,
  };
}
