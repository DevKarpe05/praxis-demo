import { notFound } from "next/navigation";
import { DatasetDetail } from "@/components/lab/DatasetDetail";
import {
  loadDatasets,
  loadEpisodeCamera,
  loadEpisodeMeta,
  loadEpisodeSubtasks,
  loadEpisodeTracks,
  loadPricing,
} from "@/lib/data";

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [datasets, pricing] = await Promise.all([
    loadDatasets(),
    loadPricing(),
  ]);
  const dataset = datasets.find((d) => d.id === id);
  if (!dataset) notFound();

  let meta = null;
  let tracks = null;
  let subtasks = null;
  let camera = null;
  if (dataset.episodeId) {
    try {
      [meta, tracks, subtasks, camera] = await Promise.all([
        loadEpisodeMeta(dataset.episodeId),
        loadEpisodeTracks(dataset.episodeId),
        loadEpisodeSubtasks(dataset.episodeId),
        loadEpisodeCamera(dataset.episodeId).catch(() => null),
      ]);
    } catch {
      // optional — fallback to preview-only
    }
  }

  const factoryShareUsd =
    dataset.hours * pricing.factoryRates.annotationBonusPerHour;

  return (
    <DatasetDetail
      dataset={dataset}
      meta={meta}
      tracks={tracks}
      subtasks={subtasks}
      camera={camera}
      factoryShareUsd={factoryShareUsd}
    />
  );
}
