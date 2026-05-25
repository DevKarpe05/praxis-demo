import { FleetCard } from "@/components/factory/FleetCard";
import { OperatorsList } from "@/components/factory/OperatorsList";
import {
  RecentUploadsTable,
  metaToRow,
} from "@/components/factory/RecentUploadsTable";
import { EarningsCard } from "@/components/factory/EarningsCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  loadDevices,
  loadOperators,
  loadPricing,
  loadEpisodeMeta,
  EPISODE_ID,
} from "@/lib/data";

export default async function FactoryDashboard() {
  const [devices, operators, pricing, meta] = await Promise.all([
    loadDevices(),
    loadOperators(),
    loadPricing(),
    loadEpisodeMeta(EPISODE_ID),
  ]);

  const totalHoursThisMonth = operators.reduce(
    (a, o) => a + o.hoursThisMonth,
    0,
  );

  const rows = [metaToRow(meta, "qa", "operator_001", "2 hours ago")];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 space-y-8">
      <SectionHeader
        eyebrow="Factory · factory_024"
        title="Capture floor"
        subtitle="Live status of capture hardware, operator activity, and recent uploads."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-5">
          <FleetCard devices={devices} />
          <RecentUploadsTable rows={rows} />
        </div>
        <div className="lg:col-span-5 space-y-5">
          <EarningsCard
            pricing={pricing}
            hoursThisMonth={totalHoursThisMonth}
          />
          <OperatorsList operators={operators} />
        </div>
      </div>
    </div>
  );
}
