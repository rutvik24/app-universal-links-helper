import { AppLogo } from "@/components/app-logo";
import { GeneratorForm } from "@/components/generator-form";
import { HostingGuide } from "@/components/hosting-guide";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--background)] selection:bg-sky-500/30">
      {/* Dynamic Background Mesh Grid & Glow Ambient Accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent-glow),transparent_70%)] opacity-70 blur-3xl animate-pulse-glow" />
        <div className="absolute top-96 left-1/4 h-[24rem] w-[36rem] rounded-full bg-[radial-gradient(ellipse_at_center,var(--android-tint),transparent_75%)] opacity-40 blur-3xl" />
        <div className="absolute top-96 right-1/4 h-[24rem] w-[36rem] rounded-full bg-[radial-gradient(ellipse_at_center,var(--ios-tint),transparent_75%)] opacity-40 blur-3xl" />
        <div className="page-grid absolute inset-0 opacity-80" />
      </div>

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface-glass)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <AppLogo className="size-8 shrink-0" title="App Links Helper" />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[var(--ink)]">
                  App Links Studio
                </span>
                <span className="text-[10px] font-mono font-medium text-[var(--muted)]">
                  Universal Links &amp; App Links Configurator
                </span>
              </div>
            </div>
            <span className="hidden h-4 w-px bg-[var(--line)] sm:block" />
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold text-[var(--android-accent)]">
                Android 14+ Ready
              </span>
              <span className="text-[var(--muted)]">·</span>
              <span className="font-mono text-[11px] font-semibold text-[var(--ios-accent)]">
                iOS 17+ AASA v2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-10 sm:px-8 sm:py-12">
        <section className="flex flex-col gap-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--ink-secondary)] w-fit shadow-xs">
            <span className="size-2 rounded-full bg-sky-400" />
            <span>Client-Side Verification Generator — 100% Private &amp; Instant</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl leading-tight">
            Seamless Universal Links &amp; Android App Links Setup.
          </h1>

          <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Craft production-ready <code className="rounded bg-[var(--tint)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--android-accent)] font-semibold border border-[var(--android-border)]">assetlinks.json</code> and iOS <code className="rounded bg-[var(--tint)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--ios-accent)] font-semibold border border-[var(--ios-border)]">apple-app-site-association</code> files with live AASA component matchers, AndroidManifest XML filters, and CLI test suites.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-md bg-[var(--tint)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--ink)] border border-[var(--line)]">
              /.well-known/assetlinks.json
            </span>
            <span className="rounded-md bg-[var(--tint)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--ink)] border border-[var(--line)]">
              /.well-known/apple-app-site-association
            </span>
            <span className="rounded-md bg-[var(--tint)] px-2.5 py-1 font-mono text-xs font-medium text-[var(--ink)] border border-[var(--line)]">
              AndroidManifest.xml &lt;intent-filter&gt;
            </span>
          </div>
        </section>

        {/* Main Interactive Studio Generator */}
        <GeneratorForm />

        {/* Production Deployment Checklist */}
        <HostingGuide />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] bg-[var(--surface-subtle)]/40 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-[var(--muted)] sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <AppLogo className="size-5 text-[var(--accent)]" />
            <span className="font-semibold text-[var(--ink)]">App Links Studio</span>
            <span>— Free, open-source, client-side developer utility.</span>
          </div>
          <div>
            Pair with <span className="font-semibold text-[var(--ink)]">firebase-email-link-host</span> for branded Firebase email-link continue URLs on App Hosting.
          </div>
        </div>
      </footer>
    </div>
  );
}
