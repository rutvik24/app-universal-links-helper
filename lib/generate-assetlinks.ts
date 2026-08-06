export const DEFAULT_ASSETLINKS_NAMESPACE = "android_app";
export const DEFAULT_ASSETLINKS_RELATION =
  "delegate_permission/common.handle_all_urls";
export const LOGIN_CREDS_RELATION =
  "delegate_permission/common.get_login_creds";

export const ASSETLINKS_RELATION_OPTIONS = [
  DEFAULT_ASSETLINKS_RELATION,
  LOGIN_CREDS_RELATION,
] as const;

export type AssetLinksInput = {
  packageName: string;
  sha256Fingerprints: string[];
  namespace?: string;
  /** @deprecated Prefer `relations`. Still accepted for single-relation callers. */
  relation?: string;
  /** One or more Digital Asset Links relations. */
  relations?: string[];
  /** Optional `{ include: "https://…" }` statement appended when set. */
  includeUrl?: string;
};

export type AssetLinksStatement = {
  relation: string[];
  target: {
    namespace: string;
    package_name: string;
    sha256_cert_fingerprints: string[];
  };
};

export type AssetLinksInclude = {
  include: string;
};

export type AssetLinksEntry = AssetLinksStatement | AssetLinksInclude;

function resolveRelations(input: AssetLinksInput): string[] {
  if (input.relations && input.relations.length > 0) {
    const unique = [
      ...new Set(
        input.relations.map((r) => r.trim()).filter(Boolean),
      ),
    ];
    return unique.length > 0 ? unique : [DEFAULT_ASSETLINKS_RELATION];
  }

  const single = input.relation?.trim();
  return [single || DEFAULT_ASSETLINKS_RELATION];
}

/**
 * Build a Digital Asset Links statement array for Android App Links.
 * Returns an empty array when package/fingerprints are incomplete and no include URL is set.
 */
export function generateAssetLinks(input: AssetLinksInput): AssetLinksEntry[] {
  const packageName = input.packageName.trim();
  const fingerprints = input.sha256Fingerprints
    .map((fp) => fp.trim())
    .filter(Boolean);
  const namespace =
    input.namespace?.trim() || DEFAULT_ASSETLINKS_NAMESPACE;
  const relations = resolveRelations(input);
  const includeUrl = input.includeUrl?.trim() ?? "";

  const entries: AssetLinksEntry[] = [];

  if (packageName && fingerprints.length > 0) {
    entries.push({
      relation: relations,
      target: {
        namespace,
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    });
  }

  if (includeUrl) {
    entries.push({ include: includeUrl });
  }

  return entries;
}

export function stringifyAssetLinks(statements: AssetLinksEntry[]): string {
  return JSON.stringify(statements, null, 2);
}
