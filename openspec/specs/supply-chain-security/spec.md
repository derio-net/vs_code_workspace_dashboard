# supply-chain-security Specification

## Purpose
Define how the system detects compromised dependencies already in use, auto-remediates them, and notifies the developer — operating on a fast-track path that bypasses the normal cool-off period.

## Requirements

### Requirement: Vulnerability detection
Renovate SHALL continuously monitor dependencies in use against known vulnerability databases and create remediation PRs immediately upon detection.

#### Scenario: Known vulnerability detected in npm dependency
- **WHEN** a CVE or GitHub Security Advisory (GHSA) is published for an npm package version present in `package.json` or `package-lock.json`
- **THEN** Renovate SHALL create a PR upgrading to the nearest safe version
- **AND** the PR SHALL be created immediately, bypassing `minimumReleaseAge`
- **AND** the PR SHALL bypass the weekly schedule constraint

#### Scenario: Known vulnerability detected in Cargo dependency
- **WHEN** a RustSec advisory is published for a Cargo crate version present in `Cargo.toml` or `Cargo.lock`
- **THEN** Renovate SHALL create a PR upgrading to the nearest safe version
- **AND** the PR SHALL be created immediately, bypassing `minimumReleaseAge`

#### Scenario: Transitive dependency vulnerability
- **WHEN** a vulnerability is found in a transitive dependency (not directly listed in `package.json` or `Cargo.toml`)
- **THEN** Renovate SHALL create a lock file update PR that pulls in the fixed transitive version
- **AND** this SHALL be treated as a vulnerability remediation (immediate, no cool-off)

### Requirement: Auto-remediation
Vulnerability remediation PRs SHALL be automerged when CI passes, minimizing the window of exposure to known-compromised code.

#### Scenario: Vulnerability PR automerges on CI success
- **WHEN** a vulnerability remediation PR is created
- **AND** all CI status checks pass (unit tests, E2E tests)
- **THEN** the PR SHALL be automerged via GitHub's native auto-merge
- **AND** no manual review SHALL be required

#### Scenario: Vulnerability PR stays open on CI failure
- **WHEN** a vulnerability remediation PR is created
- **AND** CI status checks fail
- **THEN** the PR SHALL remain open for manual intervention
- **AND** the `security` label SHALL ensure visibility

#### Scenario: Vulnerability automerge overrides normal automerge rules
- **WHEN** a vulnerability is found in a production `dependencies` package
- **THEN** the remediation PR SHALL still be automerged (unlike normal production dependency updates which require review)
- **AND** this override applies to patch, minor, and major version bumps if they are the fix version

### Requirement: Developer notification
The developer SHALL be notified of vulnerability detections through GitHub's existing notification channels with clear visual signals.

#### Scenario: Security label applied to vulnerability PRs
- **WHEN** Renovate creates a vulnerability remediation PR
- **THEN** the PR SHALL have the label `security` in addition to `dependencies`
- **AND** the label SHALL be filterable in GitHub's PR list and notification settings

#### Scenario: Security prefix in PR title
- **WHEN** Renovate creates a vulnerability remediation PR
- **THEN** the PR title SHALL include a `[SECURITY]` prefix
- **AND** this SHALL visually distinguish it from regular dependency update PRs in the PR list and email notifications

#### Scenario: Successful automerge notification
- **WHEN** a vulnerability remediation PR is automerged
- **THEN** the developer SHALL receive a GitHub notification for the merged PR
- **AND** the notification SHALL show the `security` label and `[SECURITY]` prefix
- **AND** no additional notification system (Slack, email webhook) SHALL be required

#### Scenario: Failed CI notification
- **WHEN** a vulnerability remediation PR fails CI
- **THEN** the PR SHALL remain open with the `security` label
- **AND** the developer SHALL receive GitHub's standard PR notification
- **AND** the failed CI status SHALL be visible on the PR, prompting manual investigation
