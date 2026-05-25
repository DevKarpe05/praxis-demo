"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
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

export interface PlayerRefs {
  masterRef: RefObject<HTMLVideoElement | null>;
  slaveRefs: RefObject<HTMLVideoElement | null>[];
}

const PlayerStateCtx = createContext<PlayerState | null>(null);
const PlayerControlsCtx = createContext<PlayerControls | null>(null);
const PlayerRefsCtx = createContext<PlayerRefs | null>(null);

/**
 * Top-level provider. Owns refs for one master video + N slave videos.
 * The master drives currentTime; slaves are coerced to match on rAF.
 */
export function PlayerProvider({
  slaveCount = 2,
  initialDuration,
  children,
}: {
  slaveCount?: number;
  initialDuration?: number;
  children: React.ReactNode;
}) {
  const masterRef = useRef<HTMLVideoElement | null>(null);
  const slaveARef = useRef<HTMLVideoElement | null>(null);
  const slaveBRef = useRef<HTMLVideoElement | null>(null);
  const slaveCRef = useRef<HTMLVideoElement | null>(null);
  const allSlaves = [slaveARef, slaveBRef, slaveCRef];
  const slaveRefs = allSlaves.slice(0, slaveCount);

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
  }, [slaveRefs]);

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
      const cur = masterRef.current;
      if (!cur) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (!cur.paused) {
        setState((prev) =>
          prev.currentTime === cur.currentTime
            ? prev
            : { ...prev, currentTime: cur.currentTime },
        );
        if (cur.currentTime - lastSyncTime > 0.1) {
          sync();
          lastSyncTime = cur.currentTime;
        }
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
  }, [sync]);

  const controls = useMemo<PlayerControls>(
    () => ({
      play: () => {
        masterRef.current?.play().catch(() => {});
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
    [slaveRefs],
  );

  const refs = useMemo<PlayerRefs>(
    () => ({ masterRef, slaveRefs }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <PlayerRefsCtx.Provider value={refs}>
      <PlayerStateCtx.Provider value={state}>
        <PlayerControlsCtx.Provider value={controls}>
          {children}
        </PlayerControlsCtx.Provider>
      </PlayerStateCtx.Provider>
    </PlayerRefsCtx.Provider>
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

export function usePlayerRefs(): PlayerRefs {
  const ctx = useContext(PlayerRefsCtx);
  if (!ctx) throw new Error("usePlayerRefs must be inside <PlayerProvider>");
  return ctx;
}
