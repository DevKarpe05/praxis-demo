import Link from "next/link";
import { Logo } from "./Logo";
import { PersonaSwitcher } from "./PersonaSwitcher";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg)]/70">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
        </Link>
        <PersonaSwitcher />
        <div className="flex items-center gap-3 text-xs text-[color:var(--color-text-muted)]">
          <span className="hidden md:inline mono">v0.1 · demo</span>
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline">live</span>
        </div>
      </div>
    </header>
  );
}
