export const DEFAULT_AASA_PATHS = ["*"] as const;

export type AasaPathRule = {
  /** Path pattern, e.g. `/products/*` or `*`. */
  pattern: string;
  /** When true, emits exclude component / `NOT ` legacy path. */
  exclude?: boolean;
};

/**
 * Full AASA component shape (Apple sample: `/`, `?`, `#`, exclude, comment).
 * Path is optional for fragment-only / query-only rules.
 */
export type AasaComponent = {
  "/"?: string;
  "?"?: Record<string, string>;
  "#"?: string;
  exclude?: true;
  comment?: string;
};

/** Editor / input form of a component (exclude is boolean). */
export type AasaComponentInput = {
  "/"?: string;
  "?"?: Record<string, string>;
  "#"?: string;
  exclude?: boolean;
  comment?: string;
};

export type AasaInput = {
  teamId: string;
  bundleId: string;
  /**
   * Preferred: structured components (path, per-component query, fragment,
   * exclude, comment). When provided and non-empty, used as the primary source.
   */
  components?: AasaComponentInput[];
  /**
   * Legacy-style path strings. Supports `NOT /foo` (or `NOT/foo`) for excludes.
   * Used when `components` and `pathRules` are omitted.
   */
  paths?: string[];
  /** Structured path rules. Used when `components` is omitted. */
  pathRules?: AasaPathRule[];
  /**
   * @deprecated Prefer per-component `"?"`. When `components` is set, ignored.
   * Otherwise applied to every include component from path rules (legacy).
   */
  query?: Record<string, string>;
  /** App IDs (`TEAMID.bundle.id`) for Associated Domains webcredentials. */
  webcredentialsApps?: string[];
  /** App IDs for App Clips. */
  appclipsApps?: string[];
};

export type AasaApplinksDetail = {
  appID: string;
  paths: string[];
  appIDs: string[];
  components: AasaComponent[];
};

export type AppleAppSiteAssociation = {
  applinks: {
    apps: string[];
    details: AasaApplinksDetail[];
  };
  webcredentials?: {
    apps: string[];
  };
  appclips?: {
    apps: string[];
  };
};

const DYNAMIC_VALUE =
  /^(?:\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{16,})$/i;

export function toAppId(teamId: string, bundleId: string): string {
  return `${teamId.trim()}.${bundleId.trim()}`;
}

function parsePathString(raw: string): AasaPathRule | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const notMatch = /^NOT\s+(.+)$/i.exec(trimmed);
  if (notMatch) {
    const pattern = notMatch[1].trim();
    return pattern ? { pattern, exclude: true } : null;
  }

  return { pattern: trimmed, exclude: false };
}

function resolvePathRules(input: AasaInput): AasaPathRule[] {
  if (input.pathRules && input.pathRules.length > 0) {
    return input.pathRules
      .map((rule) => ({
        pattern: rule.pattern.trim(),
        exclude: Boolean(rule.exclude),
      }))
      .filter((rule) => Boolean(rule.pattern));
  }

  const fromPaths = (input.paths ?? [...DEFAULT_AASA_PATHS])
    .map(parsePathString)
    .filter((rule): rule is AasaPathRule => rule !== null);

  return fromPaths.length > 0
    ? fromPaths
    : [{ pattern: DEFAULT_AASA_PATHS[0], exclude: false }];
}

function toLegacyPath(rule: AasaPathRule): string {
  return rule.exclude ? `NOT ${rule.pattern}` : rule.pattern;
}

function normalizeQuery(
  query: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!query) return undefined;
  const entries = Object.entries(query)
    .map(([k, v]) => [k.trim(), v] as const)
    .filter(([k]) => Boolean(k));
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function pathRuleToComponent(
  rule: AasaPathRule,
  query?: Record<string, string>,
): AasaComponent {
  const component: AasaComponent = { "/": rule.pattern };

  if (rule.exclude) {
    component.exclude = true;
  }

  if (!rule.exclude && query && Object.keys(query).length > 0) {
    component["?"] = { ...query };
  }

  return component;
}

/**
 * Normalize an input component for emission. Drops empty fields.
 * Returns null when the component has nothing useful.
 */
export function normalizeAasaComponent(
  input: AasaComponentInput,
): AasaComponent | null {
  const path = input["/"]?.trim();
  const fragment = input["#"]?.trim();
  const comment = input.comment?.trim();
  const query = normalizeQuery(input["?"]);
  const exclude = Boolean(input.exclude);

  if (!path && !fragment && !query) {
    return null;
  }

  const component: AasaComponent = {};

  if (path) {
    component["/"] = path;
  }
  if (query) {
    component["?"] = query;
  }
  if (fragment) {
    component["#"] = fragment;
  }
  if (exclude) {
    component.exclude = true;
  }
  if (comment) {
    component.comment = comment;
  }

  return component;
}

/**
 * Dual-write legacy `paths` from components that have a path (`"/"`).
 * Query-only / fragment-only rules are skipped (no sensible legacy path).
 */
export function componentsToLegacyPaths(components: AasaComponent[]): string[] {
  const paths: string[] = [];
  for (const c of components) {
    const path = c["/"]?.trim();
    if (!path) continue;
    paths.push(c.exclude ? `NOT ${path}` : path);
  }
  return paths;
}

function resolveComponents(input: AasaInput): AasaComponent[] {
  if (input.components && input.components.length > 0) {
    const normalized = input.components
      .map(normalizeAasaComponent)
      .filter((c): c is AasaComponent => c !== null);
    if (normalized.length > 0) return normalized;
  }

  const rules = resolvePathRules(input);
  const effectiveRules =
    rules.length > 0
      ? rules
      : [{ pattern: DEFAULT_AASA_PATHS[0], exclude: false }];

  const query = normalizeQuery(input.query);
  return effectiveRules.map((rule) => pathRuleToComponent(rule, query));
}

/**
 * Suggest a query value pattern: exact match, or `?*` for dynamic-looking values.
 */
export function suggestQueryValuePattern(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "?*";
  if (DYNAMIC_VALUE.test(trimmed)) return "?*";
  return trimmed;
}

export type SuggestComponentFromUrlInput = {
  /** Pathname from the URL (e.g. `/products/42`). */
  path: string;
  /** Suggested AASA path pattern (`/exact` or `/prefix/*`). */
  suggestedAasaPath?: string;
  /** Query params as key → value. */
  queryParams?: Record<string, string>;
  /** URL fragment without `#`. */
  fragment?: string;
};

/**
 * Build a suggested include component from a pasted URL
 * (path + per-key query patterns; optional fragment).
 */
export function suggestAasaComponentFromUrl(
  input: SuggestComponentFromUrlInput,
): AasaComponentInput {
  const path =
    input.suggestedAasaPath?.trim() ||
    input.path?.trim() ||
    DEFAULT_AASA_PATHS[0];

  const component: AasaComponentInput = {
    "/": path,
  };

  const params = input.queryParams ?? {};
  const queryEntries = Object.entries(params)
    .map(([k, v]) => [k.trim(), suggestQueryValuePattern(v)] as const)
    .filter(([k]) => Boolean(k));

  if (queryEntries.length > 0) {
    component["?"] = Object.fromEntries(queryEntries);
  }

  const fragment = input.fragment?.trim();
  if (fragment) {
    component["#"] = fragment;
  }

  return component;
}

export function defaultAasaComponents(): AasaComponentInput[] {
  return [{ "/": DEFAULT_AASA_PATHS[0] }];
}

/**
 * Build an Apple App Site Association document for Universal Links
 * (and optionally webcredentials / appclips).
 *
 * Dual-writes modern `appIDs` + `components` and legacy `appID` + `paths`.
 * Query matching is per-component — not one global query on all rules.
 */
export function generateAasa(input: AasaInput): AppleAppSiteAssociation | null {
  const teamId = input.teamId.trim();
  const bundleId = input.bundleId.trim();

  if (!teamId || !bundleId) {
    return null;
  }

  const appId = toAppId(teamId, bundleId);
  const components = resolveComponents(input);
  const legacyPaths = componentsToLegacyPaths(components);
  const paths =
    legacyPaths.length > 0 ? legacyPaths : [...DEFAULT_AASA_PATHS];

  const aasa: AppleAppSiteAssociation = {
    applinks: {
      apps: [],
      details: [
        {
          appID: appId,
          paths,
          appIDs: [appId],
          components,
        },
      ],
    },
  };

  const webApps = (input.webcredentialsApps ?? [])
    .map((id) => id.trim())
    .filter(Boolean);

  if (webApps.length > 0) {
    aasa.webcredentials = { apps: webApps };
  }

  const clipApps = (input.appclipsApps ?? [])
    .map((id) => id.trim())
    .filter(Boolean);

  if (clipApps.length > 0) {
    aasa.appclips = { apps: clipApps };
  }

  return aasa;
}

export function stringifyAasa(aasa: AppleAppSiteAssociation): string {
  return JSON.stringify(aasa, null, 2);
}
