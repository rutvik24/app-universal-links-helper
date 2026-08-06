export type TestCommandsInput = {
  /** Preferred multi-host list (first host / paste match used for domain). */
  hosts?: string[];
  /** Back-compat single domain. */
  domain?: string;
  /** Preferred multi-scheme list; first https wins for curl/open when present. */
  schemes?: string[];
  scheme?: string;
  /** Preferred open-URL target when the user pasted a full test URL. */
  pastedUrl?: string;
  packageName?: string;
  /** AASA / path patterns used to synthesize a sample URL when no paste. */
  pathPatterns?: string[];
  /**
   * Local path to AASA JSON for `swcutil verify -j`.
   * Default: `./apple-app-site-association`
   */
  aasaFilePath?: string;
};

export type TestCommand = {
  id: string;
  label: string;
  command: string;
};

function normalizeDomain(domain: string): string {
  return domain
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .split("/")[0] ?? "";
}

function resolveHosts(input: TestCommandsInput): string[] {
  const fromList = (input.hosts ?? [])
    .map(normalizeDomain)
    .filter(Boolean);
  const fromDomain = input.domain ? normalizeDomain(input.domain) : "";
  const merged = [...fromList];
  if (fromDomain && !merged.includes(fromDomain)) {
    merged.push(fromDomain);
  }
  return merged;
}

function resolveScheme(input: TestCommandsInput): string {
  const fromList = (input.schemes ?? [])
    .map((s) => s.trim().replace(/:$/, ""))
    .filter(Boolean);
  if (fromList.includes("https")) return "https";
  if (fromList.length > 0) return fromList[0];
  const single = input.scheme?.trim().replace(/:$/, "");
  return single || "https";
}

/**
 * Pick domain for curl / swcutil / open-URL synthesis:
 * host matching pasted URL if present in the list, else first host.
 */
function pickDomain(input: TestCommandsInput, hosts: string[]): string {
  const pasted = input.pastedUrl?.trim();
  if (pasted) {
    try {
      const withScheme = pasted.includes("://")
        ? pasted
        : `https://${pasted}`;
      const hostname = normalizeDomain(new URL(withScheme).hostname);
      if (hostname && hosts.includes(hostname)) return hostname;
      if (hostname) return hostname;
    } catch {
      // fall through
    }
  }
  return hosts[0] ?? "";
}

/**
 * Turn a path pattern into a concrete sample path (`*` → `sample`).
 */
export function synthesizeSamplePath(pattern: string): string {
  const trimmed = pattern.trim().replace(/^NOT\s+/i, "");
  if (!trimmed || trimmed === "*") return "/sample";

  let path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  path = path.replace(/\*+/g, "sample");
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path || "/sample";
}

function buildOpenUrl(
  input: TestCommandsInput,
  domain: string,
  scheme: string,
): string | null {
  const pasted = input.pastedUrl?.trim();
  if (pasted) {
    try {
      const withScheme = pasted.includes("://")
        ? pasted
        : `https://${pasted}`;
      // Validate
      new URL(withScheme);
      return withScheme;
    } catch {
      // fall through to synthesize
    }
  }

  if (!domain) return null;

  const patterns = (input.pathPatterns ?? []).map((p) => p.trim()).filter(Boolean);
  const samplePath = synthesizeSamplePath(patterns[0] ?? "*");
  return `${scheme}://${domain}${samplePath}`;
}

/**
 * Build adb / xcrun / curl / swcutil command strings from form state.
 */
export function generateTestCommands(
  input: TestCommandsInput,
): TestCommand[] {
  const commands: TestCommand[] = [];
  const hosts = resolveHosts(input);
  const scheme = resolveScheme(input);
  const domain = pickDomain(input, hosts);
  const openUrl = buildOpenUrl(input, domain, scheme);
  const packageName = input.packageName?.trim() ?? "";
  const aasaFilePath =
    input.aasaFilePath?.trim() || "./apple-app-site-association";

  if (openUrl) {
    const escaped = openUrl.replace(/"/g, '\\"');
    commands.push({
      id: "adb-am-start",
      label: "Android — open URL (adb)",
      command: `adb shell am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "${escaped}"`,
    });
    commands.push({
      id: "xcrun-openurl",
      label: "iOS Simulator — open URL",
      command: `xcrun simctl openurl booted "${escaped}"`,
    });
  }

  if (packageName) {
    commands.push({
      id: "adb-get-app-links",
      label: "Android — get app links",
      command: `adb shell pm get-app-links ${packageName}`,
    });
    commands.push({
      id: "adb-verify-app-links",
      label: "Android — re-verify app links",
      command: `adb shell pm verify-app-links --re-verify ${packageName}`,
    });
  }

  if (domain) {
    const base = `${scheme}://${domain}`;
    commands.push({
      id: "curl-assetlinks",
      label: "curl — assetlinks.json headers",
      command: `curl -I ${base}/.well-known/assetlinks.json`,
    });
    commands.push({
      id: "curl-aasa",
      label: "curl — apple-app-site-association headers",
      command: `curl -I ${base}/.well-known/apple-app-site-association`,
    });
  }

  if (domain && openUrl) {
    commands.push({
      id: "swcutil-verify",
      label: "iOS — swcutil verify AASA (device/host)",
      command: `sudo swcutil verify -d ${domain} -j ${aasaFilePath} -u ${openUrl}`,
    });
  }

  return commands;
}
