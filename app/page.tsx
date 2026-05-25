import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PERSONA_ORDER, PERSONAS } from "@/lib/personas";
import { FadeIn } from "@/components/ui/FadeIn";

export default function Landing() {
  return (
    <div className="bg-grid">
      <section className="mx-auto max-w-[1400px] px-6 pt-20 pb-16">
        <div className="grid grid-cols-12 gap-10 items-start">
          <FadeIn className="col-span-12 lg:col-span-7" delay={0.05}>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              Every business,
              <br />a data partner.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[color:var(--color-text)] max-w-2xl">
              Praxis enables businesses to monetize their operational data.
            </p>
            <p className="mt-3 text-base md:text-lg text-[color:var(--color-text-muted)] max-w-2xl">
              We deploy capture, sensing, and data infrastructure across
              real-world environments, transforming everyday workflows into
              structured training data for frontier AI systems.
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
          </FadeIn>

          <FadeIn className="col-span-12 lg:col-span-5" delay={0.18}>
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
          </FadeIn>
        </div>
      </section>
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
