"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface PlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

export interface PlayerControls {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (t: number) => void;
  setPlaybackRate: (r: number) => void;
}

const PlayerStateCtx = createContext<PlayerState | null>(null);
const PlayerControlsCtx = createContext<PlayerControls | null>(null);

/**
 * Provider that synchronizes one master video with N slave videos.
 * The master drives currentTime; slaves are coerced to match on rAF.
 */
export function PlayerProvider({
  masterRef,
  slaveRefs,
  children,
  initialDuration,
}: {
  masterRef: React.RefObject<HTMLVideoElement | null>;
  slaveRefs: React.RefObject<HTMLVideoElement | null>[];
  children: React.ReactNode;
  initialDuration?: number;
}) {
  const [state, setState] = useState<PlayerState>({
    currentTime: 0,
    duration: initialDuration ?? 0,
    isPlaying: false,
  });
  const rafRef = useRef<number | null>(null);

  const sync = useCallback(() => {
    const m = masterRef.current;
    if (!m) return;
    for (const ref of slaveRefs) {
      const s = ref.current;
      if (!s) continue;
      if (Math.abs(s.currentTime - m.currentTime) > 0.08) {
        s.currentTime = m.currentTime;
      }
      if (m.paused && !s.paused) s.pause();
      if (!m.paused && s.paused) {
        s.play().catch(() => {});
      }
    }
  }, [masterRef, slaveRefs]);

  useEffect(() => {
    const m = masterRef.current;
    if (!m) return;

    const onLoaded = () => {
      setState((prev) => ({ ...prev, duration: m.duration || prev.duration }));
    };
    const onPlay = () => setState((prev) => ({ ...prev, isPlaying: true }));
    const onPause = () => setState((prev) => ({ ...prev, isPlaying: false }));
    const onEnded = () => setState((prev) => ({ ...prev, isPlaying: false }));
    const onSeek = () => {
      setState((prev) => ({ ...prev, currentTime: m.currentTime }));
      sync();
    };

    m.addEventListener("loadedmetadata", onLoaded);
    m.addEventListener("play", onPlay);
    m.addEventListener("pause", onPause);
    m.addEventListener("ended", onEnded);
    m.addEventListener("seeked", onSeek);

    if (m.readyState >= 1) onLoaded();

    let lastSyncTime = 0;
    const tick = () => {
      if (m.paused) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      setState((prev) =>
        prev.currentTime === m.currentTime
          ? prev
          : { ...prev, currentTime: m.currentTime },
      );
      if (m.currentTime - lastSyncTime > 0.1) {
        sync();
        lastSyncTime = m.currentTime;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      m.removeEventListener("loadedmetadata", onLoaded);
      m.removeEventListener("play", onPlay);
      m.removeEventListener("pause", onPause);
      m.removeEventListener("ended", onEnded);
      m.removeEventListener("seeked", onSeek);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [masterRef, sync]);

  const controls = useMemo<PlayerControls>(
    () => ({
      play: () => {
        const m = masterRef.current;
        if (!m) return;
        m.play().catch(() => {});
      },
      pause: () => {
        masterRef.current?.pause();
      },
      togglePlay: () => {
        const m = masterRef.current;
        if (!m) return;
        if (m.paused) m.play().catch(() => {});
        else m.pause();
      },
      seek: (t: number) => {
        const m = masterRef.current;
        if (!m) return;
        m.currentTime = Math.max(0, Math.min(m.duration || t, t));
      },
      setPlaybackRate: (r: number) => {
        const m = masterRef.current;
        if (!m) return;
        m.playbackRate = r;
        for (const s of slaveRefs) {
          if (s.current) s.current.playbackRate = r;
        }
      },
    }),
    [masterRef, slaveRefs],
  );

  return (
    <PlayerStateCtx.Provider value={state}>
      <PlayerControlsCtx.Provider value={controls}>
        {children}
      </PlayerControlsCtx.Provider>
    </PlayerStateCtx.Provider>
  );
}

export function usePlayerState(): PlayerState {
  const ctx = useContext(PlayerStateCtx);
  if (!ctx) throw new Error("usePlayerState must be inside <PlayerProvider>");
  return ctx;
}

export function usePlayerControls(): PlayerControls {
  const ctx = useContext(PlayerControlsCtx);
  if (!ctx) throw new Error("usePlayerControls must be inside <PlayerProvider>");
  return ctx;
}
