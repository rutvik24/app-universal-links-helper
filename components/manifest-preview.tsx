"use client";

import { Show } from "@/components/show";

export type ManifestPreviewProps = {
  xml: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
};

export function ManifestPreview({
  xml,
  copied,
  onCopy,
  onDownload,
}: ManifestPreviewProps) {
  const hasContent = xml.length > 0;

  return (
    <div className="flex min-h-[16rem] flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--code-bg)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
        <span className="truncate font-mono text-xs font-medium text-[var(--ink)]">
          intent-filter.xml
        </span>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            disabled={!hasContent}
            onClick={onCopy}
            className="action-btn"
          >
            <Show condition={copied} fallback="Copy">
              Copied
            </Show>
          </button>
          <button
            type="button"
            disabled={!hasContent}
            onClick={onDownload}
            className="action-btn action-btn-primary"
          >
            Download
          </button>
        </div>
      </div>
      <Show
        condition={hasContent}
        fallback={
          <p className="flex flex-1 items-center justify-center px-4 py-8 text-center text-sm text-[var(--muted)]">
            Enter at least one host to generate an AndroidManifest intent-filter
            snippet.
          </p>
        }
      >
        <pre className="flex-1 overflow-auto p-4 font-mono text-[0.75rem] leading-relaxed text-[var(--code-fg)]">
          {xml}
        </pre>
      </Show>
    </div>
  );
}
