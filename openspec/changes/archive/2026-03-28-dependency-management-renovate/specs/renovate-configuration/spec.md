# renovate-configuration Specification

## Purpose
Define the Renovate configuration file structure, package grouping rules, automerge policies, scheduling, and stability cool-off period for automated dependency management across npm and Cargo ecosystems.

## Requirements

### Requirement: Configuration file
The repository SHALL have a `renovate.json` file at the root that the Renovate GitHub App auto-detects.

#### Scenario: Base config extends recommended preset
- **WHEN** Renovate runs against this repository
- **THEN** the configuration SHALL extend `"config:recommended"` as the base preset
- **AND** project-specific overrides SHALL be applied on top

#### Scenario: Config applies to both ecosystems
- **WHEN** Renovate scans the repository
- **THEN** it SHALL detect and manage `package.json` (npm) dependencies
- **AND** it SHALL detect and manage `src-tauri/Cargo.toml` (Cargo) dependencies

### Requirement: Stability cool-off period
New dependency versions SHALL NOT be proposed until they have survived a minimum age in the registry, protecting against supply chain attacks on freshly published versions.

#### Scenario: Regular updates are delayed by 3 days
- **WHEN** a new version of any dependency is published to npm or crates.io
- **THEN** Renovate SHALL NOT propose that version for at least 3 days (`minimumReleaseAge: "3 days"`)
- **AND** the version SHALL only appear in a PR after the cool-off window expires

#### Scenario: Vulnerability remediation bypasses cool-off
- **WHEN** a security advisory is published for a dependency already in use
- **THEN** the remediation PR SHALL be created immediately
- **AND** `minimumReleaseAge` SHALL NOT delay the security fix

### Requirement: Package grouping
Related packages SHALL be grouped into single PRs to reduce noise and keep version-coupled packages in sync.

#### Scenario: Tauri npm packages grouped
- **WHEN** updates are available for any `@tauri-apps/*` npm packages
- **THEN** they SHALL be combined into a single PR
- **AND** the PR SHALL have `groupName: "tauri-js"`

#### Scenario: Tauri Cargo crates grouped
- **WHEN** updates are available for `tauri`, `tauri-build`, or any `tauri-plugin-*` Cargo crate
- **THEN** they SHALL be combined into a single PR
- **AND** the PR SHALL have `groupName: "tauri-rust"`

#### Scenario: Testing Library packages grouped
- **WHEN** updates are available for any `@testing-library/*` npm packages
- **THEN** they SHALL be combined into a single PR
- **AND** the PR SHALL have `groupName: "testing-library"`

#### Scenario: Serde crates grouped
- **WHEN** updates are available for `serde` or `serde_json` Cargo crates
- **THEN** they SHALL be combined into a single PR
- **AND** the PR SHALL have `groupName: "serde"`

#### Scenario: Independent packages get separate PRs
- **WHEN** updates are available for packages not in any group (e.g., `express`, `axios`, `@playwright/test`, `tokio`)
- **THEN** each package SHALL get its own PR
- **AND** this enables clear bisection when an update causes a regression

### Requirement: Automerge policy
Low-risk dependency updates SHALL be automerged after CI passes to reduce developer toil.

#### Scenario: Dev dependency patch and minor updates automerge
- **WHEN** a `devDependencies` package has a patch or minor update available
- **AND** the cool-off period has elapsed
- **AND** all CI checks pass on the PR
- **THEN** the PR SHALL be automerged via GitHub's native auto-merge

#### Scenario: Production dependency updates require review
- **WHEN** a `dependencies` package has any update available (patch, minor, or major)
- **THEN** the PR SHALL NOT be automerged
- **AND** a developer SHALL manually review and merge

#### Scenario: Major updates always require review
- **WHEN** any package (dev or prod) has a major version update
- **THEN** the PR SHALL NOT be automerged regardless of dependency type

#### Scenario: Platform automerge via branch protection
- **WHEN** automerge is configured
- **THEN** it SHALL use `platformAutomerge: true` (GitHub native auto-merge)
- **AND** this requires branch protection rules with required status checks on `main`

### Requirement: Schedule
Dependency update checks SHALL follow a defined schedule to batch updates and reduce noise.

#### Scenario: Weekly schedule for regular updates
- **WHEN** the Renovate schedule runs
- **THEN** regular dependency checks SHALL execute `"before 9am on Monday"`
- **AND** PRs for the week's updates SHALL be created or rebased in that window

#### Scenario: Monthly lock file maintenance
- **WHEN** the lock file maintenance schedule runs
- **THEN** a `package-lock.json` refresh PR SHALL be created `"before 9am on the first day of the month"`
- **AND** this PR SHALL be automerged when CI passes

#### Scenario: Vulnerability alerts are unscheduled
- **WHEN** a vulnerability advisory is detected for a dependency in use
- **THEN** the remediation PR SHALL be created immediately regardless of schedule

### Requirement: PR behavior
Renovate PRs SHALL follow consistent conventions for labeling, limiting, and rebasing.

#### Scenario: PR labeling
- **WHEN** Renovate creates a dependency update PR
- **THEN** the PR SHALL have the label `dependencies`

#### Scenario: Concurrent PR limit
- **WHEN** Renovate creates PRs
- **THEN** no more than 5 PRs SHALL be open simultaneously (`prConcurrentLimit: 5`)

#### Scenario: Rebase on base branch update
- **WHEN** the `main` branch receives new commits
- **THEN** open Renovate PRs SHALL be rebased automatically (`rebaseWhen: "behind-base-branch"`)

#### Scenario: Branch naming
- **WHEN** Renovate creates a branch for an update
- **THEN** the branch SHALL use the `renovate/` prefix
