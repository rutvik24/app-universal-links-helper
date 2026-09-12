import type { ReactNode } from "react";
import { Show } from "@/components/show";

export function Field({
  label,
  htmlFor,
  hint,
  badge,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)]">
          {label}
        </label>
        <Show condition={Boolean(badge)}>
          <span className="rounded-full bg-[var(--tint)] px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--muted)] border border-[var(--line)]">
            {badge}
          </span>
        </Show>
      </div>
      {children}
      <Show condition={Boolean(hint)}>
        <p className="text-xs text-[var(--muted)] leading-normal">{hint}</p>
      </Show>
    </div>
  );
}
