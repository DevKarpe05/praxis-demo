"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { usePlayerState } from "./PlayerContext";
import type { SubtaskSegment } from "@/lib/types";

export interface InstructionTrackProps {
  task: string;
  subtasks: SubtaskSegment[];
}

export function InstructionTrack({ task, subtasks }: InstructionTrackProps) {
  const { currentTime } = usePlayerState();

  const activeIdx = useMemo(() => {
    for (let i = 0; i < subtasks.length; i++) {
      if (currentTime >= subtasks[i].start && currentTime < subtasks[i].end) {
        return i;
      }
    }
    if (subtasks.length > 0 && currentTime >= subtasks[subtasks.length - 1].end) {
      return subtasks.length - 1;
    }
    return -1;
  }, [currentTime, subtasks]);

  const active = activeIdx >= 0 ? subtasks[activeIdx] : null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
          VLA Instruction
        </span>
      </div>
      <div className="mt-2 text-lg font-medium tracking-tight">{task}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-dim)]">
          Sub-task {activeIdx >= 0 ? `${activeIdx + 1}/${subtasks.length}` : "—"}
        </span>
      </div>
      <div className="mt-1 text-sm text-[color:var(--color-text-muted)] leading-relaxed min-h-[2.5rem]">
        {active ? active.label : "—"}
      </div>
    </div>
  );
}
