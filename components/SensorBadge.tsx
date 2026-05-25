import {
  Camera,
  CircleDot,
  Hand,
  Layers,
  Move3d,
  Watch,
  type LucideIcon,
} from "lucide-react";

export interface SensorMeta {
  /** Display label */
  label: string;
  /** Capture frequency, e.g. "30Hz" or "200Hz" */
  freq: string;
  /** Lucide icon component */
  Icon: LucideIcon;
}

export const SENSOR_REGISTRY: Record<string, SensorMeta> = {
  zed2i: { label: "ZED2i", freq: "30Hz", Icon: Camera },
  wrist_l: { label: "WristCam-L", freq: "30Hz", Icon: Watch },
  wrist_r: { label: "WristCam-R", freq: "30Hz", Icon: Watch },
  finger_joints: { label: "FingerJoints", freq: "30Hz", Icon: Hand },
  end_effector: { label: "EndEffector", freq: "200Hz", Icon: Move3d },
  depth_svo2: { label: "Depth-SVO2", freq: "30Hz", Icon: Layers },
  chest_cam: { label: "Chest-Cam", freq: "30Hz", Icon: CircleDot },
};

export const SENSOR_KEYS = Object.keys(SENSOR_REGISTRY);

export function getSensorMeta(key: string): SensorMeta {
  const direct = SENSOR_REGISTRY[key];
  if (direct) return direct;
  return {
    label: key,
    freq: "—",
    Icon: CircleDot,
  };
}

export interface SensorBadgeProps {
  sensor: string;
  size?: "sm" | "md";
  showFreq?: boolean;
  active?: boolean;
}

/**
 * Stateless visual chip describing a captured sensor stream.
 *
 * Used in DatasetCard, DatasetDetail, FleetCard, RecentUploadsTable to
 * standardize how sensors are rendered across the app.
 */
export function SensorBadge({
  sensor,
  size = "sm",
  showFreq = true,
  active = false,
}: SensorBadgeProps) {
  const meta = getSensorMeta(sensor);
  const Icon = meta.Icon;
  const sizes =
    size === "md"
      ? "px-2 py-1 text-[11px] gap-1.5"
      : "px-1.5 py-0.5 text-[10px] gap-1";
  return (
    <span
      className={[
        "inline-flex items-center rounded border mono",
        sizes,
        active
          ? "border-[color:var(--color-accent)]/40 bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
          : "border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]",
      ].join(" ")}
    >
      <Icon className={size === "md" ? "h-3 w-3" : "h-2.5 w-2.5"} />
      <span className="text-[color:var(--color-text)]">{meta.label}</span>
      {showFreq && (
        <span className="text-[color:var(--color-text-dim)]">·</span>
      )}
      {showFreq && (
        <span className="tabular-nums">{meta.freq}</span>
      )}
    </span>
  );
}
