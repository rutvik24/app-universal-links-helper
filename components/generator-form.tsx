"use client";

import { useMemo, useState } from "react";
import { AasaComponentsEditor } from "@/components/aasa-components-editor";
import { Field } from "@/components/field";
import { ManifestPreview } from "@/components/manifest-preview";
import { PathRulesEditor } from "@/components/path-rules-editor";
import { Show } from "@/components/show";
import { TestCommandsPanel } from "@/components/test-commands-panel";
import { copyTextToClipboard, downloadTextFile } from "@/lib/download";
import {
  defaultAasaComponents,
  generateAasa,
  stringifyAasa,
  suggestAasaComponentFromUrl,
  toAppId,
  type AasaComponentInput,
} from "@/lib/generate-aasa";
import {
  generateAndroidIntentFilter,
  type AndroidPathRule,
} from "@/lib/generate-android-intent-filter";
import {
  DEFAULT_ASSETLINKS_NAMESPACE,
  DEFAULT_ASSETLINKS_RELATION,
  generateAssetLinks,
  LOGIN_CREDS_RELATION,
  stringifyAssetLinks,
} from "@/lib/generate-assetlinks";
import { generateTestCommands } from "@/lib/generate-test-commands";
import { parseTestUrl } from "@/lib/parse-test-url";
import { getSampleFormData } from "@/lib/sample-form-data";

function linesToList(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

type CopyKind = "android" | "ios" | "manifest";

export function GeneratorForm() {
  const [hostsText, setHostsText] = useState("");
  const [schemeHttp, setSchemeHttp] = useState(true);
  const [schemeHttps, setSchemeHttps] = useState(true);
  const [pasteUrl, setPasteUrl] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [urlAppliedSuccess, setUrlAppliedSuccess] = useState(false);

  const [packageName, setPackageName] = useState("");
  const [fingerprints, setFingerprints] = useState("");
  const [namespace, setNamespace] = useState(DEFAULT_ASSETLINKS_NAMESPACE);
  const [relationHandleAll, setRelationHandleAll] = useState(true);
  const [relationLoginCreds, setRelationLoginCreds] = useState(false);
  const [includeUrl, setIncludeUrl] = useState("");
  const [androidPathRules, setAndroidPathRules] = useState<AndroidPathRule[]>([]);
  const [activityName, setActivityName] = useState(".MainActivity");
  const [wrapInActivity, setWrapInActivity] = useState(false);

  const [teamId, setTeamId] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [aasaComponents, setAasaComponents] = useState<AasaComponentInput[]>(
    () => defaultAasaComponents(),
  );
  const [webcredentialsApps, setWebcredentialsApps] = useState("");
  const [appclipsApps, setAppclipsApps] = useState("");

  const [copyTarget, setCopyTarget] = useState<CopyKind | null>(null);
  const [activeTab, setActiveTab] = useState<"assetlinks" | "aasa" | "manifest">("assetlinks");

  const hosts = useMemo(() => linesToList(hostsText), [hostsText]);

  const schemes = useMemo(() => {
    const list: string[] = [];
    if (schemeHttp) list.push("http");
    if (schemeHttps) list.push("https");
    return list.length > 0 ? list : ["https"];
  }, [schemeHttp, schemeHttps]);

  const selectedRelations = useMemo(() => {
    const list: string[] = [];
    if (relationHandleAll) list.push(DEFAULT_ASSETLINKS_RELATION);
    if (relationLoginCreds) list.push(LOGIN_CREDS_RELATION);
    return list.length > 0 ? list : [DEFAULT_ASSETLINKS_RELATION];
  }, [relationHandleAll, relationLoginCreds]);

  const assetLinks = useMemo(
    () =>
      generateAssetLinks({
        packageName,
        sha256Fingerprints: linesToList(fingerprints),
        namespace,
        relations: selectedRelations,
        includeUrl,
      }),
    [packageName, fingerprints, namespace, selectedRelations, includeUrl],
  );

  const aasa = useMemo(() => {
    const webApps = linesToList(webcredentialsApps);
    const clipApps = linesToList(appclipsApps);

    return generateAasa({
      teamId,
      bundleId,
      components:
        aasaComponents.length > 0
          ? aasaComponents
          : defaultAasaComponents(),
      webcredentialsApps: webApps.length > 0 ? webApps : undefined,
      appclipsApps: clipApps.length > 0 ? clipApps : undefined,
    });
  }, [teamId, bundleId, aasaComponents, webcredentialsApps, appclipsApps]);

  const assetLinksJson = useMemo(
    () => (assetLinks.length > 0 ? stringifyAssetLinks(assetLinks) : ""),
    [assetLinks],
  );

  const aasaJson = useMemo(
    () => (aasa ? stringifyAasa(aasa) : ""),
    [aasa],
  );

  const intentFilterXml = useMemo(
    () =>
      generateAndroidIntentFilter({
        hosts,
        schemes,
        pathRules: androidPathRules,
        activityName,
        wrapInActivity,
      }),
    [hosts, schemes, androidPathRules, activityName, wrapInActivity],
  );

  const pathPatternsForTests = useMemo(
    () =>
      aasaComponents
        .map((c) => c["/"]?.trim())
        .filter((p): p is string => Boolean(p)),
    [aasaComponents],
  );

  const testCommands = useMemo(
    () =>
      generateTestCommands({
        hosts,
        schemes,
        pastedUrl: pasteUrl,
        packageName,
        pathPatterns: pathPatternsForTests,
      }),
    [hosts, schemes, pasteUrl, packageName, pathPatternsForTests],
  );

  const derivedAppId =
    teamId.trim() && bundleId.trim() ? toAppId(teamId, bundleId) : "";

  function applyPasteUrl() {
    const parsed = parseTestUrl(pasteUrl);
    if (!parsed) {
      setPasteError(
        "Invalid test URL. Please include protocol and hostname, e.g. https://app.example.com/item/123",
      );
      setUrlAppliedSuccess(false);
      return;
    }

    setPasteError("");
    setUrlAppliedSuccess(true);
    window.setTimeout(() => setUrlAppliedSuccess(false), 2500);

    setHostsText((prev) => {
      const existing = linesToList(prev);
      if (existing.includes(parsed.host)) return prev;
      return [...existing, parsed.host].join("\n");
    });
    if (parsed.scheme === "http") {
      setSchemeHttp(true);
    } else {
      setSchemeHttps(true);
    }

    const suggested = suggestAasaComponentFromUrl({
      path: parsed.path,
      suggestedAasaPath: parsed.suggestedAasaPath,
      queryParams: parsed.queryParams,
      fragment: parsed.fragment,
    });
    setAasaComponents((prev) => [...prev, suggested]);

    setAndroidPathRules((prev) => {
      const suggestion = parsed.suggestedAndroidPathAttr;
      const exists = prev.some(
        (r) => r.mode === suggestion.mode && r.value === suggestion.value,
      );
      if (exists) return prev;
      return [...prev, { mode: suggestion.mode, value: suggestion.value }];
    });
  }

  function loadSampleData() {
    const sample = getSampleFormData();
    setPasteError("");
    setHostsText(sample.hostsText);
    setSchemeHttp(sample.schemeHttp);
    setSchemeHttps(sample.schemeHttps);
    setPasteUrl(sample.pasteUrl);
    setPackageName(sample.packageName);
    setFingerprints(sample.fingerprints);
    setNamespace(sample.namespace);
    setRelationHandleAll(sample.relationHandleAll);
    setRelationLoginCreds(sample.relationLoginCreds);
    setIncludeUrl(sample.includeUrl);
    setAndroidPathRules(sample.androidPathRules);
    setActivityName(sample.activityName);
    setWrapInActivity(sample.wrapInActivity);
    setTeamId(sample.teamId);
    setBundleId(sample.bundleId);
    setAasaComponents(sample.aasaComponents);
    setWebcredentialsApps(sample.webcredentialsApps);
    setAppclipsApps(sample.appclipsApps);
  }

  function clearAllData() {
    setHostsText("");
    setPasteUrl("");
    setPackageName("");
    setFingerprints("");
    setTeamId("");
    setBundleId("");
    setAndroidPathRules([]);
    setAasaComponents([]);
    setIncludeUrl("");
    setWebcredentialsApps("");
    setAppclipsApps("");
  }

  async function handleCopy(kind: CopyKind, text: string) {
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopyTarget(kind);
      window.setTimeout(() => setCopyTarget(null), 1600);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Top Toolbar Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-glass)] p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="flex size-2.5 rounded-full bg-sky-400 animate-ping" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)]">Verification Config Deck</h2>
            <p className="text-xs text-[var(--muted)]">Configure domains, iOS Team ID, and Android SHA-256 fingerprints.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSampleData}
            className="action-btn action-btn-primary"
          >
            ⚡ Load Production Sample
          </button>
          <button
            type="button"
            onClick={clearAllData}
            className="action-btn text-xs hover:border-red-500/30 hover:text-red-500"
          >
            Reset Form
          </button>
        </div>
      </div>

      {/* Section 1: Domains & Test URL Inspector */}
      <section className="studio-card p-6" aria-labelledby="hosts-heading">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-1.5 border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-[var(--accent)]" />
              <h2
                id="hosts-heading"
                className="text-base font-semibold tracking-tight text-[var(--ink)]"
              >
                1. Domain Hosts &amp; Deep Link Inspector
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Specify your target domain hostnames and optionally paste a sample deep link to auto-fill path rules.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Field
                label="Target Domain Hosts"
                htmlFor="hosts"
                badge={hosts.length > 0 ? `${hosts.length} ${hosts.length === 1 ? 'host' : 'hosts'}` : "Required"}
                hint="Enter one domain host per line (e.g. app.example.com)"
              >
                <textarea
                  id="hosts"
                  rows={4}
                  autoComplete="off"
                  spellCheck={false}
                  value={hostsText}
                  onChange={(e) => setHostsText(e.target.value)}
                  placeholder={"app.example.com\nstaging.example.com"}
                  className="field-input font-mono text-xs leading-relaxed"
                />
              </Field>

              {/* Active Host Chip Badges */}
              <Show condition={hosts.length > 0}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase text-[var(--muted)]">Active Hosts:</span>
                  {hosts.map((h, i) => (
                    <span key={`host-badge-${i}`} className="rounded-md bg-[var(--tint)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--ink)] border border-[var(--line)]">
                      {h}
                    </span>
                  ))}
                </div>
              </Show>

              <fieldset className="flex flex-col gap-2">
                <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)]">
                  Supported URL Schemes
                </legend>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={schemeHttp}
                      onChange={(e) => setSchemeHttp(e.target.checked)}
                      className="accent-[var(--accent)] rounded"
                    />
                    <span className="font-mono text-xs font-semibold">http://</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={schemeHttps}
                      onChange={(e) => setSchemeHttps(e.target.checked)}
                      className="accent-[var(--accent)] rounded"
                    />
                    <span className="font-mono text-xs font-semibold">https://</span>
                    <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-500 border border-sky-500/20">
                      RECOMMENDED
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>

            {/* Test URL Inspector */}
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)]/60 p-4">
              <Field
                label="Deep Link Test URL Inspector"
                htmlFor="paste-url"
                badge="Auto-Parser"
                hint="Paste any sample URL to auto-extract host, scheme, iOS AASA component, and Android path rule"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="paste-url"
                      type="url"
                      autoComplete="off"
                      spellCheck={false}
                      value={pasteUrl}
                      onChange={(e) => {
                        setPasteUrl(e.target.value);
                        setPasteError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyPasteUrl();
                        }
                      }}
                      placeholder="https://example.com/products/42?ref=share#specs"
                      className="field-input font-mono text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={applyPasteUrl}
                      className="action-btn action-btn-primary text-xs py-2 px-3 shrink-0"
                    >
                      Parse &amp; Apply
                    </button>
                  </div>

                  <Show condition={Boolean(pasteError)}>
                    <p className="text-xs font-medium text-red-500" role="alert">
                      {pasteError}
                    </p>
                  </Show>
                  <Show condition={urlAppliedSuccess}>
                    <p className="text-xs font-medium text-emerald-500 flex items-center gap-1" role="status">
                      ✓ URL parsed successfully! Merged host &amp; generated path matchers below.
                    </p>
                  </Show>
                </div>
              </Field>

              <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 text-xs leading-relaxed text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">What happens when you parse a URL:</span>
                <ul className="mt-1.5 list-disc pl-4 space-y-1">
                  <li>Host is merged into your target hosts list.</li>
                  <li>Protocol (http/https) is activated.</li>
                  <li>AASA Component matcher is created with exact query parameters.</li>
                  <li>Android path filter rule is appended to Intent-Filter XML.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Platform Twin Engine Setup */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Android App Links Studio Card */}
        <section className="studio-card studio-card-android flex flex-col gap-5 p-6" aria-labelledby="android-heading">
          <header className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--android-tint)] text-[var(--android-accent)] border border-[var(--android-border)] font-bold">
                🤖
              </div>
              <div>
                <h2
                  id="android-heading"
                  className="text-base font-semibold tracking-tight text-[var(--ink)] flex items-center gap-2"
                >
                  Android Digital Asset Links
                </h2>
                <p className="text-xs text-[var(--muted)] font-mono">assetlinks.json</p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--android-tint)] px-2.5 py-1 text-[11px] font-bold text-[var(--android-accent)] border border-[var(--android-border)]">
              Android 6.0+
            </span>
          </header>

          <Field
            label="Application Package Name"
            htmlFor="package-name"
            badge="Required"
            hint="Reverse domain notation (e.g. com.example.app)"
          >
            <input
              id="package-name"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="com.example.app"
              className="field-input font-mono text-xs"
            />
          </Field>

          <Field
            label="SHA-256 Certificate Fingerprints"
            htmlFor="fingerprints"
            badge={linesToList(fingerprints).length > 0 ? `${linesToList(fingerprints).length} key(s)` : "Required"}
            hint="Hex fingerprints from keystore or Play App Signing (one per line)"
          >
            <textarea
              id="fingerprints"
              rows={4}
              spellCheck={false}
              value={fingerprints}
              onChange={(e) => setFingerprints(e.target.value)}
              placeholder={"14:6D:E9:7C:15:D9:6A:0C:D1:2E:4B:97:A2:35:86:14:0A:42..."}
              className="field-input font-mono text-xs leading-relaxed"
            />
          </Field>

          <fieldset className="flex flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)]/40 p-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)]">
              Statement Relations
            </legend>
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={relationHandleAll}
                onChange={(e) => setRelationHandleAll(e.target.checked)}
                className="accent-[var(--android-accent)] rounded"
              />
              <code className="font-mono text-xs">delegate_permission/common.handle_all_urls</code>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={relationLoginCreds}
                onChange={(e) => setRelationLoginCreds(e.target.checked)}
                className="accent-[var(--android-accent)] rounded"
              />
              <code className="font-mono text-xs">delegate_permission/common.get_login_creds</code>
            </label>
          </fieldset>

          <PathRulesEditor
            rules={androidPathRules}
            onChange={setAndroidPathRules}
          />

          <details className="group rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)]/30 px-4 py-3">
            <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] outline-none flex items-center justify-between">
              <span>Advanced Android Options</span>
              <span className="font-mono text-xs font-normal">▼</span>
            </summary>
            <div className="mt-4 flex flex-col gap-4 border-t border-[var(--line)] pt-3">
              <Field label="Namespace" htmlFor="namespace">
                <input
                  id="namespace"
                  type="text"
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  className="field-input font-mono text-xs"
                />
              </Field>
              <Field
                label="External Include Statement URL (optional)"
                htmlFor="include-url"
                hint='Appends { "include": "https://..." } statement to assetlinks'
              >
                <input
                  id="include-url"
                  type="url"
                  spellCheck={false}
                  value={includeUrl}
                  onChange={(e) => setIncludeUrl(e.target.value)}
                  placeholder="https://example.com/.well-known/assetlinks.json"
                  className="field-input font-mono text-xs"
                />
              </Field>
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--ink)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wrapInActivity}
                  onChange={(e) => setWrapInActivity(e.target.checked)}
                  className="accent-[var(--android-accent)] rounded"
                />
                <span>Wrap intent-filter XML in <code className="font-mono">&lt;activity&gt;</code> element</span>
              </label>
              <Show condition={wrapInActivity}>
                <Field label="Target Activity Name" htmlFor="activity-name">
                  <input
                    id="activity-name"
                    type="text"
                    spellCheck={false}
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder=".MainActivity"
                    className="field-input font-mono text-xs"
                  />
                </Field>
              </Show>
            </div>
          </details>
        </section>

        {/* iOS Universal Links Studio Card */}
        <section className="studio-card studio-card-ios flex flex-col gap-5 p-6" aria-labelledby="ios-heading">
          <header className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--ios-tint)] text-[var(--ios-accent)] border border-[var(--ios-border)] font-bold">
                🍎
              </div>
              <div>
                <h2
                  id="ios-heading"
                  className="text-base font-semibold tracking-tight text-[var(--ink)] flex items-center gap-2"
                >
                  iOS Universal Links
                </h2>
                <p className="text-xs text-[var(--muted)] font-mono">apple-app-site-association</p>
              </div>
            </div>
            <span className="rounded-full bg-[var(--ios-tint)] px-2.5 py-1 text-[11px] font-bold text-[var(--ios-accent)] border border-[var(--ios-border)]">
              iOS 9.0+ / 13.0+
            </span>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Apple Team ID"
              htmlFor="team-id"
              badge="10 Chars"
              hint="Developer Portal Team ID (e.g. ABCDE12345)"
            >
              <input
                id="team-id"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="ABCDE12345"
                className="field-input font-mono text-xs uppercase"
              />
            </Field>

            <Field
              label="App Bundle ID"
              htmlFor="bundle-id"
              badge="Required"
              hint="e.g. com.example.app"
            >
              <input
                id="bundle-id"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={bundleId}
                onChange={(e) => setBundleId(e.target.value)}
                placeholder="com.example.app"
                className="field-input font-mono text-xs"
              />
            </Field>
          </div>

          <Show condition={Boolean(derivedAppId)}>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--ios-border)] bg-[var(--ios-tint)] px-3 py-2 font-mono text-xs text-[var(--ios-accent)]">
              <span className="font-semibold">Derived appID:</span>
              <span className="font-bold">{derivedAppId}</span>
            </div>
          </Show>

          <AasaComponentsEditor
            components={aasaComponents}
            onChange={setAasaComponents}
          />

          <details className="group rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)]/30 px-4 py-3">
            <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--ink)] outline-none flex items-center justify-between">
              <span>Web Credentials &amp; App Clips Support</span>
              <span className="font-mono text-xs font-normal">▼</span>
            </summary>
            <div className="mt-4 flex flex-col gap-4 border-t border-[var(--line)] pt-3">
              <Field
                label="Webcredentials Target Apps (optional)"
                htmlFor="webcredentials"
                hint="TEAMID.bundle.id — one per line for shared password credentials"
              >
                <textarea
                  id="webcredentials"
                  rows={2}
                  spellCheck={false}
                  value={webcredentialsApps}
                  onChange={(e) => setWebcredentialsApps(e.target.value)}
                  placeholder={derivedAppId || "TEAMID.com.example.app"}
                  className="field-input font-mono text-xs leading-relaxed"
                />
              </Field>

              <Field
                label="App Clips Target Apps (optional)"
                htmlFor="appclips"
                hint="TEAMID.bundle.id.Clip — one per line for instant App Clips"
              >
                <textarea
                  id="appclips"
                  rows={2}
                  spellCheck={false}
                  value={appclipsApps}
                  onChange={(e) => setAppclipsApps(e.target.value)}
                  placeholder={derivedAppId ? `${derivedAppId}.Clip` : "TEAMID.com.example.app.Clip"}
                  className="field-input font-mono text-xs leading-relaxed"
                />
              </Field>
            </div>
          </details>
        </section>
      </div>

      {/* Section 3: Live Output Artifact Console */}
      <section className="studio-card p-6" aria-labelledby="preview-heading">
        <header className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h2
                id="preview-heading"
                className="text-base font-semibold tracking-tight text-[var(--ink)]"
              >
                2. Generated Verification Artifacts Deck
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Live output generated strictly in your browser. Copy or download files to upload to your web server.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("assetlinks")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "assetlinks"
                  ? "bg-[var(--surface)] text-[var(--android-accent)] shadow-xs border border-[var(--android-border)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              assetlinks.json
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("aasa")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "aasa"
                  ? "bg-[var(--surface)] text-[var(--ios-accent)] shadow-xs border border-[var(--ios-border)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              apple-app-site-association
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manifest")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "manifest"
                  ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs border border-[var(--line)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              intent-filter.xml
            </button>
          </div>
        </header>

        <div className="mt-5">
          <Show condition={activeTab === "assetlinks"}>
            <PreviewPanel
              title="Android — /.well-known/assetlinks.json"
              content={assetLinksJson}
              emptyHint="Provide Package Name and at least one SHA-256 fingerprint to view assetlinks.json"
              copied={copyTarget === "android"}
              onCopy={() => handleCopy("android", assetLinksJson)}
              onDownload={() =>
                downloadTextFile("assetlinks.json", assetLinksJson)
              }
              accentColor="var(--android-accent)"
            />
          </Show>

          <Show condition={activeTab === "aasa"}>
            <PreviewPanel
              title="iOS — /.well-known/apple-app-site-association"
              content={aasaJson}
              emptyHint="Provide Apple Team ID and App Bundle ID to view apple-app-site-association"
              copied={copyTarget === "ios"}
              onCopy={() => handleCopy("ios", aasaJson)}
              onDownload={() =>
                downloadTextFile(
                  "apple-app-site-association",
                  aasaJson,
                  "application/json",
                )
              }
              accentColor="var(--ios-accent)"
            />
          </Show>

          <Show condition={activeTab === "manifest"}>
            <ManifestPreview
              xml={intentFilterXml}
              copied={copyTarget === "manifest"}
              onCopy={() => handleCopy("manifest", intentFilterXml)}
              onDownload={() =>
                downloadTextFile(
                  "intent-filter.xml",
                  intentFilterXml,
                  "application/xml",
                )
              }
            />
          </Show>
        </div>
      </section>

      {/* Section 4: Terminal Test Runner */}
      <TestCommandsPanel commands={testCommands} />
    </div>
  );
}

function PreviewPanel({
  title,
  content,
  emptyHint,
  copied,
  onCopy,
  onDownload,
  accentColor = "var(--accent)",
}: {
  title: string;
  content: string;
  emptyHint: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  accentColor?: string;
}) {
  const hasContent = content.length > 0;
  const lineCount = hasContent ? content.split("\n").length : 0;
  const byteCount = hasContent ? new Blob([content]).size : 0;

  return (
    <div className="flex min-h-[22rem] flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--code-bg)] shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] bg-[#0d131f] px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="size-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="truncate font-mono text-xs font-semibold text-slate-200">
            {title}
          </span>
          <Show condition={hasContent}>
            <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
              {lineCount} lines · {byteCount} bytes
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
            <Show condition={copied} fallback="Copy JSON">
              ✓ Copied
            </Show>
          </button>
          <button
            type="button"
            disabled={!hasContent}
            onClick={onDownload}
            className="action-btn action-btn-primary text-xs py-1 px-3"
          >
            Download Payload
          </button>
        </div>
      </div>
      <Show
        condition={hasContent}
        fallback={
          <div className="flex flex-1 items-center justify-center p-8 text-center text-xs text-slate-500 font-mono">
            {emptyHint}
          </div>
        }
      >
        <pre className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-200 selection:bg-sky-500/30">
          {content}
        </pre>
      </Show>
    </div>
  );
}
