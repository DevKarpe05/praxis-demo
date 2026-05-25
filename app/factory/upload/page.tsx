import { SectionHeader } from "@/components/ui/SectionHeader";
import { PipelineSimulator } from "@/components/factory/PipelineSimulator";

export default function FactoryUploadPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-8 space-y-6">
      <SectionHeader
        eyebrow="Factory · upload"
        title="New episode bundle"
        subtitle="Drop a captured bundle and Praxis Ops will sync streams, decode HDF5, extract hand skeletons, and segment sub-tasks before release."
      />
      <PipelineSimulator />
    </div>
  );
}
