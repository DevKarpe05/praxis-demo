import Link from "next/link";
import { ArrowRight, Boxes, Cpu, Hand, Database } from "lucide-react";
import { PERSONA_ORDER, PERSONAS } from "@/lib/personas";

export default function Landing() {
  return (
    <div className="bg-grid">
      <section className="mx-auto max-w-[1400px] px-6 pt-20 pb-16">
        <div className="grid grid-cols-12 gap-10 items-start">
          <div className="col-span-12 lg:col-span-7">
            <div className="tag tag-accent mb-6">Praxis Robotics — investor demo</div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.04]">
              Every workplace,
              <br />a robotics data vendor.
            </h1>
            <p className="mt-6 text-lg text-[color:var(--color-text-muted)] max-w-2xl leading-relaxed">
              Praxis manufactures multi-modal capture hardware, deploys it
              into factories and homes, and turns the resulting egocentric
              video, hand pose, and end-effector trajectories into VLA
              training data for frontier robotics labs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
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
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-[color:var(--color-text-muted)]">
              <Metric label="Workers" value="500+" />
              <Metric label="Hours daily capacity" value="1,000+" />
              <Metric label="Quality (1st contract)" value="86%" />
              <Metric label="Gross margin" value="65%" />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="card overflow-hidden">
              <div className="aspect-video bg-black relative">
                <video
                  src="/samples/episodes/1778330002413/head.mp4"
                  autoPlay
                  muted
                  playsInline
                  loop
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="tag border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] uppercase">
                    premium
                  </span>
                  <span className="tag uppercase">live capture</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-medium">
                    Episode 1778330002413 · home scene
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    "tidy shoe cabinet"
                  </div>
                  <div className="mt-1 text-xs text-white/70">
                    28 sub-tasks · 10.5 min · ZED2i + dual wrist + 40 finger joints
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[color:var(--color-border)] text-center">
                <SpecCell label="streams" value="3 video + HDF5" />
                <SpecCell label="frame rate" value="30 Hz" />
                <SpecCell label="VLA-ready" value="✓ triplet" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PillarCard
            icon={<Boxes className="h-5 w-5" />}
            tag="01 · Capture"
            title="Factory uploads"
            body="Anonymized operators wear ZED2i head cams + dual-wrist cams + finger-joint sensors. Multi-modal episodes upload directly from the floor."
            href="/factory"
            cta="Enter Factory"
          />
          <PillarCard
            icon={<Cpu className="h-5 w-5" />}
            tag="02 · Process"
            title="Praxis Ops"
            body="Streams sync, hand skeletons extract, sub-tasks segment, human QA validates. (video, trajectory, instruction) triplets released to subscribed labs."
            href="/ops"
            cta="Enter Ops"
          />
          <PillarCard
            icon={<Hand className="h-5 w-5" />}
            tag="03 · Sell"
            title="Robotics Lab"
            body="Frontier labs browse the marketplace, preview multi-view episodes with hand-pose overlays, license VLA triplets by the captured hour."
            href="/lab"
            cta="Enter Lab"
          />
        </div>

        <div className="mt-16 card p-6">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-[color:var(--color-accent)] mt-0.5" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
                Behind this demo
              </div>
              <div className="mt-2 text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                Every panel in this demo plays a real Praxis-format episode —{" "}
                <span className="text-[color:var(--color-text)] mono">
                  Data_1778330002413_RH_FLU.hdf5
                </span>{" "}
                — decoded directly from a ZED2i + dual-wrist + 40-finger-joint
                capture. The 6-stage pipeline animation, hand skeleton
                visualization, sub-task segmentation, and VLA triplet output
                are all derived from the actual sensor data, not mocked.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
        {label}
      </div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums text-[color:var(--color-text)]">
        {value}
      </div>
    </div>
  );
}

function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3">
      <div className="text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
        {label}
      </div>
      <div className="mt-0.5 text-xs mono tabular-nums text-[color:var(--color-text)]">
        {value}
      </div>
    </div>
  );
}

function PillarCard({
  icon,
  tag,
  title,
  body,
  href,
  cta,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Link href={href} className="card p-5 card-hover block group">
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
      <div className="mt-4 flex items-center text-xs text-[color:var(--color-accent)] opacity-70 group-hover:opacity-100 transition-opacity">
        {cta}
        <ArrowRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
