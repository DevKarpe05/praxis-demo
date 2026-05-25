/**
 * Simple in-memory job tracking. Survives a single Next.js server lifetime
 * which is plenty for a stage demo.
 */
export interface Job {
  jobId: string;
  startedAt: number;
  filename: string;
  sizeBytes: number;
}

type GlobalRecord = { praxisJobs?: Map<string, Job> };

const g = globalThis as unknown as GlobalRecord;
if (!g.praxisJobs) g.praxisJobs = new Map<string, Job>();

export const jobStore = {
  create(input: { filename: string; sizeBytes: number }): string {
    const jobId = `job_${Math.random().toString(36).slice(2, 10)}`;
    g.praxisJobs!.set(jobId, {
      jobId,
      startedAt: Date.now(),
      filename: input.filename,
      sizeBytes: input.sizeBytes,
    });
    return jobId;
  },
  get(jobId: string): Job | undefined {
    return g.praxisJobs!.get(jobId);
  },
};
