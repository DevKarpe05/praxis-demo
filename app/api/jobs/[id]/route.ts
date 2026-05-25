import { NextResponse } from "next/server";
import {
  computeStageState,
  PIPELINE_STAGES,
  PIPELINE_TOTAL_MS,
} from "@/lib/pipeline";

export const dynamic = "force-dynamic";

/**
 * Stateless job poll. The jobId encodes `startedAtMillis`, so we can derive
 * the stage purely from elapsed time without any cross-invocation storage.
 *
 * Never returns 404 — a malformed id falls back to "complete" so the demo
 * never wedges on a cold serverless instance.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const startedAtMillis = Number(id.split("-")[0]);
  const malformed = !Number.isFinite(startedAtMillis) || startedAtMillis <= 0;

  const elapsed = malformed
    ? PIPELINE_TOTAL_MS
    : Date.now() - startedAtMillis;

  const state = computeStageState(elapsed);

  return NextResponse.json({
    jobId: id,
    ...state,
    stages: PIPELINE_STAGES,
  });
}
