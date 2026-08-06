export function HostingGuide() {
  return (
    <section className="flex flex-col gap-5" aria-labelledby="hosting-heading">
      <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-3">
        <h2
          id="hosting-heading"
          className="text-lg font-semibold tracking-tight text-[var(--ink)]"
        >
          Hosting checklist
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Serve these files on your app&apos;s HTTPS domain. This site does not
          host them for you.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--tint)]">
              <th className="px-3 py-2.5 font-semibold text-[var(--ink)]">File</th>
              <th className="px-3 py-2.5 font-semibold text-[var(--ink)]">Path</th>
              <th className="px-3 py-2.5 font-semibold text-[var(--ink)]">Status</th>
              <th className="px-3 py-2.5 font-semibold text-[var(--ink)]">
                Content-Type
              </th>
              <th className="px-3 py-2.5 font-semibold text-[var(--ink)]">Notes</th>
            </tr>
          </thead>
          <tbody className="text-[var(--muted)]">
            <tr className="border-b border-[var(--line)]">
              <td className="px-3 py-2.5 font-medium text-[var(--ink)]">Android</td>
              <td className="px-3 py-2.5 font-mono text-xs">
                /.well-known/assetlinks.json
              </td>
              <td className="px-3 py-2.5 font-mono text-xs">200</td>
              <td className="px-3 py-2.5 font-mono text-xs">application/json</td>
              <td className="px-3 py-2.5">HTTPS; no redirect; no auth</td>
            </tr>
            <tr>
              <td className="px-3 py-2.5 font-medium text-[var(--ink)]">iOS</td>
              <td className="px-3 py-2.5 font-mono text-xs">
                /.well-known/apple-app-site-association
              </td>
              <td className="px-3 py-2.5 font-mono text-xs">200</td>
              <td className="px-3 py-2.5 font-mono text-xs">application/json</td>
              <td className="px-3 py-2.5">
                No .json extension; HTTPS; no redirect
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Some setups still check the root fallback{" "}
        <code className="rounded bg-[var(--tint)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--ink)]">
          /apple-app-site-association
        </code>{" "}
        (same contents, still no{" "}
        <code className="font-mono text-[0.85em]">.json</code> extension).
      </p>
    </section>
  );
}
