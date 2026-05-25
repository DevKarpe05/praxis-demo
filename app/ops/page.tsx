import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { PipelineKanban, type KanbanColumn } from "@/components/ops/PipelineKanban";
import { ThroughputChart } from "@/components/ops/ThroughputChart";
import { EPISODE_ID, loadEpisodeMeta } from "@/lib/data";

const SIBLING_TASKS = [
  { task: "organize drawer", operatorId: "operator_002", durationSec: 740 },
  { task: "pour from kettle", operatorId: "operator_003", durationSec: 412 },
  { task: "stack folded laundry", operatorId: "operator_002", durationSec: 612 },
  { task: "load dishwasher tray", operatorId: "operator_003", durationSec: 935 },
  { task: "wipe stove top", operatorId: "operator_001", durationSec: 388 },
  { task: "open shoe cabinet drawer", operatorId: "operator_004", durationSec: 254 },
];

export default async function OpsDashboard() {
  const meta = await loadEpisodeMeta(EPISODE_ID);

  const columns: KanbanColumn[] = [
    {
      id: "ingested",
      label: "Ingested",
      description: "uploaded · raw",
      cards: [
        sibling("ingested_1", 0),
        sibling("ingested_2", 1),
      ],
    },
    {
      id: "synced",
      label: "Synced",
      description: "streams aligned",
      cards: [sibling("synced_1", 2)],
    },
    {
      id: "pose",
      label: "Pose extracted",
      description: "skeletons + trajectories",
      cards: [sibling("pose_1", 3)],
    },
    {
      id: "qa",
      label: "QA review",
      description: "human in the loop",
      accent: true,
      cards: [
        {
          episodeId: meta.episodeId,
          task: meta.task,
          operatorId: "operator_001",
          factoryId: "factory_024",
          durationSec: meta.fullEpisode.durationSec,
        },
        sibling("qa_1", 4),
      ],
    },
    {
      id: "released",
      label: "Released",
      description: "in marketplace",
      cards: [sibling("rel_1", 5)],
    },
  ];

  const queueCount = columns
    .filter((c) => c.id !== "released")
    .reduce((a, c) => a + c.cards.length, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
      <SectionHeader
        eyebrow="Praxis Ops · internal console"
        title="Pipeline & QA"
        subtitle="Episodes flow from raw upload to released VLA triplet. Click any QA card to open the multi-modal reviewer."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="QA Quality (1st-contract)" value="86%" hint="rolling 30 days" accent />
        <Stat label="In pipeline" value={String(queueCount)} hint="awaiting QA or processing" />
        <Stat label="Released today" value="14" hint="VLA triplets" />
        <Stat label="Operators online" value="3 / 4" hint="across factory_024" />
      </div>

      <ThroughputChart />

      <SectionHeader eyebrow="kanban" title="Episodes in flight" subtitle={`Click the highlighted QA card "${meta.task}" to open the multi-modal reviewer.`} />
      <PipelineKanban columns={columns} />
    </div>
  );
}

function sibling(id: string, idx: number) {
  const s = SIBLING_TASKS[idx % SIBLING_TASKS.length];
  return {
    episodeId: `sim_${id}_${100000 + idx}`,
    task: s.task,
    operatorId: s.operatorId,
    factoryId: "factory_024",
    durationSec: s.durationSec,
  };
}
