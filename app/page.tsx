import { AppLogo } from "@/components/app-logo";
import { GeneratorForm } from "@/components/generator-form";
import { HostingGuide } from "@/components/hosting-guide";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--glow),transparent_70%)] opacity-80" />
        <div className="page-grid absolute inset-0" />
      </div>

      <header className="border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-[var(--accent)]">
              <AppLogo className="size-7 shrink-0" title="App Links Helper" />
              <p className="text-base font-semibold tracking-tight text-[var(--ink)] sm:text-lg">
                App Links Helper
              </p>
            </div>
            <ThemeToggle />
          </div>
          <p className="hidden text-xs text-[var(--muted)] sm:block">
            Domain verification file generator
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-14 px-4 py-10 sm:px-6 sm:py-14">
        <section className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-3 text-[var(--accent)]">
            <AppLogo className="size-9 shrink-0 sm:size-10" />
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              App Links Helper
            </h1>
          </div>
          <p className="text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Generate Android{" "}
            <code className="rounded bg-[var(--tint)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--ink)]">
              assetlinks.json
            </code>{" "}
            and iOS{" "}
            <code className="rounded bg-[var(--tint)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--ink)]">
              apple-app-site-association
            </code>{" "}
            files for your domain. Preview, copy, or download — then host them under{" "}
            <code className="font-mono text-[0.85em]">/.well-known/</code>.
          </p>
        </section>

        <GeneratorForm />
        <HostingGuide />
      </main>

      <footer className="border-t border-[var(--line)] py-6">
        <div className="mx-auto max-w-5xl px-4 text-xs text-[var(--muted)] sm:px-6">
          Client-side only. No data leaves your browser. Pair with{" "}
          <span className="font-medium text-[var(--ink)]">firebase-email-link-host</span>{" "}
          for branded Firebase email-link continue URLs.
        </div>
      </footer>
    </div>
  );
}
