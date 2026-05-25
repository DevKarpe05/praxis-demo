import Link from "next/link";
import { ChevronRight, CheckCircle2, Hourglass } from "lucide-react";
import type { EpisodeMeta } from "@/lib/types";

export interface UploadRow {
  episodeId: string;
  operatorId: string;
  task: string;
  scene: string;
  durationSec: number;
  status: "released" | "qa" | "processing";
  uploadedAt: string;
  hasReview: boolean;
}

export function RecentUploadsTable({ rows }: { rows: UploadRow[] }) {
  return (
    <div className="card">
      <div className="px-5 py-3 border-b border-[color:var(--color-border)] flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
            Recent uploads
          </div>
          <div className="mt-0.5 text-sm font-medium">
            {rows.length} episode{rows.length === 1 ? "" : "s"}
          </div>
        </div>
        <Link
          href="/factory/upload"
          className="btn btn-primary"
        >
          New upload
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[color:var(--color-text-dim)]">
              <th className="px-5 py-2 font-medium">Episode</th>
              <th className="px-2 py-2 font-medium">Operator</th>
              <th className="px-2 py-2 font-medium">Task</th>
              <th className="px-2 py-2 font-medium">Scene</th>
              <th className="px-2 py-2 font-medium">Duration</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-5 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.episodeId}
                className="border-t border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-2)]/50 transition-colors"
              >
                <td className="px-5 py-3 mono text-[11px] text-[color:var(--color-text)]">
                  {r.episodeId}
                </td>
                <td className="px-2 py-3 text-[color:var(--color-text-muted)]">
                  {r.operatorId}
                </td>
                <td className="px-2 py-3 truncate max-w-[180px]">{r.task}</td>
                <td className="px-2 py-3 text-[color:var(--color-text-muted)]">
                  {r.scene}
                </td>
                <td className="px-2 py-3 mono tabular-nums">
                  {Math.floor(r.durationSec / 60)}m
                  {String(Math.floor(r.durationSec % 60)).padStart(2, "0")}s
                </td>
                <td className="px-2 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-right">
                  {r.hasReview && (
                    <Link
                      href={`/ops/review/${r.episodeId}`}
                      className="inline-flex items-center gap-1 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
                    >
                      View
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: UploadRow["status"] }) {
  if (status === "released") {
    return (
      <span className="tag border-emerald-500/30 bg-emerald-500/10 text-emerald-300 uppercase">
        <CheckCircle2 className="h-3 w-3" /> released
      </span>
    );
  }
  if (status === "qa") {
    return (
      <span className="tag border-amber-500/30 bg-amber-500/10 text-amber-300 uppercase">
        <Hourglass className="h-3 w-3" /> qa
      </span>
    );
  }
  return (
    <span className="tag border-sky-500/30 bg-sky-500/10 text-sky-300 uppercase">
      <Hourglass className="h-3 w-3" /> processing
    </span>
  );
}

export function metaToRow(
  meta: EpisodeMeta,
  status: UploadRow["status"],
  operatorId: string,
  uploadedAt: string,
): UploadRow {
  return {
    episodeId: meta.episodeId,
    operatorId,
    task: meta.task,
    scene: meta.sceneCategory,
    durationSec: meta.fullEpisode.durationSec,
    status,
    uploadedAt,
    hasReview: status !== "processing",
  };
}
