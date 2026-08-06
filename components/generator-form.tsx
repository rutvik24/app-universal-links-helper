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

  const [packageName, setPackageName] = useState("");
  const [fingerprints, setFingerprints] = useState("");
  const [namespace, setNamespace] = useState(DEFAULT_ASSETLINKS_NAMESPACE);
  const [relationHandleAll, setRelationHandleAll] = useState(true);
  const [relationLoginCreds, setRelationLoginCreds] = useState(false);
  const [includeUrl, setIncludeUrl] = useState("");
  const [androidPathRules, setAndroidPathRules] = useState<AndroidPathRule[]>(
    [],
  );
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
        "Could not parse that URL. Include a host, e.g. https://example.com/path",
      );
      return;
    }

    setPasteError("");
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

  async function handleCopy(kind: CopyKind, text: string) {
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopyTarget(kind);
      window.setTimeout(() => setCopyTarget(null), 1600);
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-5" aria-labelledby="hosts-heading">
        <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-1">
            <h2
              id="hosts-heading"
              className="text-lg font-semibold tracking-tight text-[var(--ink)]"
            >
              Hosts &amp; test URL
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Shared by Manifest XML, hosting curls, and open-URL test commands.
              Multiple hosts become separate{" "}
              <code className="font-mono text-[0.85em]">&lt;data&gt;</code>{" "}
              tags.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSampleData}
            className="action-btn action-btn-primary shrink-0 self-start"
          >
            Load sample data
          </button>
        </header>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-[var(--ink)]">
            Schemes
          </legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={schemeHttp}
                onChange={(e) => setSchemeHttp(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              <span className="font-mono text-[0.85em] text-[var(--ink)]">
                http
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={schemeHttps}
                onChange={(e) => setSchemeHttps(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              <span className="font-mono text-[0.85em] text-[var(--ink)]">
                https
              </span>
            </label>
          </div>
        </fieldset>

        <Field
          label="Hosts"
          htmlFor="hosts"
          hint="One host per line (e.g. www.example.com)"
        >
          <textarea
            id="hosts"
            rows={3}
            autoComplete="off"
            spellCheck={false}
            value={hostsText}
            onChange={(e) => setHostsText(e.target.value)}
            placeholder={"www.example.com\nstaging.example.com"}
            className="field-input font-mono text-[0.85rem]"
          />
        </Field>

        <div className="flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]/60 p-4">
          <Field
            label="Paste test URL"
            htmlFor="paste-url"
            hint="Merges host into the list, enables the URL scheme, appends a suggested AASA component + Android path rule, and drives open-URL commands"
          >
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
              placeholder="https://example.com/products/42?ref=1"
              className="field-input font-mono text-[0.85rem]"
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={applyPasteUrl}
              className="action-btn action-btn-primary"
            >
              Apply URL
            </button>
          </div>
          <Show condition={Boolean(pasteError)}>
            <p className="text-sm text-red-700" role="alert">
              {pasteError}
            </p>
          </Show>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section
          className="flex flex-col gap-5"
          aria-labelledby="android-heading"
        >
          <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-3">
            <h2
              id="android-heading"
              className="text-lg font-semibold tracking-tight text-[var(--ink)]"
            >
              Android — Digital Asset Links
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Generates{" "}
              <code className="font-mono text-[0.85em]">assetlinks.json</code>
            </p>
          </header>

          <Field
            label="Package name"
            htmlFor="package-name"
            hint="e.g. com.example.app"
          >
            <input
              id="package-name"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="com.example.app"
              className="field-input"
            />
          </Field>

          <Field
            label="SHA-256 certificate fingerprints"
            htmlFor="fingerprints"
            hint="One per line (or comma-separated)"
          >
            <textarea
              id="fingerprints"
              rows={4}
              spellCheck={false}
              value={fingerprints}
              onChange={(e) => setFingerprints(e.target.value)}
              placeholder={"AA:BB:CC:...\nDD:EE:FF:..."}
              className="field-input font-mono text-[0.85rem]"
            />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-[var(--ink)]">
              Relations
            </legend>
            <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={relationHandleAll}
                onChange={(e) => setRelationHandleAll(e.target.checked)}
                className="mt-0.5 accent-[var(--accent)]"
              />
              <span>
                <code className="font-mono text-[0.8em] text-[var(--ink)]">
                  handle_all_urls
                </code>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={relationLoginCreds}
                onChange={(e) => setRelationLoginCreds(e.target.checked)}
                className="mt-0.5 accent-[var(--accent)]"
              />
              <span>
                <code className="font-mono text-[0.8em] text-[var(--ink)]">
                  get_login_creds
                </code>
              </span>
            </label>
          </fieldset>

          <PathRulesEditor
            rules={androidPathRules}
            onChange={setAndroidPathRules}
          />

          <details className="group rounded-md border border-[var(--line)] bg-[var(--surface)]/60 px-3 py-2">
            <summary className="cursor-pointer select-none text-sm font-medium text-[var(--muted)] outline-none">
              Advanced
            </summary>
            <div className="mt-3 flex flex-col gap-3 pb-1">
              <Field label="Namespace" htmlFor="namespace">
                <input
                  id="namespace"
                  type="text"
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  className="field-input"
                />
              </Field>
              <Field
                label="Include URL (optional)"
                htmlFor="include-url"
                hint='Appends { "include": "https://…" } statement'
              >
                <input
                  id="include-url"
                  type="url"
                  spellCheck={false}
                  value={includeUrl}
                  onChange={(e) => setIncludeUrl(e.target.value)}
                  placeholder="https://example.com/.well-known/assetlinks.json"
                  className="field-input font-mono text-[0.85rem]"
                />
              </Field>
              <label className="flex items-start gap-2 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={wrapInActivity}
                  onChange={(e) => setWrapInActivity(e.target.checked)}
                  className="mt-0.5 accent-[var(--accent)]"
                />
                <span>
                  Wrap intent-filter in{" "}
                  <code className="font-mono text-[0.8em] text-[var(--ink)]">
                    &lt;activity&gt;
                  </code>{" "}
                  (off by default — paste filter into your existing activity)
                </span>
              </label>
              <Show condition={wrapInActivity}>
                <Field
                  label="Activity name"
                  htmlFor="activity-name"
                  hint="Used when wrapping the Manifest snippet"
                >
                  <input
                    id="activity-name"
                    type="text"
                    spellCheck={false}
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder=".MainActivity"
                    className="field-input font-mono text-[0.85rem]"
                  />
                </Field>
              </Show>
            </div>
          </details>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="ios-heading">
          <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-3">
            <h2
              id="ios-heading"
              className="text-lg font-semibold tracking-tight text-[var(--ink)]"
            >
              iOS — Universal Links
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Generates{" "}
              <code className="font-mono text-[0.85em]">
                apple-app-site-association
              </code>{" "}
              with modern components + legacy paths
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Team ID"
              htmlFor="team-id"
              hint="10-character Apple Team ID"
            >
              <input
                id="team-id"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="ABCDE12345"
                className="field-input font-mono"
              />
            </Field>
            <Field
              label="Bundle ID"
              htmlFor="bundle-id"
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
                className="field-input"
              />
            </Field>
          </div>

          <Show condition={Boolean(derivedAppId)}>
            <p className="rounded-md bg-[var(--tint)] px-3 py-2 font-mono text-xs text-[var(--ink)]">
              appID → {derivedAppId}
            </p>
          </Show>

          <AasaComponentsEditor
            components={aasaComponents}
            onChange={setAasaComponents}
          />

          <Field
            label="Webcredentials apps (optional)"
            htmlFor="webcredentials"
            hint="TEAMID.bundle.id — one per line; omit to skip webcredentials"
          >
            <textarea
              id="webcredentials"
              rows={2}
              spellCheck={false}
              value={webcredentialsApps}
              onChange={(e) => setWebcredentialsApps(e.target.value)}
              placeholder={derivedAppId || "TEAMID.com.example.app"}
              className="field-input font-mono text-[0.85rem]"
            />
          </Field>

          <Field
            label="App Clips apps (optional)"
            htmlFor="appclips"
            hint="TEAMID.bundle.id — one per line; omit to skip appclips"
          >
            <textarea
              id="appclips"
              rows={2}
              spellCheck={false}
              value={appclipsApps}
              onChange={(e) => setAppclipsApps(e.target.value)}
              placeholder={
                derivedAppId
                  ? `${derivedAppId}.Clip`
                  : "TEAMID.com.example.app.Clip"
              }
              className="field-input font-mono text-[0.85rem]"
            />
          </Field>
        </section>
      </div>

      <section
        className="flex flex-col gap-5"
        aria-labelledby="preview-heading"
      >
        <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-3">
          <h2
            id="preview-heading"
            className="text-lg font-semibold tracking-tight text-[var(--ink)]"
          >
            Preview &amp; download
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Live output from your inputs. Host verification files on your domain
            — this tool does not upload them.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <PreviewPanel
            title="assetlinks.json"
            content={assetLinksJson}
            emptyHint="Enter package name and at least one SHA-256 fingerprint (or an include URL)."
            copied={copyTarget === "android"}
            onCopy={() => handleCopy("android", assetLinksJson)}
            onDownload={() =>
              downloadTextFile("assetlinks.json", assetLinksJson)
            }
          />
          <PreviewPanel
            title="apple-app-site-association"
            content={aasaJson}
            emptyHint="Enter Team ID and Bundle ID."
            copied={copyTarget === "ios"}
            onCopy={() => handleCopy("ios", aasaJson)}
            onDownload={() =>
              downloadTextFile(
                "apple-app-site-association",
                aasaJson,
                "application/json",
              )
            }
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold tracking-tight text-[var(--ink)]">
            Android Manifest intent-filter
          </h3>
          <p className="rounded-md border border-[var(--line)] bg-[var(--tint)] px-3 py-2 text-sm text-[var(--ink)]">
            Copy this{" "}
            <code className="font-mono text-[0.85em]">&lt;intent-filter&gt;</code>{" "}
            into your existing{" "}
            <code className="font-mono text-[0.85em]">&lt;activity&gt;</code> as
            an <strong>additional</strong> intent-filter. Keep your
            main/launcher intent-filter unchanged.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Schemes, hosts, and path rules are separate{" "}
            <code className="font-mono text-[0.85em]">&lt;data&gt;</code> tags
            (Android merges them). AASA-style query globs are not modeled here —
            use iOS components for query matching. Requires at least one host
            above.
          </p>
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
        </div>
      </section>

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
}: {
  title: string;
  content: string;
  emptyHint: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  const hasContent = content.length > 0;

  return (
    <div className="flex min-h-[18rem] flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--code-bg)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
        <span className="truncate font-mono text-xs font-medium text-[var(--ink)]">
          {title}
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
            {emptyHint}
          </p>
        }
      >
        <pre className="flex-1 overflow-auto p-4 font-mono text-[0.75rem] leading-relaxed text-[var(--code-fg)]">
          {content}
        </pre>
      </Show>
    </div>
  );
}
