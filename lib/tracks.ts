import type { FingerTrack, PoseTrack, TracksData } from "./types";

export interface InterpolatedPose {
  pos: [number, number, number];
  quat: [number, number, number, number];
}

export interface InterpolatedFingers {
  names: string[];
  pos: Array<[number, number, number]>;
}

export function findIndexForTime(times: number[], t: number): {
  i0: number;
  i1: number;
  frac: number;
} {
  if (t <= times[0]) return { i0: 0, i1: 0, frac: 0 };
  if (t >= times[times.length - 1]) {
    const n = times.length - 1;
    return { i0: n, i1: n, frac: 0 };
  }
  let lo = 0;
  let hi = times.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid;
    else hi = mid;
  }
  const span = times[hi] - times[lo] || 1;
  return { i0: lo, i1: hi, frac: (t - times[lo]) / span };
}

function lerp(a: number, b: number, f: number) {
  return a + (b - a) * f;
}

export function interpPose(
  track: PoseTrack,
  i0: number,
  i1: number,
  f: number,
): InterpolatedPose {
  const p0 = track.pos[i0];
  const p1 = track.pos[i1];
  const q0 = track.quat[i0];
  const q1 = track.quat[i1];
  return {
    pos: [lerp(p0[0], p1[0], f), lerp(p0[1], p1[1], f), lerp(p0[2], p1[2], f)],
    quat: [
      lerp(q0[0], q1[0], f),
      lerp(q0[1], q1[1], f),
      lerp(q0[2], q1[2], f),
      lerp(q0[3], q1[3], f),
    ],
  };
}

export function interpFingers(
  track: FingerTrack,
  i0: number,
  i1: number,
  f: number,
): InterpolatedFingers {
  const p0 = track.pos[i0];
  const p1 = track.pos[i1];
  const pos: Array<[number, number, number]> = p0.map((joint, idx) => [
    lerp(joint[0], p1[idx][0], f),
    lerp(joint[1], p1[idx][1], f),
    lerp(joint[2], p1[idx][2], f),
  ]);
  return { names: track.names, pos };
}

export interface InterpolatedFrame {
  t: number;
  head: InterpolatedPose;
  leftHand: InterpolatedPose;
  rightHand: InterpolatedPose;
  fingersL: InterpolatedFingers;
  fingersR: InterpolatedFingers;
}

export function sampleAt(tracks: TracksData, t: number): InterpolatedFrame {
  const { i0, i1, frac } = findIndexForTime(tracks.t, t);
  return {
    t,
    head: interpPose(tracks.headTracker, i0, i1, frac),
    leftHand: interpPose(tracks.leftHand, i0, i1, frac),
    rightHand: interpPose(tracks.rightHand, i0, i1, frac),
    fingersL: interpFingers(tracks.fingersL, i0, i1, frac),
    fingersR: interpFingers(tracks.fingersR, i0, i1, frac),
  };
}

/**
 * Compute axis-aligned bounding box of a 3D point cloud over all frames.
 * Used to fit visualizations to the data's actual range.
 */
export function aabb(points: number[][][] | number[][]): {
  min: [number, number, number];
  max: [number, number, number];
} {
  let xmin = Infinity, ymin = Infinity, zmin = Infinity;
  let xmax = -Infinity, ymax = -Infinity, zmax = -Infinity;
  const visit = (p: number[]) => {
    if (p[0] < xmin) xmin = p[0];
    if (p[1] < ymin) ymin = p[1];
    if (p[2] < zmin) zmin = p[2];
    if (p[0] > xmax) xmax = p[0];
    if (p[1] > ymax) ymax = p[1];
    if (p[2] > zmax) zmax = p[2];
  };
  for (const item of points) {
    if (typeof item[0] === "number") visit(item as number[]);
    else for (const sub of item as number[][]) visit(sub);
  }
  return { min: [xmin, ymin, zmin], max: [xmax, ymax, zmax] };
}
