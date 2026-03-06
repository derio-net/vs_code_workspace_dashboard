## Context

The dashboard displays VS Code workspaces in a table with an SSH Host column. Currently, `extractSSHHost` only returns a value for `ssh-remote` type workspaces. Attached containers running on remote SSH hosts encode the host in a compound URI:

```
vscode-remote://attached-container%2B<json-hex>@ssh-remote%2B<host>/<path>
```

The `@ssh-remote%2B<host>` segment is ignored by both `extractSSHHost` and `extractWorkspacePath`, leaving the SSH Host column blank and the Path column showing the raw hex blob.

Both `Dashboard.js` and `WorkspaceTable.js` contain duplicated copies of these functions.

## Goals / Non-Goals

**Goals:**
- Extract and display SSH host from remotely-attached container URIs
- Extract clean filesystem path from these URIs
- Fix both duplicated copies of the extraction functions

**Non-Goals:**
- Consolidating the duplicated functions into a shared module (separate concern)
- Parsing the JSON-encoded container metadata (container name, docker socket)
- Changing the type classification in `workspaceScanner.js` (attached-container is correct)

## Decisions

**1. Parse `@ssh-remote%2B` from the URI authority for any workspace type**

Rather than adding `type === 'attached-container'` as another branch, match `@ssh-remote%2B([^/]+)` against the path regardless of type. This is forward-compatible — any future workspace type that tunnels through SSH will automatically work.

Alternative considered: Type-specific branching (`if type === 'attached-container'`). Rejected because the pattern `@ssh-remote%2B` is unambiguous on its own and doesn't need type gating.

**2. Extract path as everything after `@ssh-remote%2B<host>`**

For the `extractWorkspacePath` function, when the URI contains `@ssh-remote%2B`, match the path segment after the host: `@ssh-remote%2B[^/]+(/.*)$`. This takes precedence over the existing `+<hex>/<path>` pattern for containers.

**3. Apply changes to both duplicated locations**

Update both `Dashboard.js:extractSSHHost` and `WorkspaceTable.js:extractSSHHost` (and corresponding `extractWorkspacePath`) identically. The duplication is a pre-existing issue outside this change's scope.

## Risks / Trade-offs

- [Regex may not cover all edge cases] → The `@ssh-remote%2B` pattern is well-defined by VS Code's URI scheme; unlikely to vary.
- [Duplicated code remains] → Accepted. Consolidation is a separate concern and out of scope.
