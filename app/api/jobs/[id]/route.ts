import { NextResponse } from "next/server";
import { jobStore } from "@/lib/job-store";
import { computeProgress, PIPELINE_STAGES } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = jobStore.get(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  const progress = computeProgress(job.jobId, job.startedAt, Date.now());
  return NextResponse.json({
    job,
    progress,
    stages: PIPELINE_STAGES,
  });
}
