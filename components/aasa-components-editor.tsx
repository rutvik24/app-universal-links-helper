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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--ink)]">
          AASA components
        </p>
        <button type="button" onClick={addComponent} className="action-btn">
          Add component
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Per-rule path (
        <code className="font-mono text-[0.85em]">/</code>), query (
        <code className="font-mono text-[0.85em]">?</code>
        ), fragment (
        <code className="font-mono text-[0.85em]">#</code>
        ), exclude, and comment — matching Apple sample shapes. Query is
        per-component, not global. Path is optional for fragment-only rules.
        Use{" "}
        <strong className="font-medium text-[var(--ink)]">Load sample data</strong>{" "}
        above to fill path, query, and exclude examples at once.
      </p>

      <Show
        condition={components.length > 0}
        fallback={
          <p className="rounded-md border border-dashed border-[var(--line)] px-3 py-4 text-center text-sm text-[var(--muted)]">
            No components — add one or paste a test URL to suggest a rule.
          </p>
        }
      >
        <ul className="flex flex-col gap-3">
          {components.map((component, index) => {
            const queryPairs = queryToPairs(component["?"]);
            return (
              <li
                key={`aasa-component-${index}`}
                className="flex flex-col gap-3 rounded-md border border-[var(--line)] bg-[var(--surface)]/60 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                    Component {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeComponent(index)}
                    className="action-btn"
                    aria-label={`Remove component ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`aasa-path-${index}`}
                      className="text-xs font-medium text-[var(--muted)]"
                    >
                      Path{" "}
                      <code className="font-mono text-[0.85em]">/</code>
                    </label>
                    <input
                      id={`aasa-path-${index}`}
                      type="text"
                      spellCheck={false}
                      value={component["/"] ?? ""}
                      onChange={(e) =>
                        updateComponent(index, { "/": e.target.value })
                      }
                      placeholder="* or /help/* (optional if # only)"
                      className="field-input font-mono text-[0.85rem]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`aasa-fragment-${index}`}
                      className="text-xs font-medium text-[var(--muted)]"
                    >
                      Fragment{" "}
                      <code className="font-mono text-[0.85em]">#</code>
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
                      className="field-input font-mono text-[0.85rem]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[var(--muted)]">
                      Query{" "}
                      <code className="font-mono text-[0.85em]">?</code>{" "}
                      (key → pattern; key may be{" "}
                      <code className="font-mono text-[0.85em]">*</code>)
                    </p>
                    <button
                      type="button"
                      onClick={() => addQueryPair(index)}
                      className="action-btn"
                    >
                      Add query
                    </button>
                  </div>
                  <Show
                    condition={queryPairs.length > 0}
                    fallback={
                      <p className="text-xs text-[var(--muted)]">
                        No query pairs — e.g.{" "}
                        <code className="font-mono text-[0.8em]">
                          *: *
                        </code>{" "}
                        or{" "}
                        <code className="font-mono text-[0.8em]">
                          articleNumber: ????
                        </code>
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
                              className="text-xs text-[var(--muted)]"
                            >
                              Key
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
                              className="field-input font-mono text-[0.85rem]"
                            />
                          </div>
                          <div className="flex min-w-[6rem] flex-1 flex-col gap-1">
                            <label
                              htmlFor={`aasa-qval-${index}-${pairIndex}`}
                              className="text-xs text-[var(--muted)]"
                            >
                              Value
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
                              placeholder="* · ??? · ?*"
                              className="field-input font-mono text-[0.85rem]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQueryPair(index, pairIndex)}
                            className="action-btn mb-0.5"
                            aria-label={`Remove query pair ${pairIndex + 1}`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Show>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={Boolean(component.exclude)}
                      onChange={(e) =>
                        updateComponent(index, {
                          exclude: e.target.checked,
                        })
                      }
                      className="accent-[var(--accent)]"
                    />
                    Exclude
                  </label>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label
                      htmlFor={`aasa-comment-${index}`}
                      className="text-xs font-medium text-[var(--muted)]"
                    >
                      Comment
                    </label>
                    <input
                      id={`aasa-comment-${index}`}
                      type="text"
                      value={component.comment ?? ""}
                      onChange={(e) =>
                        updateComponent(index, {
                          comment: e.target.value,
                        })
                      }
                      placeholder="Optional note for this rule"
                      className="field-input text-[0.85rem]"
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
