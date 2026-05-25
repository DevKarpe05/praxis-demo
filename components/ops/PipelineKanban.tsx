import Link from "next/link";
import { Sparkles } from "lucide-react";

export interface KanbanCard {
  episodeId: string;
  task: string;
  operatorId: string;
  durationSec: number;
  factoryId: string;
}

export interface KanbanColumn {
  id: string;
  label: string;
  description: string;
  cards: KanbanCard[];
  accent?: boolean;
}

export function PipelineKanban({ columns }: { columns: KanbanColumn[] }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <div className="flex gap-3 min-w-max">
        {columns.map((col) => (
          <div
            key={col.id}
            className="w-[260px] flex-none rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
          >
            <div className="px-3 py-2 border-b border-[color:var(--color-border)] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
                  {col.label}
                </div>
                <div className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">
                  {col.description}
                </div>
              </div>
              <span className="mono text-[10px] text-[color:var(--color-text-dim)] tabular-nums">
                {col.cards.length}
              </span>
            </div>
            <div className="p-2 space-y-2 max-h-[420px] overflow-y-auto">
              {col.cards.map((c) => (
                <Link
                  key={c.episodeId + col.id}
                  href={`/ops/review/${c.episodeId}`}
                  className={[
                    "block rounded-md border bg-[color:var(--color-surface-2)] p-2.5 text-xs transition-colors",
                    col.accent
                      ? "border-[color:var(--color-accent)]/40 hover:border-[color:var(--color-accent)]"
                      : "border-[color:var(--color-border)] hover:border-[color:var(--color-border-strong)]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2 text-[color:var(--color-text)]">
                    {col.accent && (
                      <Sparkles className="h-3 w-3 text-[color:var(--color-accent)]" />
                    )}
                    <span className="truncate font-medium">{c.task}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[color:var(--color-text-muted)]">
                    <span className="mono">{c.episodeId.slice(-6)}</span>
                    <span className="mono tabular-nums">
                      {Math.floor(c.durationSec / 60)}m
                      {String(Math.floor(c.durationSec % 60)).padStart(2, "0")}s
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[color:var(--color-text-dim)] mono">
                    <span>{c.factoryId}</span>
                    <span>·</span>
                    <span>{c.operatorId}</span>
                  </div>
                </Link>
              ))}
              {col.cards.length === 0 && (
                <div className="rounded-md border border-dashed border-[color:var(--color-border)] py-6 text-center text-[10px] text-[color:var(--color-text-dim)]">
                  empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
