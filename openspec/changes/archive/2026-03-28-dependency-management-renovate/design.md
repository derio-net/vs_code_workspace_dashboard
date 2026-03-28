## Technical Decisions

### Config format: `renovate.json` (not `.renovaterc` or `renovate.json5`)

Plain `renovate.json` at repo root. It's the most widely recognized format, works with all Renovate hosting modes, and gets auto-detected without any `extends` in `package.json`. No need for JSON5 comments — grouping rules are self-documenting via `groupName`.

### Delivery method: Renovate GitHub App (not self-hosted)

Use the free Mend Renovate GitHub App rather than self-hosting. The app runs on Mend's infrastructure, requires zero CI minutes, and handles rate limiting and scheduling automatically. Install via github.com/apps/renovate and enable for this repository.

### Two-speed update model: cool-off vs. fast-track

The core security design is a **two-speed model**:

1. **Regular updates — delayed.** All non-security version bumps are held for a `minimumReleaseAge` of 3 days. This lets the npm/crates.io community detect supply chain compromises, typosquats, or broken releases before we adopt them. Three days is the sweet spot: long enough for most malicious packages to be caught and yanked (the `ua-parser-js` hijack was detected in ~4 hours; `colors`/`faker` within a day), short enough to not fall meaningfully behind.

2. **Vulnerability remediation — immediate.** When a CVE or advisory is published against a dependency *we already use*, Renovate creates a PR with zero delay (bypasses `minimumReleaseAge`). This PR gets:
   - The `security` label for visibility in GitHub notifications and filters
   - Automerge enabled (when CI passes) — compromised versions should be replaced ASAP
   - A high-priority PR title prefix (`[SECURITY]`) so it stands out in the PR list

This inversion is deliberate: we're cautious about *new* code entering the project, but aggressive about removing *known-bad* code already in it.

### Grouping strategy

Groups balance two goals: minimize PR count and keep version-coupled packages in sync.

| Group | Packages | Ecosystem | Rationale |
|-------|----------|-----------|-----------|
| `tauri-js` | `@tauri-apps/api`, `@tauri-apps/plugin-*`, `@tauri-apps/cli` | npm | JS bindings must match the Rust Tauri version |
| `tauri-rust` | `tauri`, `tauri-build`, `tauri-plugin-*` | Cargo | Rust core + plugins have tight version coupling |
| `testing-library` | `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event` | npm | Test utility family; safe to move together |
| `serde` | `serde`, `serde_json` | Cargo | Serialization pair; always compatible |
| _ungrouped_ | `react`, `react-dom` | npm | React pair handled by Renovate's built-in React monorepo grouping |
| _ungrouped_ | `express`, `axios`, `fs-extra` | npm | Independent; separate PRs give clear bisection |
| _ungrouped_ | `@playwright/test` | npm | Playwright updates can break E2E; isolate for review |
| _ungrouped_ | `react-scripts`, `pkg`, `concurrently`, `supertest` | npm | Dev tools; separate PRs for clarity |
| _ungrouped_ | `tokio`, `reqwest`, `urlencoding`, `log` | Cargo | Independent Rust crates; separate PRs |

**Cross-ecosystem Tauri coupling**: The `tauri-js` and `tauri-rust` groups are deliberately kept as *separate* PRs despite their version coupling. Reason: Renovate cannot create a single PR spanning `package.json` + `Cargo.toml` within one group. Instead, we rely on CI catching mismatches — if the Rust Tauri version is updated without the matching JS version (or vice versa), the build will fail and block the PR. The developer then merges both PRs together.

### Automerge rules

| Condition | Automerge? | Why |
|-----------|------------|-----|
| `devDependencies` — patch or minor | Yes | Low risk; CI validates; reduces toil |
| `dependencies` — patch | No | Production code; manual review preferred |
| `dependencies` — minor or major | No | Could change behavior; needs review |
| Any — major | No | Breaking changes need human judgment |
| Vulnerability remediation (any level) | Yes | Known-bad code must be replaced immediately |
| Lock file maintenance | Yes | Transitive dep refresh; CI validates |

Automerge uses Renovate's `platformAutomerge: true` to leverage GitHub's native auto-merge (requires branch protection with required status checks). This means automerge only fires *after* CI passes.

### Schedule

- **Regular updates**: `"schedule": ["before 9am on Monday"]` — one batch per week, early Monday. Developers review fresh PRs at the start of the week.
- **Vulnerability alerts**: no schedule constraint — these run as soon as Renovate detects them (effectively real-time via GitHub Advisory Database).
- **Lock file maintenance**: `"schedule": ["before 9am on the first day of the month"]` — monthly, to keep transitive deps fresh without noise.

### PR behavior

- **Branch prefix**: `renovate/` (default) — keeps Renovate branches visually grouped.
- **PR labels**: `dependencies` on all PRs; additional `security` label on vulnerability remediation PRs.
- **Concurrent PR limit**: 5 open PRs max (`prConcurrentLimit: 5`) to avoid overwhelming the developer.
- **PR body**: include release notes and changelogs (`fetchReleaseNotes: true`, default behavior).
- **Rebase strategy**: Renovate rebases PRs when the base branch is updated (`rebaseWhen: "behind-base-branch"`).

### CI integration

No changes needed to existing workflows. The `test.yml` workflow already triggers on PRs to `main`:

```yaml
on:
  pull_request:
    branches: [main, develop]
```

Renovate PRs will target `main` and automatically run:
1. Unit & Integration Tests (frontend + server)
2. E2E Tests (Playwright, since it's a PR)

This provides full confidence before any automerge fires. If a Renovate PR breaks tests, it stays open for manual intervention.

### Developer notification flow

1. **Regular updates**: GitHub PR notification (standard). Developer reviews at their pace.
2. **Vulnerability PRs**: GitHub PR notification + `security` label + `[SECURITY]` title prefix. If automerge succeeds, the developer sees a merged PR in their notifications. If CI fails, the PR stays open with the security label — highly visible.
3. **No additional notification system** (Slack, email, etc.) — GitHub's built-in notifications are sufficient for a side project. The `security` label makes filtering easy.

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `renovate.json` | Create | Renovate configuration with all rules |
| `.github/workflows/test.yml` | No change | Already triggers on PRs to `main` |

## Alternatives Considered

- **Dependabot**: GitHub-native, but lacks `minimumReleaseAge` (no cool-off period), has weaker grouping, and doesn't support Cargo as flexibly. Renovate's security model is strictly more configurable.
- **Socket.dev**: Good for supply chain analysis but is a complementary tool, not a replacement for automated update PRs. Could be added later as a GitHub Action check on Renovate PRs.
- **Manual updates with `npm audit`**: Current approach. Reactive, easy to forget, no visibility into Cargo advisories. The proposal exists because this doesn't scale.
