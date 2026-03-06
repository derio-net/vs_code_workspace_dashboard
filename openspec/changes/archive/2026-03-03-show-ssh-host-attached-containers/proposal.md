## Why

Attached containers running on remote SSH hosts show no SSH host information in the dashboard. The URI format `vscode-remote://attached-container%2B<json>@ssh-remote%2B<host>/<path>` embeds the SSH host name after `@ssh-remote%2B`, but `extractSSHHost` only handles the `ssh-remote` workspace type — leaving the SSH Host column blank for attached containers running remotely.

## What Changes

- Extend `extractSSHHost` to parse SSH host from attached-container URIs that include `@ssh-remote%2B<host>` in the authority section
- Update `extractCleanPath` to correctly extract the filesystem path from these compound URIs (currently only matches the `+<hex>/path` pattern, which fails for the `@ssh-remote` variant)
- Ensure the SSH Host column displays the host for remotely-attached containers (e.g., `dev-server-01`)

## Capabilities

### New Capabilities

- `remote-attached-container-uri`: Parsing and display of SSH host and clean path from attached-container URIs running on remote SSH hosts (`attached-container%2B<json>@ssh-remote%2B<host>/<path>`)

### Modified Capabilities

_(none — the existing `extractSSHHost` and `extractCleanPath` functions are implementation details, not spec-level capabilities)_

## Impact

- `src/components/Dashboard.js` — `extractSSHHost` function
- `src/components/WorkspaceTable.js` — duplicated `extractSSHHost` and `extractCleanPath` functions
- No API or dependency changes; display-only change
