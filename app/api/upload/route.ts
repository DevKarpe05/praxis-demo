import { NextResponse } from "next/server";
import { jobStore } from "@/lib/job-store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { filename?: string; sizeBytes?: number } = {};
  try {
    body = await req.json();
  } catch {
    // accept empty body too
  }
  const jobId = jobStore.create({
    filename: body.filename ?? "episode_bundle.zip",
    sizeBytes: body.sizeBytes ?? 84_000_000,
  });
  return NextResponse.json({ jobId });
}
