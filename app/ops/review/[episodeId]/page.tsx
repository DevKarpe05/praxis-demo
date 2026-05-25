import { notFound } from "next/navigation";
import { EpisodeReviewer } from "@/components/ops/EpisodeReviewer";
import {
  loadEpisodeCamera,
  loadEpisodeMeta,
  loadEpisodeSubtasks,
  loadEpisodeTracks,
} from "@/lib/data";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ episodeId: string }>;
}) {
  const { episodeId } = await params;
  try {
    const [meta, tracks, subtasks, camera] = await Promise.all([
      loadEpisodeMeta(episodeId),
      loadEpisodeTracks(episodeId),
      loadEpisodeSubtasks(episodeId),
      loadEpisodeCamera(episodeId),
    ]);
    return (
      <EpisodeReviewer
        meta={meta}
        tracks={tracks}
        subtasks={subtasks}
        camera={camera}
      />
    );
  } catch (e) {
    notFound();
  }
}
