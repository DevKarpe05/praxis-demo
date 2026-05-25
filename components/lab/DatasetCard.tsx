"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Star, ArrowRight } from "lucide-react";
import type { DatasetCard as DatasetCardType } from "@/lib/types";

export function DatasetCard({ dataset }: { dataset: DatasetCardType }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/lab/datasets/${dataset.id}`}
      onMouseEnter={() => {
        setHover(true);
        const v = videoRef.current;
        if (v) {
          v.currentTime = 2;
          v.play().catch(() => {});
        }
      }}
      onMouseLeave={() => {
        setHover(false);
        const v = videoRef.current;
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      }}
      className="card card-hover overflow-hidden group block"
    >
      <div className="relative aspect-video bg-black overflow-hidden">
        <video
          ref={videoRef}
          src={dataset.previewVideo}
          muted
          playsInline
          loop
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-opacity"
          style={{ opacity: hover ? 1 : 0.7 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span
            className={[
              "tag uppercase",
              dataset.format === "premium"
                ? "border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                : "",
            ].join(" ")}
          >
            {dataset.format}
          </span>
          <span className="tag uppercase">{dataset.sceneCategory}</span>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/50 backdrop-blur-sm px-2 py-1 text-[10px]">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="mono tabular-nums">{dataset.qualityScore.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-[color:var(--color-text-muted)]">
          {dataset.scene}
        </div>
        <h3 className="mt-1 text-base font-semibold tracking-tight">
          {dataset.title}
        </h3>
        <div className="mt-3 flex flex-wrap gap-1">
          {dataset.sensors.slice(0, 4).map((s) => (
            <span
              key={s}
              className="tag text-[10px] mono"
            >
              {s}
            </span>
          ))}
          {dataset.sensors.length > 4 && (
            <span className="tag text-[10px]">+{dataset.sensors.length - 4}</span>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span className="text-xl font-semibold tabular-nums text-[color:var(--color-text)]">
              ${dataset.pricePerHour}
            </span>
            <span className="text-[10px] text-[color:var(--color-text-muted)] ml-1">/hr</span>
          </div>
          <div className="text-[10px] text-[color:var(--color-text-muted)]">
            {dataset.hours.toFixed(2)}h · {dataset.episodes} episode{dataset.episodes === 1 ? "" : "s"}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end text-xs text-[color:var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
          View dataset <ArrowRight className="ml-1 h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
