# Implementation Tasks

## Prerequisites (manual, not code)

- [x] Install the Mend Renovate GitHub App on the `vscode-launchpad` repository (github.com/apps/renovate → install → select repo)
- [x] Enable "Allow auto-merge" in GitHub repository settings (Settings → General → Pull Requests → Allow auto-merge)
- [x] Configure branch protection on `main`: require status check `Unit & Integration Tests` to pass before merging

## Configuration

- [x] Create `renovate.json` at repo root with:
  - Base config extending `"config:recommended"`
  - `minimumReleaseAge: "3 days"` for all dependencies
  - `schedule: ["before 9am on Monday"]` for regular updates
  - `prConcurrentLimit: 5`
  - `rebaseWhen: "behind-base-branch"`
  - `platformAutomerge: true`
  - `labels: ["dependencies"]`

- [x] Add package grouping rules to `renovate.json`:
  - `tauri-js` group: `@tauri-apps/*` npm packages
  - `tauri-rust` group: `tauri`, `tauri-build`, `tauri-plugin-*` Cargo crates
  - `testing-library` group: `@testing-library/*` npm packages
  - `serde` group: `serde`, `serde_json` Cargo crates

- [x] Add automerge rules to `renovate.json`:
  - `devDependencies` patch/minor: automerge enabled
  - `dependencies` (all levels): automerge disabled (default)
  - Major updates (all): automerge disabled
  - Lock file maintenance: automerge enabled, monthly schedule (`"before 9am on the first day of the month"`)

- [x] Add vulnerability alert configuration to `renovate.json`:
  - `vulnerabilityAlerts` enabled with:
    - `labels: ["dependencies", "security"]`
    - `automerge: true`
    - `schedule: ["at any time"]` (bypass weekly schedule)
    - `commitMessagePrefix: "[SECURITY]"`
    - `minimumReleaseAge` set to `"0 days"` (bypass cool-off)

## Validation

- [x] Validate `renovate.json` syntax (run Renovate config validator or use the Renovate JSON schema)
- [x] Verify `test.yml` already triggers on PRs to `main` (confirm no changes needed)
- [x] Document the Renovate setup in the project README or CONTRIBUTING.md (brief section on how dependency updates work)
