"use client";

import { useMemo, useState } from "react";
import { Show } from "@/components/show";
import { copyTextToClipboard } from "@/lib/download";
import type { TestCommand } from "@/lib/generate-test-commands";

export type TestCommandsPanelProps = {
  commands: TestCommand[];
};

type FilterCategory = "all" | "android" | "ios" | "curl";

export function TestCommandsPanel({ commands }: TestCommandsPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCategory>("all");

  async function handleCopy(cmd: TestCommand) {
    const ok = await copyTextToClipboard(cmd.command);
    if (ok) {
      setCopiedId(cmd.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    }
  }

  const filteredCommands = useMemo(() => {
    if (filter === "android") return commands.filter((c) => c.id.startsWith("adb") || c.id.startsWith("pm"));
    if (filter === "ios") return commands.filter((c) => c.id.startsWith("xcrun") || c.id.startsWith("swcutil"));
    if (filter === "curl") return commands.filter((c) => c.id.startsWith("curl"));
    return commands;
  }, [commands, filter]);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-md" aria-labelledby="test-commands-heading">
      <header className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2
              id="test-commands-heading"
              className="text-base font-semibold tracking-tight text-[var(--ink)]"
            >
              Terminal Test Runner &amp; CLI Commands
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Ready-to-run shell commands synthesized from your active hosts, packages, and path rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] p-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === "all" ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            All ({commands.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("android")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === "android" ? "bg-[var(--android-tint)] text-[var(--android-accent)] shadow-xs border border-[var(--android-border)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => setFilter("ios")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === "ios" ? "bg-[var(--ios-tint)] text-[var(--ios-accent)] shadow-xs border border-[var(--ios-border)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            iOS &amp; macOS
          </button>
          <button
            type="button"
            onClick={() => setFilter("curl")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === "curl" ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            cURL Check
          </button>
        </div>
      </header>

      <Show
        condition={filteredCommands.length > 0}
        fallback={
          <div className="rounded-lg border border-dashed border-[var(--line)] px-4 py-8 text-center text-xs text-[var(--muted)]">
            Add at least one host above to unlock CLI verification commands.
          </div>
        }
      >
        <ul className="flex flex-col gap-3">
          {filteredCommands.map((cmd) => {
            const isCopied = copiedId === cmd.id;
            const isAndroid = cmd.id.startsWith("adb") || cmd.id.startsWith("pm");
            const isIos = cmd.id.startsWith("xcrun") || cmd.id.startsWith("swcutil");

            return (
              <li
                key={cmd.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--code-bg)] shadow-xs transition-all hover:border-[var(--line-strong)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[#0d131f] px-3.5 py-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="size-2.5 rounded-full bg-red-500/80" />
                      <span className="size-2.5 rounded-full bg-amber-500/80" />
                      <span className="size-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="truncate font-mono text-xs font-semibold text-slate-300">
                      {cmd.label}
                    </span>
                    <Show condition={isAndroid}>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                        ANDROID
                      </span>
                    </Show>
                    <Show condition={isIos}>
                      <span className="rounded-full bg-sky-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-sky-400 border border-sky-500/20">
                        iOS / macOS
                      </span>
                    </Show>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(cmd)}
                    className={`action-btn text-xs py-1 px-3 shrink-0 ${
                      isCopied ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    <Show condition={isCopied} fallback="Copy CLI">
                      ✓ Copied
                    </Show>
                  </button>
                </div>

                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200 selection:bg-sky-500/30">
                  {cmd.command}
                </pre>
              </li>
            );
          })}
        </ul>
      </Show>
    </section>
  );
}
