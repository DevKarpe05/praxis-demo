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

export interface PipelineProgress {
  jobId: string;
  elapsedSec: number;
  currentStageIndex: number;
  currentStageProgress: number;
  done: boolean;
  released: boolean;
}

export function computeProgress(
  jobId: string,
  startedAt: number,
  now: number,
): PipelineProgress {
  const elapsed = Math.max(0, (now - startedAt) / 1000);
  let acc = 0;
  for (let i = 0; i < PIPELINE_STAGES.length; i++) {
    const s = PIPELINE_STAGES[i];
    if (elapsed < acc + s.durationSec) {
      return {
        jobId,
        elapsedSec: elapsed,
        currentStageIndex: i,
        currentStageProgress: (elapsed - acc) / s.durationSec,
        done: false,
        released: false,
      };
    }
    acc += s.durationSec;
  }
  return {
    jobId,
    elapsedSec: elapsed,
    currentStageIndex: PIPELINE_STAGES.length - 1,
    currentStageProgress: 1,
    done: true,
    released: true,
  };
}
