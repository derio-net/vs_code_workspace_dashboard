# desktop-build-pipeline Delta Spec

## Changes

### Modified: GitHub Actions workflow

#### Scenario: Linux system dependencies (MODIFIED)

- **WHEN** the workflow runs on `ubuntu-22.04`
- **THEN** it SHALL install Tauri 2.x system dependencies:
  - `libwebkit2gtk-4.1-dev` (not `4.0`)
  - `libjavascriptcoregtk-4.1-dev`
  - `libsoup-3.0-dev`
  - `libgtk-3-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`

### Modified: Code signing configuration

#### Scenario: Unsigned builds when secrets absent (MODIFIED)

- **WHEN** signing secrets (`APPLE_CERTIFICATE`, `WINDOWS_CERTIFICATE`) are not configured in the repository
- **THEN** the workflow SHALL NOT pass signing environment variables to `tauri-apps/tauri-action`
- **AND** the build SHALL complete successfully producing unsigned artifacts
- **AND** no signing-related errors SHALL occur

#### Scenario: macOS code signing (MODIFIED)

- **WHEN** the macOS build runs
- **AND** `APPLE_CERTIFICATE` secret is not configured
- **THEN** the `APPLE_*` environment variables SHALL be omitted from the build step
- **AND** unsigned `.dmg` and `.app` bundles SHALL be produced

#### Scenario: Signed builds when secrets present (UNCHANGED)

- **WHEN** signing secrets are properly configured
- **THEN** the existing signing behavior SHALL be preserved
- **AND** artifacts SHALL be signed and notarized as before

### New: Artifact version from git tag

#### Scenario: Version synced from tag (NEW)

- **WHEN** the workflow runs for a git tag
- **THEN** `tauri.conf.json`'s `version` field SHALL be patched to match the tag (minus `v` prefix)
- **AND** all generated artifacts SHALL embed the tag version in their filenames
- **AND** the repo's `tauri.conf.json` SHALL NOT be modified (CI-only patch)

### New: Platform labels in artifact names

#### Scenario: Artifact naming convention (MODIFIED)

- **WHEN** artifacts are generated
- **THEN** names SHALL follow the pattern: `VS.Code.Launchpad_{platform}_{version}_{arch}.{ext}`
- **AND** platform identifiers SHALL be: `macos`, `linux`, `windows`
- **AND** `.app.tar.gz` bundles SHALL include the version even though Tauri omits it by default

#### Scenario: Concurrent rename safety (NEW)

- **WHEN** multiple matrix jobs complete and run the rename step concurrently
- **THEN** each job SHALL only rename assets matching its platform's file extensions
- **AND** assets already renamed by another job SHALL be skipped
- **AND** no rename conflicts SHALL occur
