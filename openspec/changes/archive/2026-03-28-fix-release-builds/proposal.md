## Why

The release workflow (`release.yml`) fails on 3 of 4 platform targets when triggered by version tags. Only the Windows build succeeds. The CI cannot produce release artifacts for macOS or Linux, blocking all releases.

## Root Causes

### 1. Linux (ubuntu-22.04): Missing `libsoup-3.0` system dependency

**Error:** `The system library libsoup-3.0 required by crate soup3-sys was not found.`

The Tauri 2.x Rust build requires `libsoup-3.0-dev` for HTTP functionality, but the workflow only installs:
```
libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```
This dependency list is based on Tauri 1.x. Tauri 2.x switched from `libsoup-2.4` to `libsoup-3.0` and also requires `libwebkit2gtk-4.1-dev` (not `4.0`).

**Fix:** Update the `apt-get install` list to include the Tauri 2.x dependencies:
- Add `libsoup-3.0-dev`
- Replace `libwebkit2gtk-4.0-dev` with `libwebkit2gtk-4.1-dev`
- Add `libjavascriptcoregtk-4.1-dev` (Tauri 2.x requirement)

### 2. macOS (both aarch64 and x86_64): Code signing certificate import failure

**Error:** `security: SecKeychainItemImport: One or more parameters passed to a function were not valid.`
→ `failed to import keychain certificate`

The `tauri-apps/tauri-action@v0` attempts to import an Apple code signing certificate from the `APPLE_CERTIFICATE` secret. This fails because:
- The secrets are likely not configured (empty/placeholder), OR
- The certificate format is invalid for the `security import` command on the macOS runner.

Since this is a personal/open-source project, code signing is not strictly required for development releases.

**Mitigation options (choose one):**
- **Option A (recommended for now):** Disable macOS code signing by not passing the `APPLE_*` environment variables when secrets are empty, and configure Tauri to allow unsigned builds.
- **Option B:** Generate a self-signed certificate and store it in GitHub Secrets.
- **Option C:** Enroll in Apple Developer Program and configure real signing credentials.

### 3. Windows: Currently succeeds ✅

Windows builds pass because it doesn't require code signing by default (the `WINDOWS_CERTIFICATE` secret being empty doesn't cause a failure — Windows only signs if a certificate is provided).

### 4. `update-release` job behavior

The `update-release` job requires all build matrix jobs to succeed. This is correct — a release should only be published when all targets build successfully.

### 5. Artifact versioning hardcoded to 1.0.0

All release artifacts (`.dmg`, `.deb`, `.exe`, etc.) embed the version from `tauri.conf.json` which is hardcoded to `1.0.0`. The CI never patches it from the git tag, so every release produces identically-versioned artifacts regardless of the actual tag.

### 6. Artifact names lack platform identification

Tauri's default naming scheme uses only arch and extension (e.g., `VS.Code.Launchpad_0.1.3_aarch64.dmg`). Without a platform label, it's ambiguous which OS an artifact targets — especially for `.app.tar.gz` bundles.

## What Changes

- **Fix Linux system dependencies** in the release workflow to match Tauri 2.x requirements.
- **Make macOS code signing optional** so unsigned builds can still produce .dmg artifacts for distribution.
- **Sync artifact version from git tag** by patching `tauri.conf.json` before each build.
- **Add platform labels to artifact names** (`macos`, `linux`, `windows`) via a post-upload rename step.

## Capabilities

### New Capabilities
_None — all changes modify CI/CD configuration._

### Modified Capabilities
- `desktop-build-pipeline`: Linux dependencies updated for Tauri 2.x; macOS code signing made optional; artifact version synced from git tag; artifact names include platform labels.

## Impact

- **`.github/workflows/release.yml`**: Linux dependency list, signing env vars removed, version patching step added, asset rename step added.
- **`src-tauri/tauri.conf.json`**: Version patched dynamically in CI (not committed). Updater placeholder left as-is (separate concern).
- **No application code changes** — this is purely CI/CD and build configuration.
