# ci-renovate-integration Specification

## Purpose
Define how Renovate PRs interact with the existing GitHub Actions CI workflows and what branch protection rules are required for automerge to function.

## Requirements

### Requirement: CI validation of Renovate PRs
All Renovate PRs SHALL trigger the existing CI pipeline to validate dependency updates before merge.

#### Scenario: Unit and integration tests run on Renovate PRs
- **WHEN** Renovate creates a PR targeting `main`
- **THEN** the `test.yml` workflow SHALL trigger automatically
- **AND** the `unit-tests` job SHALL run (frontend + server tests)
- **AND** no changes to the workflow file SHALL be required (it already triggers on PRs to `main`)

#### Scenario: E2E tests run on Renovate PRs
- **WHEN** Renovate creates a PR targeting `main`
- **THEN** the `e2e-tests` job SHALL run (since `github.event_name == 'pull_request'`)
- **AND** Playwright tests SHALL validate that dependency updates don't break user workflows
- **AND** no changes to the workflow file SHALL be required

#### Scenario: CI failure blocks automerge
- **WHEN** a Renovate PR has automerge enabled (dev dependency or vulnerability fix)
- **AND** any CI job fails
- **THEN** GitHub's native auto-merge SHALL NOT merge the PR
- **AND** the PR SHALL remain open for manual investigation

### Requirement: Branch protection for automerge
GitHub branch protection rules on `main` SHALL be configured to enforce CI checks, enabling safe automerge.

#### Scenario: Required status checks on main
- **WHEN** branch protection is configured for `main`
- **THEN** the following status checks SHALL be required before merge:
  - `Unit & Integration Tests` (from `test.yml`)
- **AND** `Require status checks to pass before merging` SHALL be enabled

#### Scenario: Auto-merge allowed on main
- **WHEN** branch protection is configured for `main`
- **THEN** `Allow auto-merge` SHALL be enabled in the repository settings
- **AND** this allows Renovate's `platformAutomerge: true` to function

#### Scenario: No additional CI workflows needed
- **WHEN** evaluating CI changes for Renovate integration
- **THEN** no new workflow files SHALL be created
- **AND** no modifications to `test.yml` or `release.yml` SHALL be required
- **AND** the existing CI pipeline provides sufficient validation coverage

### Requirement: Renovate GitHub App permissions
The Renovate GitHub App SHALL have appropriate permissions to create branches, PRs, and trigger CI.

#### Scenario: App installation scope
- **WHEN** the Renovate GitHub App is installed
- **THEN** it SHALL be scoped to the `vscode-launchpad` repository (not org-wide)
- **AND** it SHALL have permissions to: read repo contents, create branches, create PRs, read CI status

#### Scenario: Renovate branches trigger CI
- **WHEN** Renovate creates a branch with prefix `renovate/`
- **THEN** the `test.yml` workflow SHALL trigger on the PR
- **AND** branch protection rules SHALL NOT exclude `renovate/` branches from required checks
