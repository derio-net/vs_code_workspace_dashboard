# desktop-build-pipeline Specification

## Purpose
Define the automated build pipeline for creating cross-platform desktop application installers using GitHub Actions.

## Requirements

### Requirement: GitHub Actions workflow
The system SHALL use GitHub Actions for automated cross-platform builds triggered by version tags.

#### Scenario: Build triggers on version tag
- **WHEN** a git tag matching `v*` is pushed
- **THEN** the GitHub Actions workflow SHALL trigger
- **AND** builds SHALL run in parallel for macOS, Linux, and Windows

#### Scenario: Multi-platform build matrix
- **WHEN** the workflow runs
- **THEN** it SHALL execute on: `macos-latest`, `ubuntu-22.04`, and `windows-latest` runners
- **AND** each platform SHALL produce its native installer format

#### Scenario: Workflow uses Tauri Action
- **WHEN** the build job executes
- **THEN** it SHALL use `tauri-apps/tauri-action@v0` for building
- **AND** the action SHALL handle platform-specific build steps automatically

### Requirement: Build artifact generation
The system SHALL generate platform-specific installer artifacts for each target platform.

#### Scenario: macOS artifacts
- **WHEN** the macOS build completes
- **THEN** it SHALL produce: `.dmg` installer (x64, arm64), `.app` bundle
- **AND** universal binaries supporting both Intel and Apple Silicon SHALL be created

#### Scenario: Linux artifacts
- **WHEN** the Linux build completes
- **THEN** it SHALL produce: `.AppImage` (x64), `.deb` package (x64)
- **AND** the artifacts SHALL be compatible with Ubuntu 20.04+ and similar distributions

#### Scenario: Windows artifacts
- **WHEN** the Windows build completes
- **THEN** it SHALL produce: `.msi` installer (x64), `.exe` installer (x64)
- **AND** the installers SHALL support Windows 10 and Windows 11

#### Scenario: Artifact naming convention

- **WHEN** artifacts are generated
- **THEN** names SHALL follow the pattern: `VS.Code.Launchpad_{platform}_{version}_{arch}.{ext}`
- **AND** platform identifiers SHALL be: `macos`, `linux`, `windows`
- **AND** `.app.tar.gz` bundles SHALL include the version even though Tauri omits it by default

#### Scenario: Version synced from git tag

- **WHEN** the workflow runs for a git tag
- **THEN** `tauri.conf.json`'s `version` field SHALL be patched to match the tag (minus `v` prefix)
- **AND** all generated artifacts SHALL embed the tag version in their filenames
- **AND** the repo's `tauri.conf.json` SHALL NOT be modified (CI-only patch)

#### Scenario: Concurrent rename safety

- **WHEN** multiple matrix jobs complete and run the rename step concurrently
- **THEN** each job SHALL only rename assets matching its platform's file extensions
- **AND** assets already renamed by another job SHALL be skipped
- **AND** no rename conflicts SHALL occur

### Requirement: Code signing configuration
The system SHALL support code signing for macOS and Windows to prevent security warnings.

#### Scenario: macOS code signing

- **WHEN** the macOS build runs with signing secrets configured
- **THEN** the `.app` bundle and `.dmg` SHALL be signed with the Apple Developer ID
- **AND** the application SHALL be notarized for Gatekeeper compliance

#### Scenario: macOS unsigned builds

- **WHEN** the macOS build runs
- **AND** `APPLE_CERTIFICATE` secret is not configured
- **THEN** the `APPLE_*` environment variables SHALL be omitted from the build step
- **AND** unsigned `.dmg` and `.app` bundles SHALL be produced

#### Scenario: Windows code signing

- **WHEN** the Windows build runs with signing secrets configured
- **THEN** the `.msi` and `.exe` SHALL be signed with the Windows certificate
- **AND** SmartScreen warnings SHALL be minimized

#### Scenario: Unsigned builds when secrets absent
- **WHEN** signing secrets (`APPLE_CERTIFICATE`, `WINDOWS_CERTIFICATE`) are not configured in the repository
- **THEN** the workflow SHALL NOT pass signing environment variables to `tauri-apps/tauri-action`
- **AND** the build SHALL complete successfully producing unsigned artifacts
- **AND** no signing-related errors SHALL occur

### Requirement: Required secrets configuration
The system SHALL document all required secrets for the GitHub Actions workflow.

#### Scenario: macOS signing secrets
- **WHEN** configuring the repository secrets
- **THEN** the following SHALL be set: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`

#### Scenario: Windows signing secrets
- **WHEN** configuring the repository secrets
- **THEN** the following SHALL be set: `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD`
- **AND** Azure Trusted Signing credentials if using that service

#### Scenario: GitHub token
- **WHEN** the workflow runs
- **THEN** `GITHUB_TOKEN` SHALL be available automatically
- **AND** it SHALL be used for creating releases and uploading artifacts

### Requirement: Auto-updater configuration
The system SHALL implement Tauri's built-in auto-updater to notify users of new releases.

#### Scenario: Updater endpoint configuration
- **WHEN** the application is built
- **THEN** `tauri.conf.json` SHALL contain an updater configuration pointing to a JSON endpoint
- **AND** the endpoint URL SHALL be `https://api.github.com/repos/{owner}/{repo}/releases/latest`

#### Scenario: Update manifest format
- **WHEN** a new release is published
- **THEN** the update manifest SHALL include: version, release notes, publication date, and platform-specific download URLs with signatures

#### Scenario: Automatic update checks
- **WHEN** the application starts
- **THEN** it SHALL check for updates automatically
- **AND** if an update is available, a notification SHALL be shown to the user

#### Scenario: Manual update check
- **WHEN** the user selects "Check for Updates" from the menu
- **THEN** the system SHALL immediately check for updates
- **AND** display the result (up to date or update available) to the user

### Requirement: Release publishing
The system SHALL automatically create GitHub Releases with all build artifacts.

#### Scenario: Draft release creation
- **WHEN** the workflow completes successfully
- **THEN** a draft GitHub Release SHALL be created
- **AND** all platform artifacts SHALL be attached to the release

#### Scenario: Release notes generation
- **WHEN** the release is created
- **THEN** release notes SHALL be generated from the changelog
- **AND** the notes SHALL include the version number and list of changes

#### Scenario: Release publication
- **WHEN** the draft release is reviewed
- **THEN** it can be published manually
- **AND** once published, the auto-updater SHALL detect it for existing users

### Requirement: Build optimization
The system SHALL optimize build times and artifact sizes.

#### Scenario: Cache dependencies
- **WHEN** the workflow runs
- **THEN** Rust dependencies SHALL be cached between builds
- **AND** Node.js dependencies SHALL be cached

#### Scenario: Artifact size optimization
- **WHEN** the application is built
- **THEN** the final installer size SHALL be under 10MB
- **AND** this SHALL be achieved by using `pkg` with Node 18 and stripping debug symbols

### Requirement: Pre-release builds
The system SHALL support pre-release builds for testing before official releases.

#### Scenario: Beta tag handling
- **WHEN** a tag matching `v*-beta.*` is pushed
- **THEN** the workflow SHALL create a pre-release
- **AND** the auto-updater SHALL not prompt users to install pre-releases by default

#### Scenario: Nightly builds (optional)
- **WHEN** configured for nightly builds
- **THEN** a scheduled workflow SHALL build from the main branch daily
- **AND** artifacts SHALL be uploaded as a special nightly release
