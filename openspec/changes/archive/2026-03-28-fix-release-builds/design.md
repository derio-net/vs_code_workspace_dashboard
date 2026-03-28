## Design Decisions

### D1: Linux — Replace Tauri 1.x system dependencies with Tauri 2.x equivalents

**Decision:** Update the `apt-get install` step on `ubuntu-22.04` to use the Tauri 2.x dependency set.

**Changes:**
- Remove `libwebkit2gtk-4.0-dev` (Tauri 1.x)
- Add `libwebkit2gtk-4.1-dev` (Tauri 2.x)
- Add `libjavascriptcoregtk-4.1-dev` (Tauri 2.x, required by `javascriptcore-rs-sys`)
- Add `libsoup-3.0-dev` (Tauri 2.x, required by `soup3-sys`)
- Keep `libgtk-3-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf` (still required)

**Rationale:** The project uses Tauri 2.10.0 (`src-tauri/Cargo.toml`). Tauri 2.x migrated from WebKit2GTK 4.0 / libsoup 2.4 to WebKit2GTK 4.1 / libsoup 3.0. The current dependency list was never updated from the Tauri 1.x migration.

**Reference:** Tauri 2.x prerequisites — https://v2.tauri.app/start/prerequisites/#linux

### D2: macOS — Conditionally apply code signing environment variables

**Decision:** Only pass `APPLE_*` environment variables to `tauri-apps/tauri-action` when the `APPLE_CERTIFICATE` secret is actually set. When absent, Tauri will produce unsigned `.dmg` and `.app` bundles.

**Implementation:**
```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE || '' }}
  APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD || '' }}
  APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY || '' }}
  APPLE_ID: ${{ secrets.APPLE_ID || '' }}
  APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD || '' }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID || '' }}
```

This doesn't work — `tauri-apps/tauri-action@v0` treats empty-string `APPLE_CERTIFICATE` the same as set, and still attempts certificate import which fails.

**Corrected approach:** Do NOT set `APPLE_*` env vars at all unless the secret exists. Use GitHub Actions' conditional expression:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  ${{ secrets.APPLE_CERTIFICATE && 'APPLE_CERTIFICATE' || '_UNUSED_APPLE_CERTIFICATE' }}: ${{ secrets.APPLE_CERTIFICATE }}
```

This is fragile. Instead, the cleanest approach for `tauri-apps/tauri-action` is:

**Final approach:** Remove the `APPLE_*` and `WINDOWS_*` env vars entirely from the workflow. Add them back only when real certificates are configured. The `tauri-apps/tauri-action` skips signing when these variables are absent, which is the desired behavior for unsigned builds.

A comment will be left in the workflow indicating where to re-add signing variables when certificates are available.

**Rationale:** The `APPLE_CERTIFICATE` secret is either unconfigured or contains invalid data (the `SecKeychainItemImport` error confirms the import receives bad input). Removing the env vars entirely lets all macOS builds produce unsigned artifacts. Windows already works without signing — it gracefully skips when `WINDOWS_CERTIFICATE` is empty.

**Trade-off:** Unsigned macOS builds will trigger Gatekeeper warnings for users. This is acceptable for a personal project / beta distribution. When signing is eventually needed, the env vars can be added back with valid secrets.

### D3: Updater plugin pubkey placeholder

**Decision:** Leave the updater config as-is for now. The placeholder `YOUR_UPDATER_SIGNATURE_PUBKEY_HERE` in `tauri.conf.json` does not cause build failures — it only affects the auto-update feature at runtime. This is out of scope for this change.

### D4: `update-release` job — no changes

**Decision:** Keep `update-release` requiring all builds to succeed (`needs: build`). A release should only be published when all platform artifacts are available.

### D5: Sync artifact version from git tag

**Decision:** Add a workflow step before `npm ci` that patches `tauri.conf.json`'s `version` field using the git tag (stripping the `v` prefix). Uses `jq` for reliable JSON manipulation.

**Rationale:** `tauri.conf.json` hardcodes `"version": "1.0.0"`. Tauri bakes this into all artifact filenames. Without patching, every release produces `_1.0.0_` artifacts regardless of the actual tag. The patch is CI-only — `tauri.conf.json` in the repo stays at `1.0.0`.

### D6: Add platform labels to release asset names

**Decision:** Add a post-build step that renames uploaded release assets via the GitHub API, inserting a platform label (`macos`, `linux`, `windows`) after the product name.

**Implementation evolution:**
1. First attempt used `artifactPaths` output from `tauri-action` — failed because `.app.tar.gz` bundles are auto-generated during upload and not listed in `artifactPaths`.
2. Second attempt queried `/releases/tags/{tag}` — failed because draft releases are not returned by that endpoint.
3. Third attempt used `jq | while IFS=$'\t' read` with bash `[[ ]]` globs — silent failure on Windows Git Bash due to subshell/IFS portability issues and `||`/`&&` operator precedence bug (`A || B && C` evaluates as `A || (B && C)`, not `(A || B) && C`).
4. **Final approach:** Query all releases to find draft by tag name, iterate assets by array index with `jq` extraction, use `grep`/`sed` for matching (POSIX-compatible across all platforms). Skip assets already renamed by another matrix job to handle parallel execution.

**Key lessons:**
- Draft releases require `/releases` listing, not `/releases/tags/{tag}`
- Tauri replaces spaces with dots in uploaded asset names (`VS Code Launchpad` → `VS.Code.Launchpad`)
- Bash `[[ ]]` and `IFS=$'\t'` are not portable to Windows Git Bash
- Multiple matrix jobs rename concurrently — must be idempotent

## Architecture

No architectural changes. This is purely CI/CD configuration.

### Files Modified

| File | Change |
|------|--------|
| `.github/workflows/release.yml` | Fix Linux deps, remove signing env vars, add version patch step, add asset rename step |

### Files NOT Modified

| File | Reason |
|------|--------|
| `src-tauri/tauri.conf.json` | Version patched dynamically in CI only; updater placeholder is a separate concern |
| `src-tauri/Cargo.toml` | No Rust dependency changes needed |
| Application code | No impact |
