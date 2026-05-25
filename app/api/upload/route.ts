import { NextResponse } from "next/server";
import {
  PIPELINE_STAGES,
  PIPELINE_TOTAL_SEC,
} from "@/lib/pipeline";

export const dynamic = "force-dynamic";

const DEFAULT_EPISODE_ID = "1778330002413";
const DEFAULT_DATASET_ID = "ds_home_tidy_shoe_cabinet";

/**
 * Creates a stateless "job" whose entire lifecycle is encoded in the jobId
 * itself: `<startedAtMillis>-<randomSuffix>`. No server-side store is needed,
 * so consecutive route invocations on different Vercel serverless instances
 * will return consistent state.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const episodeIdParam = url.searchParams.get("episodeId");
  const datasetIdParam = url.searchParams.get("datasetId");

  let body: { episodeId?: string; datasetId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // body is optional
  }

  const episodeId = episodeIdParam ?? body.episodeId ?? DEFAULT_EPISODE_ID;
  const datasetId = datasetIdParam ?? body.datasetId ?? DEFAULT_DATASET_ID;

  const startedAtMillis = Date.now();
  const suffix = Math.random().toString(36).slice(2, 8);
  const jobId = `${startedAtMillis}-${suffix}`;

  return NextResponse.json({
    jobId,
    startedAtMillis,
    totalDurationSec: PIPELINE_TOTAL_SEC,
    episodeId,
    datasetId,
    stages: PIPELINE_STAGES,
  });
}
