"use client";

import { Show } from "@/components/show";
import type { AasaComponentInput } from "@/lib/generate-aasa";

export type AasaComponentsEditorProps = {
  components: AasaComponentInput[];
  onChange: (components: AasaComponentInput[]) => void;
};

type QueryPair = { key: string; value: string };

function queryToPairs(query: Record<string, string> | undefined): QueryPair[] {
  if (!query) return [];
  return Object.entries(query).map(([key, value]) => ({ key, value }));
}

function pairsToQuery(pairs: QueryPair[]): Record<string, string> | undefined {
  const entries = pairs
    .map((p) => [p.key.trim(), p.value] as const)
    .filter(([k]) => Boolean(k));
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function AasaComponentsEditor({
  components,
  onChange,
}: AasaComponentsEditorProps) {
  function updateComponent(
    index: number,
    patch: Partial<AasaComponentInput>,
  ) {
    onChange(
      components.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  }

  function removeComponent(index: number) {
    onChange(components.filter((_, i) => i !== index));
  }

  function addComponent() {
    onChange([...components, { "/": "*" }]);
  }

  function setQueryPairs(index: number, pairs: QueryPair[]) {
    const query = pairsToQuery(pairs);
    const next = { ...components[index] };
    if (query) {
      next["?"] = query;
    } else {
      delete next["?"];
    }
    onChange(components.map((c, i) => (i === index ? next : c)));
  }

  function addQueryPair(index: number) {
    const pairs = queryToPairs(components[index]["?"]);
    setQueryPairs(index, [...pairs, { key: "", value: "*" }]);
  }

  function updateQueryPair(
    componentIndex: number,
    pairIndex: number,
    patch: Partial<QueryPair>,
  ) {
    const pairs = queryToPairs(components[componentIndex]["?"]).map(
      (pair, i) => (i === pairIndex ? { ...pair, ...patch } : pair),
    );
    setQueryPairs(componentIndex, pairs);
  }

  function removeQueryPair(componentIndex: number, pairIndex: number) {
    const pairs = queryToPairs(components[componentIndex]["?"]).filter(
      (_, i) => i !== pairIndex,
    );
    setQueryPairs(componentIndex, pairs);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)]/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-[var(--ios-accent)]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
            AASA Component Rules Matrix (iOS 13+)
          </p>
          <span className="rounded-full bg-[var(--ios-tint)] px-2 py-0.5 text-[10px] font-bold text-[var(--ios-accent)] border border-[var(--ios-border)]">
            {components.length} {components.length === 1 ? "component" : "components"}
          </span>
        </div>
        <button type="button" onClick={addComponent} className="action-btn action-btn-ios text-xs">
          + Add Component
        </button>
      </div>

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        Modern Apple AASA component matcher format with per-rule path (
        <code className="font-mono text-[0.8em]">/</code>), query params (
        <code className="font-mono text-[0.8em]">?</code>), fragment (
        <code className="font-mono text-[0.8em]">#</code>), exclusion rules, and comments.
      </p>

      <Show
        condition={components.length > 0}
        fallback={
          <div className="rounded-md border border-dashed border-[var(--line)] px-4 py-5 text-center text-xs text-[var(--muted)]">
            No components — click Add Component or paste a test URL above to generate a rule.
          </div>
        }
      >
        <ul className="flex flex-col gap-3">
          {components.map((component, index) => {
            const queryPairs = queryToPairs(component["?"]);
            const isExcluded = Boolean(component.exclude);
            return (
              <li
                key={`aasa-component-${index}`}
                className={`flex flex-col gap-3 rounded-lg border p-3.5 shadow-xs transition-all ${
                  isExcluded
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold tracking-wide uppercase text-[var(--muted)]">
                      Component #{index + 1}
                    </span>
                    <Show condition={isExcluded}>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        EXCLUDED RULE
                      </span>
                    </Show>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeComponent(index)}
                    className="action-btn text-xs hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
                    aria-label={`Remove component ${index + 1}`}
                  >
                    Delete Component
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`aasa-path-${index}`}
                      className="text-[11px] font-medium text-[var(--muted)]"
                    >
                      Path Pattern <code className="font-mono text-[0.8em]">/</code>
                    </label>
                    <input
                      id={`aasa-path-${index}`}
                      type="text"
                      spellCheck={false}
                      value={component["/"] ?? ""}
                      onChange={(e) =>
                        updateComponent(index, { "/": e.target.value })
                      }
                      placeholder="* or /products/*"
                      className="field-input font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`aasa-fragment-${index}`}
                      className="text-[11px] font-medium text-[var(--muted)]"
                    >
                      URL Fragment <code className="font-mono text-[0.8em]">#</code>
                    </label>
                    <input
                      id={`aasa-fragment-${index}`}
                      type="text"
                      spellCheck={false}
                      value={component["#"] ?? ""}
                      onChange={(e) =>
                        updateComponent(index, { "#": e.target.value })
                      }
                      placeholder="e.g. *"
                      className="field-input font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Query Matching Section */}
                <div className="flex flex-col gap-2 rounded-md border border-[var(--line)] bg-[var(--surface-subtle)]/40 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[var(--ink-secondary)]">
                      Query Parameters Matcher <code className="font-mono text-[0.8em]">?</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => addQueryPair(index)}
                      className="action-btn text-[11px] py-0.5 px-2"
                    >
                      + Query Pair
                    </button>
                  </div>
                  <Show
                    condition={queryPairs.length > 0}
                    fallback={
                      <p className="text-[11px] text-[var(--muted)] font-mono">
                        No query rules (matches any or no query parameters).
                      </p>
                    }
                  >
                    <ul className="flex flex-col gap-2">
                      {queryPairs.map((pair, pairIndex) => (
                        <li
                          key={`aasa-query-${index}-${pairIndex}`}
                          className="flex flex-wrap items-end gap-2"
                        >
                          <div className="flex min-w-[6rem] flex-1 flex-col gap-1">
                            <label
                              htmlFor={`aasa-qkey-${index}-${pairIndex}`}
                              className="text-[10px] text-[var(--muted)]"
                            >
                              Key (e.g. * or id)
                            </label>
                            <input
                              id={`aasa-qkey-${index}-${pairIndex}`}
                              type="text"
                              spellCheck={false}
                              value={pair.key}
                              onChange={(e) =>
                                updateQueryPair(index, pairIndex, {
                                  key: e.target.value,
                                })
                              }
                              placeholder="* or id"
                              className="field-input font-mono text-xs"
                            />
                          </div>
                          <div className="flex min-w-[6rem] flex-1 flex-col gap-1">
                            <label
                              htmlFor={`aasa-qval-${index}-${pairIndex}`}
                              className="text-[10px] text-[var(--muted)]"
                            >
                              Value Pattern (* / ??? / ?*)
                            </label>
                            <input
                              id={`aasa-qval-${index}-${pairIndex}`}
                              type="text"
                              spellCheck={false}
                              value={pair.value}
                              onChange={(e) =>
                                updateQueryPair(index, pairIndex, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="* or ????"
                              className="field-input font-mono text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQueryPair(index, pairIndex)}
                            className="action-btn text-xs py-1 px-2 mb-0.5"
                            aria-label={`Remove query pair ${pairIndex + 1}`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Show>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isExcluded}
                      onChange={(e) =>
                        updateComponent(index, {
                          exclude: e.target.checked,
                        })
                      }
                      className="accent-amber-500 rounded"
                    />
                    <span>Exclude matching URLs (<code className="font-mono">exclude: true</code>)</span>
                  </label>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <input
                      id={`aasa-comment-${index}`}
                      type="text"
                      value={component.comment ?? ""}
                      onChange={(e) =>
                        updateComponent(index, {
                          comment: e.target.value,
                        })
                      }
                      placeholder="Comment / note (e.g. Block admin routes)"
                      className="field-input text-xs"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Show>
    </div>
  );
}
