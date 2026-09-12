import type { AasaComponentInput } from "@/lib/generate-aasa";
import type { AndroidPathRule } from "@/lib/generate-android-intent-filter";

const ANDROID_PATH_EXAMPLES: AndroidPathRule[] = [
  { mode: "path", value: "" },
  { mode: "path", value: "/view-ticket" },
  { mode: "pathPrefix", value: "/event" },
  { mode: "pathPattern", value: "/order/.*" },
  { mode: "pathPattern", value: "/event/.*" },
  { mode: "pathAdvancedPattern", value: "/products/[0-9]+" },
];

const AASA_COMPONENT_EXAMPLES: AasaComponentInput[] = [
  {
    "/": "/",
    "?": { "*": "*" },
    comment: "Matches the root URL with any query parameters.",
  },
  {
    "/": "/",
    "?": { id: "???" },
    comment: "Root URL with id query parameter of exactly 3 characters.",
  },
  {
    "/": "/*",
    "?": { "*": "*" },
    comment: "Matches any URL with any query parameters.",
  },
  {
    "/": "/view-ticket",
    comment: "Matches /view-ticket with no query parameters.",
  },
  {
    "/": "/buy/*",
    comment: "Matches any URL whose path starts with /buy/.",
  },
  {
    "/": "/help/website/*",
    exclude: true,
    comment: "Exclude paths under /help/website/ from Universal Links.",
  },
  {
    "/": "/help/*",
    "?": { articleNumber: "????" },
    comment:
      "Paths under /help/ with articleNumber query of exactly four characters.",
  },
  {
    "#": "no_universal_links",
    exclude: true,
    comment: "Exclude any URL whose fragment equals no_universal_links.",
  },
];

export type SampleFormData = {
  hostsText: string;
  schemeHttp: boolean;
  schemeHttps: boolean;
  pasteUrl: string;
  packageName: string;
  fingerprints: string;
  namespace: string;
  relationHandleAll: boolean;
  relationLoginCreds: boolean;
  includeUrl: string;
  androidPathRules: AndroidPathRule[];
  activityName: string;
  wrapInActivity: boolean;
  teamId: string;
  bundleId: string;
  aasaComponents: AasaComponentInput[];
  webcredentialsApps: string;
  appclipsApps: string;
};

/**
 * Full in-browser sample for “Load sample data” — fills form fields.
 */
export function getSampleFormData(): SampleFormData {
  const teamId = "ABCDE12345";
  const bundleId = "com.example.app";
  const appId = `${teamId}.${bundleId}`;

  return {
    hostsText: [
      "www.example.com",
      "app.example.com",
      "develop.example.com",
      "staging.example.com",
    ].join("\n"),
    schemeHttp: true,
    schemeHttps: true,
    pasteUrl: "https://www.example.com/view-ticket",
    packageName: "com.example.app",
    fingerprints:
      "14:6D:E9:83:C5:73:06:50:56:EE:B9:95:2F:45:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5",
    namespace: "android_app",
    relationHandleAll: true,
    relationLoginCreds: false,
    includeUrl: "",
    androidPathRules: ANDROID_PATH_EXAMPLES.map((r) => ({ ...r })),
    activityName: ".MainActivity",
    wrapInActivity: false,
    teamId,
    bundleId,
    aasaComponents: AASA_COMPONENT_EXAMPLES.map((c) => ({
      ...c,
      "?": c["?"] ? { ...c["?"] } : undefined,
    })),
    webcredentialsApps: appId,
    appclipsApps: "",
  };
}
