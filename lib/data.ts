import fs from "node:fs/promises";
import path from "node:path";
import type {
  CameraData,
  DatasetCard,
  EpisodeMeta,
  SubtaskSegment,
  TracksData,
} from "./types";

export const EPISODE_ID = "1778330002413";

const ROOT = process.cwd();

export interface Operator {
  id: string;
  label: string;
  status: "active" | "idle" | "offline";
  hoursThisMonth: number;
  totalEpisodes: number;
  averageQuality: number;
  currentDevice: string;
}

export interface Device {
  id: string;
  type: string;
  spec: string;
  online: number;
  total: number;
  battery: number;
}

export interface Pricing {
  factoryRates: {
    rawPerHour: number;
    annotationBonusPerHour: number;
    totalPerHour: number;
    currency: string;
    explainer: string;
  };
  marketplaceRates: {
    premiumPerHour: number;
    standardPerHour: number;
    currency: string;
    explainer: string;
  };
}

export async function loadDatasets(): Promise<DatasetCard[]> {
  return JSON.parse(
    await fs.readFile(path.join(ROOT, "data", "datasets.json"), "utf-8"),
  );
}

export async function loadOperators(): Promise<Operator[]> {
  return JSON.parse(
    await fs.readFile(path.join(ROOT, "data", "operators.json"), "utf-8"),
  );
}

export async function loadDevices(): Promise<Device[]> {
  return JSON.parse(
    await fs.readFile(path.join(ROOT, "data", "devices.json"), "utf-8"),
  );
}

export async function loadPricing(): Promise<Pricing> {
  return JSON.parse(
    await fs.readFile(path.join(ROOT, "data", "pricing.json"), "utf-8"),
  );
}

export async function loadEpisodeMeta(episodeId: string): Promise<EpisodeMeta> {
  const file = path.join(ROOT, "data", "episodes", episodeId, "meta.json");
  return JSON.parse(await fs.readFile(file, "utf-8"));
}

export async function listEpisodeIds(): Promise<string[]> {
  const dir = path.join(ROOT, "data", "episodes");
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

export async function loadAllEpisodeMetas(): Promise<EpisodeMeta[]> {
  const ids = await listEpisodeIds();
  const metas = await Promise.all(
    ids.map((id) => loadEpisodeMeta(id).catch(() => null)),
  );
  return metas.filter((m): m is EpisodeMeta => m !== null);
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
