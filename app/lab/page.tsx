import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { MarketplaceGrid } from "@/components/lab/MarketplaceGrid";
import { loadDatasets } from "@/lib/data";

export default async function LabMarketplace() {
  const datasets = await loadDatasets();
  const totalHours = datasets.reduce((a, d) => a + d.hours, 0);
  const totalEpisodes = datasets.reduce((a, d) => a + d.episodes, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-6">
      <SectionHeader
        eyebrow="Robotics Lab · marketplace"
        title="Datasets"
        subtitle="Egocentric capture · hand pose · end-effector trajectories · VLA-ready triplets."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Datasets available" value={String(datasets.length)} />
        <Stat label="Hours of capture" value={`${totalHours.toFixed(1)}`} />
        <Stat label="Episodes" value={String(totalEpisodes)} />
        <Stat label="Premium tier" value={String(datasets.filter((d) => d.format === "premium").length)} accent />
      </div>

      <MarketplaceGrid datasets={datasets} />
    </div>
  );
}
