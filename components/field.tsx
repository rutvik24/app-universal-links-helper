import type { ReactNode } from "react";
import { Show } from "@/components/show";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      {children}
      <Show condition={Boolean(hint)}>
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      </Show>
    </div>
  );
}
