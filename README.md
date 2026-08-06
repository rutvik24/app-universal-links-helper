# App Links Helper

Generate **Android** Digital Asset Links (`assetlinks.json`), **iOS** Universal Links (`apple-app-site-association`), and an **AndroidManifest** intent-filter snippet in the browser. Preview, copy, or download — then host verification files on your own domain under `/.well-known/`.

Pair with [`firebase-email-link-host`](../firebase-email-link-host) for a branded Firebase email-link continue URL on App Hosting.

## Features

- **Hosts + schemes** — multi-line hosts and `http` / `https` checkboxes (both on by default); shared by Manifest XML, curl checks, and open-URL test commands
- **Paste test URL** — merges the host into the list (without wiping others), enables the URL scheme, **appends** a suggested AASA component (path + per-key query patterns) and Android path rule, and drives adb / xcrun open-URL commands
- **assetlinks.json** — multi-relation (`handle_all_urls`, `get_login_creds`), multiple fingerprints, optional `{ "include": "…" }` statement
- **apple-app-site-association** — full per-component editor (`/`, `?`, `#`, `exclude`, `comment`); dual-writes modern `appIDs` + `components` and legacy `appID` + `paths`; optional `webcredentials` / `appclips`
- **Android Manifest** — bare `autoVerify` `<intent-filter>` (no wrapping activity by default) with **separate** `<data>` tags for schemes, hosts, and path rules (`path`, `pathPrefix`, `pathPattern`, `pathAdvancedPattern`). Empty `path` emits `android:path=""` (site root). Android merges sibling `<data>` elements. AASA-style query globs are an iOS concern — not modeled on `<data>` tags.
- **Testing commands** — `adb shell am start`, `pm get-app-links` / `verify-app-links`, `xcrun simctl openurl`, `curl -I` for well-known files, and `sudo swcutil verify` for AASA path/URL checks on macOS

> Dynamic App Links `relation_extensions` are not edited here; add them manually if needed.

## Manifest multi-host style

Copy this `<intent-filter>` into your existing `<activity>` as an **additional** intent-filter. Keep your main/launcher intent-filter unchanged.

Generated intent-filters look like:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <data android:scheme="http"/>
  <data android:scheme="https"/>
  <data android:host="www.example.com"/>
  <data android:host="staging.example.com"/>
  <data android:pathPrefix="/view-ticket" />
  <data android:pathPattern="/order/.*" />
  <data android:path="" />
</intent-filter>
```

Do not combine scheme + host + path on a single `<data>` tag — the OS merges siblings.

## swcutil verify (iOS)

When at least one host and an open URL are available, the testing panel includes:

```bash
sudo swcutil verify -d www.example.com -j ./apple-app-site-association -u https://www.example.com/view-ticket
```

- Requires **macOS** with Apple developer / Shared Web Credentials tooling (`swcutil`)
- `-j` defaults to `./apple-app-site-association` — point it at the JSON file you downloaded locally
- `-d` / `-u` are filled from your hosts list (or pasted URL)

## Local development

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Load sample data** to fill the form with a full multi-host / path / AASA example. No env vars are required for local use.

## Static export

```bash
bun run build
```

Output is written to `out/`.

### Base path for GitHub Pages

For project pages (`https://<user>.github.io/<repo>/`):

```bash
NEXT_PUBLIC_BASE_PATH=/app-links-helper bun run build
```

When unset, `basePath` / `assetPrefix` stay empty so local `next dev` stays root-relative.

## Deploy to GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main` (or run **Deploy GitHub Pages** via Actions → workflow_dispatch)
3. Workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):
   - `bun install --frozen-lockfile`
   - `bun run build` with `NEXT_PUBLIC_BASE_PATH=/<repo-name>`
   - Deploys `out/` with `actions/deploy-pages`
4. Site URL: `https://<user>.github.io/<repo>/`

Ensure the repo has **Pages** write permission for Actions (default with the workflow’s `pages: write` + `id-token: write`).

## What this tool does not do

- Upload verification files to your Firebase/Cloudflare account
- Validate live domains
- Serve `assetlinks` / AASA for third-party apps
- Run `swcutil` in the browser (copy the command and run it locally on macOS)
