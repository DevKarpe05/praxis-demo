import fs from "node:fs/promises";
import path from "node:path";
import type {
  CameraData,
  EpisodeMeta,
  SubtaskSegment,
  TracksData,
} from "./types";

export const EPISODE_ID = "1778330002413";

const ROOT = process.cwd();

export async function loadEpisodeMeta(episodeId: string): Promise<EpisodeMeta> {
  const file = path.join(ROOT, "data", "episodes", episodeId, "meta.json");
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

export async function loadEpisodeTracks(episodeId: string): Promise<TracksData> {
  const file = path.join(ROOT, "data", "episodes", episodeId, "tracks.json");
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

export async function loadEpisodeSubtasks(
  episodeId: string,
): Promise<SubtaskSegment[]> {
  const file = path.join(ROOT, "data", "episodes", episodeId, "subtasks.json");
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

export async function loadEpisodeCamera(
  episodeId: string,
): Promise<CameraData> {
  const file = path.join(
    ROOT,
    "public",
    "samples",
    "episodes",
    episodeId,
    "camera.json",
  );
  return JSON.parse(await fs.readFile(file, "utf-8"));
}
