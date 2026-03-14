## Why

The "Last Modified" column uses `mtime` of the `workspace.json` file, which rarely changes — it only updates when VS Code modifies workspace metadata, not when the user actually opens a workspace. This makes the sort order essentially meaningless for finding recently-used workspaces. Switching to the storage directory's access time (`atime`) provides a much better signal for "last used," making the default sort and tray menu immediately useful.

## What Changes

- **BREAKING**: Replace the `lastModified` field with `lastAccessed` throughout the entire stack (backend API, frontend table, Rust tray menu)
- Rename the dashboard table column from "Last Modified" to "Last Accessed"
- Change the data source from `stats.mtime` of `workspace.json` to `stats.atime` of the workspace storage directory
- Change the default sort order to use `lastAccessed` (descending) — most recently accessed first
- Change the tray/status menu to sort the 5 displayed workspaces by `lastAccessed` instead of `lastModified`

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `basic-view-dashboard`: Column renamed from "Last Modified" to "Last Accessed"; default sort key changes from `lastModified` to `lastAccessed`; API response field renamed
- `status-menu`: Tray menu workspace ordering changes from "most recently modified" to "most recently accessed"
- `integration-workspace-discovery`: Scanner returns `lastAccessed` (atime of storage dir) instead of `lastModified` (mtime of workspace.json)

## Impact

- **Backend API** (`server/workspaceScanner.js`): Change `stats.mtime` → `stats.atime`, stat the storage directory instead of workspace.json, rename field to `lastAccessed`
- **REST API response** (`GET /api/workspaces`): Field name changes from `lastModified` to `lastAccessed` — this is a breaking API change
- **Frontend** (`src/components/WorkspaceTable.js`, `src/components/Dashboard.js`): Column definition, sort config, and rendering all reference the new field name
- **Rust tray** (`src-tauri/src/tray.rs`): `TrayWorkspace` struct field rename, serde rename, sort logic update
- **Tests**: All test files referencing `lastModified` need updating (frontend unit tests, server tests, Rust tests)
