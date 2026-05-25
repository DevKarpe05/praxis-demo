"use client";

import type { CameraData } from "@/lib/types";
import { Camera } from "lucide-react";

export function IntrinsicsPanel({ camera }: { camera: CameraData }) {
  const L = camera.cameraParams.leftIntrinsics;
  const R = camera.cameraParams.rightIntrinsics;
  const baseline = camera.cameraParams.stereoExtrinsics;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[color:var(--color-text-muted)]">
        <Camera className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-[0.18em] font-medium">
          ZED2i intrinsics
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 text-[11px] mono">
        <IntrCol label="Left" data={L} />
        <IntrCol label="Right" data={R} />
      </div>
      <div className="mt-3 border-t border-[color:var(--color-border)] pt-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] mb-1">
          Stereo baseline
        </div>
        <div className="grid grid-cols-3 gap-1 text-[11px] mono">
          <KV k="tx" v={fmt(baseline.tx)} />
          <KV k="ty" v={fmt(baseline.ty)} />
          <KV k="tz" v={fmt(baseline.tz)} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-[color:var(--color-text-dim)]">
        <span className="mono">{camera.zedParams.cameraModel}</span>
        <span className="mono">SN {camera.zedParams.cameraSerialNumber}</span>
      </div>
    </div>
  );
}

function IntrCol({
  label,
  data,
}: {
  label: string;
  data: { fx: number; fy: number; cx: number; cy: number; width: number; height: number };
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] mb-1">
        {label}
      </div>
      <div className="space-y-0.5">
        <KV k="fx" v={data.fx.toFixed(2)} />
        <KV k="fy" v={data.fy.toFixed(2)} />
        <KV k="cx" v={data.cx.toFixed(2)} />
        <KV k="cy" v={data.cy.toFixed(2)} />
        <KV k="res" v={`${data.width}×${data.height}`} />
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[color:var(--color-text-dim)] w-7">{k}</span>
      <span className="tabular-nums text-[color:var(--color-text)]">{v}</span>
    </div>
  );
}

function fmt(v: number | string): string {
  const n = typeof v === "number" ? v : parseFloat(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(4);
}
