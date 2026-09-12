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
  const lineCount = hasContent ? xml.split("\n").length : 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--code-bg)] shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[#0d131f] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-400" />
          <span className="truncate font-mono text-xs font-semibold text-slate-200">
            AndroidManifest.xml &lt;intent-filter&gt;
          </span>
          <Show condition={hasContent}>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              {lineCount} lines
            </span>
          </Show>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={!hasContent}
            onClick={onCopy}
            className={`action-btn text-xs py-1 px-3 ${
              copied ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Show condition={copied} fallback="Copy XML">
              ✓ Copied
            </Show>
          </button>
          <button
            type="button"
            disabled={!hasContent}
            onClick={onDownload}
            className="action-btn action-btn-android text-xs py-1 px-3"
          >
            Download XML
          </button>
        </div>
      </div>
      <Show
        condition={hasContent}
        fallback={
          <p className="flex flex-1 items-center justify-center p-8 text-center text-xs text-slate-500 font-mono">
            Enter at least one host above to generate an AndroidManifest intent-filter snippet.
          </p>
        }
      >
        <pre className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-300/90 selection:bg-emerald-500/30">
          {xml}
        </pre>
      </Show>
    </div>
  );
}
