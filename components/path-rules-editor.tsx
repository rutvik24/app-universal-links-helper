"use client";

import { Show } from "@/components/show";
import type {
  AndroidPathMode,
  AndroidPathRule,
} from "@/lib/generate-android-intent-filter";

const MODE_OPTIONS: { value: AndroidPathMode; label: string }[] = [
  { value: "path", label: "path (exact)" },
  { value: "pathPrefix", label: "pathPrefix" },
  { value: "pathPattern", label: "pathPattern" },
  { value: "pathAdvancedPattern", label: "pathAdvancedPattern" },
];

export type PathRulesEditorProps = {
  rules: AndroidPathRule[];
  onChange: (rules: AndroidPathRule[]) => void;
};

function placeholderForMode(mode: AndroidPathMode): string {
  if (mode === "path") return 'leave empty for root (android:path="")';
  if (mode === "pathPattern") return "/order/.*";
  if (mode === "pathAdvancedPattern") return "/products/[0-9]+";
  return "/view-ticket";
}

export function PathRulesEditor({ rules, onChange }: PathRulesEditorProps) {
  function updateRule(index: number, patch: Partial<AndroidPathRule>) {
    onChange(
      rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)),
    );
  }

  function removeRule(index: number) {
    onChange(rules.filter((_, i) => i !== index));
  }

  function addRule() {
    onChange([...rules, { mode: "pathPrefix", value: "/" }]);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)]/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-[var(--android-accent)]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
            Android Path Matching Rules
          </p>
          <span className="rounded-full bg-[var(--android-tint)] px-2 py-0.5 text-[10px] font-bold text-[var(--android-accent)] border border-[var(--android-border)]">
            {rules.length} {rules.length === 1 ? "rule" : "rules"}
          </span>
        </div>
        <button
          type="button"
          onClick={addRule}
          className="action-btn action-btn-android text-xs"
        >
          + Add Path Rule
        </button>
      </div>

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        Each rule emits a dedicated{" "}
        <code className="rounded bg-[var(--tint)] px-1 py-0.5 font-mono text-[0.8em] text-[var(--ink)]">&lt;data&gt;</code>{" "}
        tag in AndroidManifest.xml. An empty exact path emits <code className="font-mono text-[0.8em]">android:path=&quot;&quot;</code> (site root).
      </p>

      <Show
        condition={rules.length > 0}
        fallback={
          <div className="rounded-md border border-dashed border-[var(--line)] px-4 py-5 text-center text-xs text-[var(--muted)]">
            No custom path rules configured. Manifest will match all paths under configured hosts.
          </div>
        }
      >
        <ul className="flex flex-col gap-2.5">
          {rules.map((rule, index) => (
            <li
              key={`path-rule-${index}`}
              className="flex flex-wrap items-end gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 shadow-xs transition-colors hover:border-[var(--line-strong)]"
            >
              <div className="flex min-w-[9.5rem] flex-1 flex-col gap-1">
                <label
                  htmlFor={`path-mode-${index}`}
                  className="text-[11px] font-medium text-[var(--muted)]"
                >
                  Matching Mode
                </label>
                <select
                  id={`path-mode-${index}`}
                  value={rule.mode}
                  onChange={(e) =>
                    updateRule(index, {
                      mode: e.target.value as AndroidPathMode,
                    })
                  }
                  className="field-input text-xs font-mono"
                >
                  {MODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex min-w-[12rem] flex-[2] flex-col gap-1">
                <label
                  htmlFor={`path-value-${index}`}
                  className="text-[11px] font-medium text-[var(--muted)]"
                >
                  Path Pattern Value
                </label>
                <input
                  id={`path-value-${index}`}
                  type="text"
                  spellCheck={false}
                  value={rule.value}
                  onChange={(e) => updateRule(index, { value: e.target.value })}
                  placeholder={placeholderForMode(rule.mode)}
                  className="field-input font-mono text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="action-btn text-xs hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
                aria-label={`Remove path rule ${index + 1}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </Show>
    </div>
  );
}
