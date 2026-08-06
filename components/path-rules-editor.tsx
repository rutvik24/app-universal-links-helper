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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--ink)]">
          Android path rules
        </p>
        <button type="button" onClick={addRule} className="action-btn">
          Add rule
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Each rule becomes its own{" "}
        <code className="font-mono text-[0.85em]">&lt;data&gt;</code> tag
        (separate from scheme/host). For exact{" "}
        <code className="font-mono text-[0.85em]">path</code>, an empty value
        emits <code className="font-mono text-[0.85em]">android:path=&quot;&quot;</code>{" "}
        (site root). Use{" "}
        <code className="font-mono text-[0.85em]">pathPattern</code> for
        patterns like{" "}
        <code className="font-mono text-[0.85em]">/order/.*</code>. AASA-style
        query globs are not modeled on Android{" "}
        <code className="font-mono text-[0.85em]">&lt;data&gt;</code> tags —
        configure those in iOS components instead. Use{" "}
        <strong className="font-medium text-[var(--ink)]">Load sample data</strong>{" "}
        above to fill every path mode at once.
      </p>

      <Show
        condition={rules.length > 0}
        fallback={
          <p className="rounded-md border border-dashed border-[var(--line)] px-3 py-4 text-center text-sm text-[var(--muted)]">
            No path rules — Manifest will match host + scheme only. Add a rule
            or paste a test URL.
          </p>
        }
      >
        <ul className="flex flex-col gap-2">
          {rules.map((rule, index) => (
            <li
              key={`path-rule-${index}`}
              className="flex flex-wrap items-end gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)]/60 p-2"
            >
              <div className="flex min-w-[10rem] flex-1 flex-col gap-1">
                <label
                  htmlFor={`path-mode-${index}`}
                  className="text-xs font-medium text-[var(--muted)]"
                >
                  Mode
                </label>
                <select
                  id={`path-mode-${index}`}
                  value={rule.mode}
                  onChange={(e) =>
                    updateRule(index, {
                      mode: e.target.value as AndroidPathMode,
                    })
                  }
                  className="field-input"
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
                  className="text-xs font-medium text-[var(--muted)]"
                >
                  Value
                </label>
                <input
                  id={`path-value-${index}`}
                  type="text"
                  spellCheck={false}
                  value={rule.value}
                  onChange={(e) => updateRule(index, { value: e.target.value })}
                  placeholder={placeholderForMode(rule.mode)}
                  className="field-input font-mono text-[0.85rem]"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="action-btn mb-0.5"
                aria-label={`Remove path rule ${index + 1}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </Show>
    </div>
  );
}
