## Why

Dependencies in this project span two ecosystems — npm (15 packages: React, Express, Tauri JS bindings, testing tools) and Cargo (13 crates: Tauri core, plugins, serde, tokio, reqwest). Today, updates are manual: there is no automated process to detect outdated or vulnerable dependencies, open PRs, or validate updates against the existing CI pipeline. This creates risk of falling behind on security patches and accumulating painful multi-version upgrade debt.

Renovate provides automated dependency update PRs with fine-grained control over grouping, scheduling, and automerge — and natively supports both npm and Cargo ecosystems in a single config.

## What Changes

- **Add Renovate configuration** (`renovate.json` at repo root) to enable the Renovate GitHub App for this repository.
- **Group related packages** to reduce PR noise:
  - `@tauri-apps/*` npm packages grouped together (API + plugins + CLI move in lockstep)
  - `@testing-library/*` grouped together
  - `@playwright/test` as a standalone update (Playwright updates can break E2E tests)
  - Tauri Cargo crates (`tauri`, `tauri-build`, `tauri-plugin-*`) grouped together
  - Serde crates (`serde`, `serde_json`) grouped together
- **Automerge policy**: automerge patch and minor updates for dev dependencies (testing, build tools) when CI passes. Production dependencies and major updates always require manual review.
- **Schedule**: run dependency checks weekly (e.g., early Monday) to batch updates rather than creating PRs on every publish.
- **Stability cool-off period**: delay proposing new versions by a configurable window (e.g., 3 days) after publication. This avoids adopting compromised or yanked releases that get caught in the first hours/days after publish (supply chain attacks like `event-stream`, `ua-parser-js`, `colors`). Renovate's `minimumReleaseAge` enforces this — a version must survive in the registry for N days before Renovate will propose it.
- **Vulnerability detection and auto-remediation**: enable Renovate's `vulnerabilityAlerts` so that known-compromised versions *already in use* are flagged immediately — no cool-off delay for security patches. These PRs should be automerged when CI passes and the developer notified via GitHub notification and PR label (e.g., `security`). This inverts the cool-off logic: new versions wait, but fixes for compromised versions we already depend on are fast-tracked.
- **CI integration**: Renovate PRs target `main` branch and trigger the existing `test.yml` workflow (unit + E2E tests), providing confidence before merge.
- **Lock file maintenance**: schedule periodic `package-lock.json` refresh PRs to keep transitive dependencies current.
- **Rust toolchain**: pin `rust-version` in `Cargo.toml` and let Renovate propose Rust edition/MSRV bumps as separate PRs.

## Capabilities

- **renovate-configuration** — The Renovate config file, package grouping rules, automerge policies, scheduling, and stability cool-off period.
- **supply-chain-security** — Vulnerability detection for incorporated dependencies, auto-remediation of compromised versions, and developer notification.
- **ci-renovate-integration** — How Renovate PRs interact with existing GitHub Actions workflows and any CI adjustments needed.

## Impact

- **CI/CD**: Renovate PRs will exercise `test.yml` (unit + E2E). No changes to existing workflows are needed — they already trigger on PRs to `main`.
- **Developer workflow**: Developers will see automated PRs for dependency updates. Automerged patches reduce toil; major updates surface for review.
- **No runtime changes**: This is purely a CI/repo-config change — no application code is modified.

## Out of Scope

- Migrating away from `react-scripts` or `pkg` (those are separate changes)
- Upgrading Node.js version in CI (separate concern, though Renovate could later manage the `.node-version` file)
- Adding Dependabot (Renovate is the chosen tool — they serve the same purpose)
- Renovate self-hosted runner setup (using the GitHub App, not self-hosted)
