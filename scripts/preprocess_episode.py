#!/usr/bin/env python3
"""
preprocess_episode.py — decode a Praxis-format HDF5 episode into browser-ready JSON.

Reads:    ~/Documents/Samples/Data_<id>_RH_FLU.hdf5
          ~/Documents/Samples/Camera_<id>.json
Writes:   data/episodes/<id>/meta.json
          data/episodes/<id>/tracks.json
          data/episodes/<id>/subtasks.json
          public/samples/episodes/<id>/camera.json
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

import h5py
import numpy as np


SAMPLES_DIR = Path.home() / "Documents" / "Samples"
PROJECT_ROOT = Path(__file__).resolve().parent.parent

FINGER_NAMES = [
    "Thumb_CMC", "Thumb_MCP", "Thumb_IP", "Thumb_Tip",
    "Index_MCP", "Index_PIP", "Index_DIP", "Index_Tip",
    "Middle_MCP", "Middle_PIP", "Middle_DIP", "Middle_Tip",
    "Ring_MCP", "Ring_PIP", "Ring_DIP", "Ring_Tip",
    "Little_MCP", "Little_PIP", "Little_DIP", "Little_Tip",
]


def decode_str_array(arr) -> list[str]:
    return [s.decode("utf-8") if isinstance(s, (bytes, bytearray)) else str(s) for s in arr]


def round_arr(a: np.ndarray, decimals: int = 4) -> list:
    return np.round(a.astype(np.float64), decimals).tolist()


def compute_runs(labels: list[str], t: np.ndarray) -> list[dict]:
    segments = []
    i = 0
    while i < len(labels):
        j = i
        while j < len(labels) and labels[j] == labels[i]:
            j += 1
        lbl = labels[i]
        if lbl and lbl != "nan":
            segments.append({
                "start": float(t[i]),
                "end": float(t[j - 1]),
                "label": lbl,
            })
        i = j
    return segments


def collect_finger_joints(group, hand_prefix: str, idx_mask: np.ndarray) -> dict:
    """Return positions and quaternions for all 20 joints of one hand within the window."""
    pos_all = np.zeros((idx_mask.sum(), 20, 3), dtype=np.float32)
    quat_all = np.zeros((idx_mask.sum(), 20, 4), dtype=np.float32)
    for finger in range(5):
        for joint in range(4):
            joint_idx = finger * 4 + joint
            key = f"{hand_prefix}_{finger}_{joint}"
            g = group[key]
            pos_all[:, joint_idx, :] = g["pos"][idx_mask]
            if "quaternion" in g:
                quat_all[:, joint_idx, :] = g["quaternion"][idx_mask]
    return {
        "names": FINGER_NAMES,
        "pos": round_arr(pos_all, 4),
        "quat": round_arr(quat_all, 4),
    }


def process_episode(episode_id: str, slice_start: float, slice_dur: float) -> None:
    h5_path = SAMPLES_DIR / f"Data_{episode_id}_RH_FLU.hdf5"
    cam_path = SAMPLES_DIR / f"Camera_{episode_id}.json"
    if not h5_path.exists():
        print(f"[error] HDF5 not found: {h5_path}", file=sys.stderr)
        sys.exit(1)

    data_out_dir = PROJECT_ROOT / "data" / "episodes" / episode_id
    public_out_dir = PROJECT_ROOT / "public" / "samples" / "episodes" / episode_id
    data_out_dir.mkdir(parents=True, exist_ok=True)
    public_out_dir.mkdir(parents=True, exist_ok=True)

    if cam_path.exists():
        shutil.copy(cam_path, public_out_dir / "camera.json")

    with h5py.File(h5_path, "r") as f:
        ts_ms = f["TimeStamps"][:]
        t = (ts_ms - ts_ms[0]) / 1000.0
        hl = decode_str_array(f["High_Level_Instruction"][:])
        sub = decode_str_array(f["Sub_Task_Instruction"][:])
        scene = decode_str_array(f["Scene_Category"][:])

        slice_end = slice_start + slice_dur
        mask = (t >= slice_start) & (t < slice_end)
        if mask.sum() == 0:
            print(f"[error] slice window [{slice_start}, {slice_end}] empty", file=sys.stderr)
            sys.exit(1)

        t_win = t[mask] - slice_start
        sub_win = [sub[i] for i, m in enumerate(mask) if m]
        subtasks = compute_runs(sub_win, t_win)

        non_nan_hl = next((v for v in hl if v and v != "nan"), "")
        non_nan_scene = next((v for v in scene if v and v != "nan"), "")

        state = f["state"]
        head_pos = state["HeadTracker"]["pos"][mask]
        head_quat = state["HeadTracker"]["quaternion"][mask]
        lh_pos = state["LeftHand"]["pos"][mask]
        lh_quat = state["LeftHand"]["quaternion"][mask]
        rh_pos = state["RightHand"]["pos"][mask]
        rh_quat = state["RightHand"]["quaternion"][mask]
        fingers_l = collect_finger_joints(state, "FJ_L", mask)
        fingers_r = collect_finger_joints(state, "FJ_R", mask)

        full_subtasks = compute_runs(sub, t)
        full_duration = float(t[-1])

    tracks = {
        "t": round_arr(t_win, 3),
        "headTracker": {"pos": round_arr(head_pos, 4), "quat": round_arr(head_quat, 4)},
        "leftHand": {"pos": round_arr(lh_pos, 4), "quat": round_arr(lh_quat, 4)},
        "rightHand": {"pos": round_arr(rh_pos, 4), "quat": round_arr(rh_quat, 4)},
        "fingersL": fingers_l,
        "fingersR": fingers_r,
    }

    meta = {
        "episodeId": episode_id,
        "task": non_nan_hl,
        "sceneCategory": non_nan_scene,
        "coordinateFrame": "RH_FLU",
        "fps": 30,
        "slice": {
            "startSec": slice_start,
            "durationSec": slice_dur,
            "frameCount": int(mask.sum()),
        },
        "fullEpisode": {
            "durationSec": full_duration,
            "frameCount": int(len(t)),
            "subtaskCount": len(full_subtasks),
        },
        "videos": {
            "head": f"/samples/episodes/{episode_id}/head.mp4",
            "wristLeft": f"/samples/episodes/{episode_id}/wrist_left.mp4",
            "wristRight": f"/samples/episodes/{episode_id}/wrist_right.mp4",
        },
        "intrinsics": f"/samples/episodes/{episode_id}/camera.json",
        "tracks": f"/data/episodes/{episode_id}/tracks.json",
        "subtasks": f"/data/episodes/{episode_id}/subtasks.json",
    }

    (data_out_dir / "meta.json").write_text(json.dumps(meta, indent=2))
    (data_out_dir / "tracks.json").write_text(json.dumps(tracks))
    (data_out_dir / "subtasks.json").write_text(json.dumps(subtasks, indent=2))

    print(f"[ok] episode {episode_id}")
    print(f"     task: {non_nan_hl!r}")
    print(f"     scene: {non_nan_scene!r}")
    print(f"     full duration: {full_duration:.2f}s ({len(t)} frames, {len(full_subtasks)} subtasks)")
    print(f"     slice: {slice_start:.2f}-{slice_start+slice_dur:.2f}s ({mask.sum()} frames, {len(subtasks)} subtasks)")
    for s in subtasks:
        print(f"       - {s['start']:5.2f}..{s['end']:5.2f}  {s['label'][:90]}")
    print(f"     wrote {data_out_dir}/{{meta,tracks,subtasks}}.json")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--episode", default="1778330002413")
    p.add_argument("--start", type=float, default=0.0, help="slice start (seconds)")
    p.add_argument("--duration", type=float, default=30.0, help="slice duration (seconds)")
    args = p.parse_args()
    process_episode(args.episode, args.start, args.duration)


if __name__ == "__main__":
    main()
