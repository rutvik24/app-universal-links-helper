"use client";

import { useState } from "react";
import { Show } from "@/components/show";
import { copyTextToClipboard } from "@/lib/download";
import type { TestCommand } from "@/lib/generate-test-commands";

export type TestCommandsPanelProps = {
  commands: TestCommand[];
};

export function TestCommandsPanel({ commands }: TestCommandsPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(cmd: TestCommand) {
    const ok = await copyTextToClipboard(cmd.command);
    if (ok) {
      setCopiedId(cmd.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    }
  }

  return (
    <section className="flex flex-col gap-5" aria-labelledby="test-commands-heading">
      <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-3">
        <h2
          id="test-commands-heading"
          className="text-lg font-semibold tracking-tight text-[var(--ink)]"
        >
          Testing commands
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Copy-paste into a terminal. Open-URL commands prefer your pasted test
          URL; otherwise they synthesize one from the first host (or the host
          matching the paste) + first path pattern.{" "}
          <code className="font-mono text-[0.85em]">swcutil verify</code> needs
          macOS / Apple tools and a local AASA JSON path.
        </p>
      </header>

      <Show
        condition={commands.length > 0}
        fallback={
          <p className="rounded-md border border-dashed border-[var(--line)] px-4 py-6 text-center text-sm text-[var(--muted)]">
            Add a host (or paste a test URL) to generate adb, xcrun, curl, and
            swcutil commands. Package name unlocks{" "}
            <code className="font-mono text-[0.85em]">pm get-app-links</code>{" "}
            helpers.
          </p>
        }
      >
        <ul className="flex flex-col gap-3">
          {commands.map((cmd) => (
            <li
              key={cmd.id}
              className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--code-bg)]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
                <span className="text-xs font-medium text-[var(--ink)]">
                  {cmd.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(cmd)}
                  className="action-btn"
                >
                  <Show condition={copiedId === cmd.id} fallback="Copy">
                    Copied
                  </Show>
                </button>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[0.75rem] leading-relaxed text-[var(--code-fg)]">
                {cmd.command}
              </pre>
            </li>
          ))}
        </ul>
      </Show>
    </section>
  );
}
