"use client";

import { useEffect, useRef } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { PlayerProvider, usePlayerControls, usePlayerState } from "./PlayerContext";

export interface MultiViewPlayerProps {
  videos: { head: string; wristLeft: string; wristRight: string };
  duration?: number;
  /**
   * Overlay slots rendered absolutely over each view. Use `usePlayerState` inside
   * children to subscribe to currentTime.
   */
  headOverlay?: React.ReactNode;
  wristLeftOverlay?: React.ReactNode;
  wristRightOverlay?: React.ReactNode;
  /**
   * Optional content rendered next to/below the player inside the same provider.
   */
  children?: React.ReactNode;
}

export function MultiViewPlayer({
  videos,
  duration,
  headOverlay,
  wristLeftOverlay,
  wristRightOverlay,
  children,
}: MultiViewPlayerProps) {
  const headRef = useRef<HTMLVideoElement>(null);
  const wristLRef = useRef<HTMLVideoElement>(null);
  const wristRRef = useRef<HTMLVideoElement>(null);

  return (
    <PlayerProvider
      masterRef={headRef}
      slaveRefs={[wristLRef, wristRRef]}
      initialDuration={duration}
    >
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-9 relative overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-black aspect-video">
          <video
            ref={headRef}
            src={videos.head}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="auto"
          />
          <ViewLabel label="HEAD · ZED2i" subLabel="1280×720 · 30fps" />
          {headOverlay && (
            <div className="pointer-events-none absolute inset-0">
              {headOverlay}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-black aspect-video">
            <video
              ref={wristLRef}
              src={videos.wristLeft}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              preload="auto"
            />
            <ViewLabel label="WRIST · L" subLabel="720p · 30fps" />
            {wristLeftOverlay && (
              <div className="pointer-events-none absolute inset-0">
                {wristLeftOverlay}
              </div>
            )}
          </div>
          <div className="relative overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-black aspect-video">
            <video
              ref={wristRRef}
              src={videos.wristRight}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              preload="auto"
            />
            <ViewLabel label="WRIST · R" subLabel="720p · 30fps" />
            {wristRightOverlay && (
              <div className="pointer-events-none absolute inset-0">
                {wristRightOverlay}
              </div>
            )}
          </div>
        </div>
      </div>

      <Transport />

      {children}
    </PlayerProvider>
  );
}

function ViewLabel({ label, subLabel }: { label: string; subLabel: string }) {
  return (
    <div className="absolute top-2 left-2 flex flex-col gap-0.5 rounded-md bg-black/55 px-2 py-1 backdrop-blur-sm">
      <span className="text-[10px] font-medium tracking-[0.16em] text-white">
        {label}
      </span>
      <span className="text-[9px] mono text-white/70">{subLabel}</span>
    </div>
  );
}

function Transport() {
  const { currentTime, duration, isPlaying } = usePlayerState();
  const controls = usePlayerControls();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        controls.togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [controls]);

  const formatTime = (t: number) => {
    const s = Math.floor(t);
    const cs = Math.floor((t - s) * 100);
    return `${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2">
      <button
        onClick={controls.togglePlay}
        className="flex h-9 w-9 items-center justify-center rounded-md bg-[color:var(--color-accent)] text-[#14110a] transition-colors hover:bg-[#f6b35a]"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>
      <button
        onClick={() => controls.seek(0)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] transition-colors hover:text-[color:var(--color-text)]"
        aria-label="Restart"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <div className="mono text-xs text-[color:var(--color-text-muted)] tabular-nums">
        {formatTime(currentTime)} / {formatTime(duration || 0)}
      </div>
      <div className="relative h-2 flex-1 cursor-pointer rounded-full bg-[color:var(--color-surface-2)]"
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          controls.seek(x * duration);
        }}
      >
        <div
          className="h-full rounded-full bg-[color:var(--color-accent)]"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
