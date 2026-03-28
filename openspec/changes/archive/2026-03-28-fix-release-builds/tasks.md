# Tasks

## T1: Fix Linux system dependencies

- [x] In `.github/workflows/release.yml`, replace the Ubuntu `apt-get install` line:
  - Remove `libwebkit2gtk-4.0-dev`
  - Add `libwebkit2gtk-4.1-dev`
  - Add `libjavascriptcoregtk-4.1-dev`
  - Add `libsoup-3.0-dev`
- [x] Verify the full dependency list matches Tauri 2.x prerequisites

## T2: Make macOS code signing optional

- [x] Remove `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` env vars from the `Build Tauri app` step
- [x] Remove `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD` env vars (Windows works without them; keeping them is misleading)
- [x] Add a YAML comment block indicating where to re-add signing env vars when certificates are configured
- [x] Keep only `GITHUB_TOKEN` in the env block

## T3: Sync artifact version from git tag

- [x] Add "Set version from git tag" step that patches `tauri.conf.json` using `jq` before build
- [x] Strip `v` prefix from tag name (e.g., `v0.1.8` → `0.1.8`)

## T4: Add platform labels to artifact names

- [x] Add "Rename release assets with platform label" step after `tauri-apps/tauri-action`
- [x] Query draft releases via `/releases` listing (not `/releases/tags/` which excludes drafts)
- [x] Iterate assets by array index with `jq`/`grep`/`sed` (POSIX-compatible, works on Windows Git Bash)
- [x] Insert platform label (`macos`, `linux`, `windows`) after product name in each asset
- [x] Add version to `.app.tar.gz` files that Tauri omits it from
- [x] Skip assets already renamed by another concurrent matrix job

## T5: Validate changes

- [x] Review the complete modified workflow for correctness
- [x] Push test tags to verify all 4 targets build successfully
- [x] Verify artifact names include correct version and platform (v0.1.8 — all 9 assets correct)
