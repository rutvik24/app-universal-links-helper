export type AndroidPathAttrMode = "path" | "pathPrefix";

export type SuggestedAndroidPathAttr = {
  mode: AndroidPathAttrMode;
  value: string;
};

export type ParsedTestUrl = {
  scheme: string;
  host: string;
  path: string;
  query: string;
  fragment: string;
  /** Suggested AASA path pattern (`/exact` or `/prefix/*`). */
  suggestedAasaPath: string;
  /** Suggested Android `<data>` path attribute. */
  suggestedAndroidPathAttr: SuggestedAndroidPathAttr;
  /** Query params as key → value (empty object when none). */
  queryParams: Record<string, string>;
};

const DYNAMIC_SEGMENT =
  /^(?:\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{16,})$/i;

function looksDynamic(segment: string): boolean {
  return DYNAMIC_SEGMENT.test(segment);
}

/**
 * Parse a pasted URL into domain/path suggestions for the form.
 * No network — uses the URL constructor only.
 */
export function parseTestUrl(raw: string): ParsedTestUrl | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (!url.hostname) return null;

  const path = url.pathname || "/";
  const query = url.search.startsWith("?") ? url.search.slice(1) : url.search;
  const fragment = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;

  const queryParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const { suggestedAasaPath, suggestedAndroidPathAttr } =
    suggestPathPatterns(path);

  return {
    scheme: url.protocol.replace(/:$/, "") || "https",
    host: url.hostname,
    path,
    query,
    fragment,
    suggestedAasaPath,
    suggestedAndroidPathAttr,
    queryParams,
  };
}

function suggestPathPatterns(pathname: string): {
  suggestedAasaPath: string;
  suggestedAndroidPathAttr: SuggestedAndroidPathAttr;
} {
  if (!pathname || pathname === "/") {
    return {
      suggestedAasaPath: "*",
      suggestedAndroidPathAttr: { mode: "pathPrefix", value: "/" },
    };
  }

  const normalized = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  const segments = normalized.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";

  if (segments.length >= 2 && looksDynamic(last)) {
    const prefix = `/${segments.slice(0, -1).join("/")}`;
    return {
      suggestedAasaPath: `${prefix}/*`,
      suggestedAndroidPathAttr: { mode: "pathPrefix", value: prefix },
    };
  }

  return {
    suggestedAasaPath: normalized,
    suggestedAndroidPathAttr: { mode: "path", value: normalized },
  };
}
