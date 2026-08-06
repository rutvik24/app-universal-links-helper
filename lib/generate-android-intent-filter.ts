export type AndroidPathMode =
  | "path"
  | "pathPrefix"
  | "pathPattern"
  | "pathAdvancedPattern";

export type AndroidPathRule = {
  mode: AndroidPathMode;
  value: string;
};

export type IntentFilterInput = {
  /** Preferred: one or more hosts (Android merges sibling `<data>` tags). */
  hosts?: string[];
  /** Back-compat single host; merged into `hosts` when provided. */
  host?: string;
  /** Defaults to `["http", "https"]`. */
  schemes?: string[];
  /** Back-compat single scheme; used when `schemes` is omitted. */
  scheme?: string;
  pathRules?: AndroidPathRule[];
  /** Activity android:name; default `.MainActivity`. */
  activityName?: string;
  /**
   * When true, wrap the intent-filter in an `<activity>`.
   * Default is false — emit bare `<intent-filter>` to paste as an
   * *additional* filter inside an existing activity.
   */
  wrapInActivity?: boolean;
};

const PATH_ATTR: Record<AndroidPathMode, string> = {
  path: "android:path",
  pathPrefix: "android:pathPrefix",
  pathPattern: "android:pathPattern",
  pathAdvancedPattern: "android:pathAdvancedPattern",
};

const DEFAULT_SCHEMES = ["http", "https"] as const;

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeHost(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .split("/")[0] ?? "";
}

function resolveHosts(input: IntentFilterInput): string[] {
  const fromList = (input.hosts ?? []).map(normalizeHost).filter(Boolean);
  const fromSingle = input.host ? normalizeHost(input.host) : "";
  const merged = [...fromList];
  if (fromSingle && !merged.includes(fromSingle)) {
    merged.push(fromSingle);
  }
  return merged;
}

function resolveSchemes(input: IntentFilterInput): string[] {
  if (input.schemes && input.schemes.length > 0) {
    return input.schemes
      .map((s) => s.trim().replace(/:$/, ""))
      .filter(Boolean);
  }
  if (input.scheme?.trim()) {
    return [input.scheme.trim().replace(/:$/, "")];
  }
  return [...DEFAULT_SCHEMES];
}

/**
 * Keep path rules that have a value, plus empty `path` (root → `android:path=""`).
 */
function resolvePathRules(rules: AndroidPathRule[] | undefined): AndroidPathRule[] {
  return (rules ?? [])
    .map((rule) => ({
      mode: rule.mode,
      value: rule.mode === "path" ? rule.value : rule.value.trim(),
    }))
    .filter((rule) => {
      if (rule.mode === "path") return true;
      return Boolean(rule.value.trim());
    })
    .map((rule) =>
      rule.mode === "path"
        ? { mode: rule.mode, value: rule.value.trim() }
        : rule,
    );
}

/**
 * Build an AndroidManifest intent-filter snippet for App Links.
 *
 * Emits separate `<data>` tags for schemes, hosts, and path rules (Android
 * merges sibling data elements). Optionally wraps in an `<activity>`.
 */
export function generateAndroidIntentFilter(
  input: IntentFilterInput,
): string {
  const hosts = resolveHosts(input);
  if (hosts.length === 0) return "";

  const schemes = resolveSchemes(input);
  const rules = resolvePathRules(input.pathRules);
  const wrapInActivity = input.wrapInActivity === true;
  const activityName = input.activityName?.trim() || ".MainActivity";

  const indent = wrapInActivity ? "        " : "  ";
  const dataIndent = wrapInActivity ? "            " : "    ";

  const dataLines: string[] = [];

  for (const scheme of schemes) {
    dataLines.push(
      `${dataIndent}<data android:scheme="${escapeXmlAttr(scheme)}"/>`,
    );
  }
  for (const host of hosts) {
    dataLines.push(
      `${dataIndent}<data android:host="${escapeXmlAttr(host)}"/>`,
    );
  }
  for (const rule of rules) {
    const attr = PATH_ATTR[rule.mode] ?? "android:path";
    dataLines.push(
      `${dataIndent}<data ${attr}="${escapeXmlAttr(rule.value)}" />`,
    );
  }

  const filterBody = `${indent}<intent-filter android:autoVerify="true">
${indent}  <action android:name="android.intent.action.VIEW"/>
${indent}  <category android:name="android.intent.category.DEFAULT"/>
${indent}  <category android:name="android.intent.category.BROWSABLE"/>
${dataLines.join("\n")}
${indent}</intent-filter>`;

  if (!wrapInActivity) {
    return `${filterBody}\n`;
  }

  return `<activity android:name="${escapeXmlAttr(activityName)}">
${filterBody}
</activity>
`;
}

export function stringifyIntentFilter(xml: string): string {
  return xml;
}
