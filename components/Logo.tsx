export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="28" height="28" rx="7" fill="#f4a13b" />
        <path
          d="M9 23V9h6.5a4 4 0 0 1 0 8H12"
          stroke="#14110a"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="22" r="2.4" fill="#14110a" />
      </svg>
      <div className="leading-none">
        <div className="text-sm font-semibold tracking-tight">PRAXIS</div>
        <div className="text-[10px] text-[color:var(--color-text-dim)] tracking-[0.18em] uppercase mt-0.5">
          robotics
        </div>
      </div>
    </div>
  );
}
