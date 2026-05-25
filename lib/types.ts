export interface EpisodeMeta {
  episodeId: string;
  task: string;
  sceneCategory: string;
  coordinateFrame: string;
  fps: number;
  slice: {
    startSec: number;
    durationSec: number;
    frameCount: number;
  };
  fullEpisode: {
    durationSec: number;
    frameCount: number;
    subtaskCount: number;
  };
  videos: {
    head: string;
    wristLeft: string;
    wristRight: string;
  };
  intrinsics: string;
  tracks: string;
  subtasks: string;
}

export interface PoseTrack {
  pos: number[][];
  quat: number[][];
}

export interface FingerTrack {
  names: string[];
  pos: number[][][];
  quat: number[][][];
}

export interface TracksData {
  t: number[];
  headTracker: PoseTrack;
  leftHand: PoseTrack;
  rightHand: PoseTrack;
  fingersL: FingerTrack;
  fingersR: FingerTrack;
}

export interface SubtaskSegment {
  start: number;
  end: number;
  label: string;
}

export interface CameraIntrinsics {
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  width: number;
  height: number;
}

export interface CameraData {
  zedParams: {
    cameraModel: string;
    cameraSerialNumber: string;
    cameraFirmware: string;
    versionZED: string;
  };
  cameraParams: {
    leftIntrinsics: CameraIntrinsics & { name: string };
    rightIntrinsics: CameraIntrinsics & { name: string };
    leftDistortion: Record<string, number | string>;
    rightDistortion: Record<string, number | string>;
    stereoExtrinsics: Record<string, number | string>;
  };
}

export interface DatasetCard {
  id: string;
  title: string;
  task: string;
  sceneCategory: string;
  scene: string;
  hours: number;
  episodes: number;
  sensors: string[];
  qualityScore: number;
  pricePerHour: number;
  format: "premium" | "standard";
  previewVideo: string;
  episodeId?: string;
  description: string;
}
