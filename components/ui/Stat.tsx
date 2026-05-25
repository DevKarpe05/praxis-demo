export function Stat({
  label,
  value,
  hint,
  accent,
  large,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] font-medium">
        {label}
      </div>
      <div
        className={[
          large ? "text-4xl" : "text-2xl",
          "mt-2 font-semibold tracking-tight tabular-nums",
          accent ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-text)]",
        ].join(" ")}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">
          {hint}
        </div>
      )}
    </div>
  );
}
