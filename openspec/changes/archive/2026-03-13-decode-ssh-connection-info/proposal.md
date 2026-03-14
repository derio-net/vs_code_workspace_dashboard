## Why

VS Code's newer SSH Remote extension encodes connection details as hex-encoded JSON blobs (e.g., `7b22686f73744e616d65223a22...7d` → `{"hostName":"server","user":"root"}`) instead of plain hostnames. The current `extractSSHHost()` function returns these hex strings verbatim, making the SSH Host column unreadable for newer workspaces. Additionally, the column name "SSH Host" undersells the information available — the JSON blob contains user, port, and other connection details worth surfacing.

## What Changes

- **BREAKING**: Rename the "SSH Host" column to "CONNECTION" across the UI (header, sort key, column visibility toggle, CSV export if applicable)
- Detect hex-encoded JSON host strings (start with `7b22`) and decode them to extract structured connection info
- Display decoded connection details in a human-readable format (e.g., `root@build-server-01:22`)
- Show a visible error indicator in the CONNECTION field when hex decoding or JSON parsing fails, instead of silently showing the raw hex string
- Retain plain hostname support for the old URI format (no change to existing readable hosts)

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `workspace-attributes-display`: The "SSH Host" column becomes "CONNECTION" with richer display format; error state added for decode failures
- `remote-attached-container-uri`: SSH host extraction must handle hex-encoded JSON blobs in addition to plain hostnames

## Impact

- **Frontend**: `src/utils/workspaceUtils.js` (extractSSHHost logic), `src/components/WorkspaceTable.js` (column header/rendering), `src/components/Dashboard.js` (sort key), column visibility state/storage
- **Tests**: `src/utils/workspaceUtils.test.js` (new test cases for hex decode, error handling), component tests referencing "SSH Host"
- **No backend changes**: The raw URI comes from VS Code's workspace.json — no server-side parsing changes needed
- **No API changes**: The workspace object schema is unchanged; decoding happens client-side
