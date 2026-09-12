export function HostingGuide() {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-md" aria-labelledby="hosting-heading">
      <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="flex size-2.5 rounded-full bg-sky-400" />
          <h2
            id="hosting-heading"
            className="text-base font-semibold tracking-tight text-[var(--ink)]"
          >
            Production Domain Hosting Checklist
          </h2>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Host these JSON verification payloads under your domain&apos;s HTTPS root directory <code className="font-mono text-[0.85em] text-[var(--ink)]">/.well-known/</code>.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)]/50">
        <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--tint)] text-[var(--ink-secondary)]">
              <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Platform</th>
              <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Required HTTPS Path</th>
              <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">HTTP Status</th>
              <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Content-Type Header</th>
              <th className="px-3.5 py-3 font-semibold uppercase tracking-wider">Requirements</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--ink-secondary)]">
            <tr className="transition-colors hover:bg-[var(--surface)]">
              <td className="px-3.5 py-3">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--android-accent)]">
                  <span className="size-2 rounded-full bg-[var(--android-accent)]" />
                  Android
                </span>
              </td>
              <td className="px-3.5 py-3 font-mono text-xs font-medium text-[var(--ink)]">
                /.well-known/assetlinks.json
              </td>
              <td className="px-3.5 py-3">
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  200 OK
                </span>
              </td>
              <td className="px-3.5 py-3 font-mono text-[11px]">application/json</td>
              <td className="px-3.5 py-3 text-[var(--muted)]">
                Direct HTTPS GET; <strong>no redirects</strong>; no auth headers; valid SSL certificate.
              </td>
            </tr>
            <tr className="transition-colors hover:bg-[var(--surface)]">
              <td className="px-3.5 py-3">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--ios-accent)]">
                  <span className="size-2 rounded-full bg-[var(--ios-accent)]" />
                  iOS
                </span>
              </td>
              <td className="px-3.5 py-3 font-mono text-xs font-medium text-[var(--ink)]">
                /.well-known/apple-app-site-association
              </td>
              <td className="px-3.5 py-3">
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  200 OK
                </span>
              </td>
              <td className="px-3.5 py-3 font-mono text-[11px]">application/json</td>
              <td className="px-3.5 py-3 text-[var(--muted)]">
                <strong>No .json extension</strong>; direct HTTPS GET; <strong>no redirects</strong>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
        <svg className="size-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p>
          <strong>Legacy iOS Fallback Note:</strong> Some iOS systems or web proxies check the root directory fallback{" "}
          <code className="font-mono font-semibold text-amber-800 dark:text-amber-200">/apple-app-site-association</code> (same JSON payload without extension). Serving both locations guarantees 100% iOS compatibility.
        </p>
      </div>
    </section>
  );
}
