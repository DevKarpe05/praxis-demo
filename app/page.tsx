import Link from "next/link";
import { ArrowRight, Boxes, Cpu, Hand } from "lucide-react";
import { PERSONA_ORDER, PERSONAS } from "@/lib/personas";

export default function Landing() {
  return (
    <div className="bg-grid">
      <section className="mx-auto max-w-[1400px] px-6 pt-20 pb-24">
        <div className="max-w-3xl">
          <div className="tag tag-accent mb-6">Praxis Robotics — investor demo</div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Every workplace,
            <br />a robotics data vendor.
          </h1>
          <p className="mt-6 text-lg text-[color:var(--color-text-muted)] max-w-2xl">
            Praxis manufactures multi-modal capture hardware, deploys it into
            factories and homes, and turns the resulting egocentric video, hand
            pose, and end-effector trajectories into VLA training data for
            frontier robotics labs.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {PERSONA_ORDER.map((id) => {
              const p = PERSONAS[id];
              return (
                <Link
                  key={id}
                  href={p.homePath}
                  className="group flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-sm transition-colors hover:border-[color:var(--color-border-strong)]"
                >
                  <span className="text-[color:var(--color-text)] font-medium">
                    Enter as {p.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[color:var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PillarCard
            icon={<Boxes className="h-5 w-5" />}
            tag="01 · Capture"
            title="Factory uploads"
            body="Anonymized operators wear ZED2i head cams + dual-wrist cams + IMU & haptic sensors. Multi-modal episodes upload directly from the floor."
          />
          <PillarCard
            icon={<Cpu className="h-5 w-5" />}
            tag="02 · Process"
            title="Praxis Ops"
            body="Streams sync, hand skeletons extract, ASR transcribes, sub-tasks segment. Human QA validates before release. 86% quality first-contract."
          />
          <PillarCard
            icon={<Hand className="h-5 w-5" />}
            tag="03 · Sell"
            title="Robotics Lab"
            body="Frontier labs browse the marketplace, preview multi-view episodes with hand-pose overlays, license VLA triplets by the hour."
          />
        </div>
      </section>
    </div>
  );
}

function PillarCard({
  icon,
  tag,
  title,
  body,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div className="card p-5 card-hover">
      <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
        {icon}
        <span className="text-[11px] tracking-[0.18em] uppercase font-medium">
          {tag}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--color-text-muted)] leading-relaxed">
        {body}
      </p>
    </div>
  );
}
