## Context

The dashboard currently uses `stats.mtime` of `workspace.json` as the "Last Modified" timestamp. This rarely changes because VS Code only writes to `workspace.json` when workspace metadata changes — not when the user opens or works in a workspace. The workspace storage *directory* access time (`atime`) is a much better proxy for "last used," since VS Code touches the directory when opening a workspace.

## Goals / Non-Goals

**Goals:**
- Replace `lastModified` (mtime) with `lastAccessed` (atime) across the full stack
- Make "Last Accessed" the default sort in the dashboard table
- Make the tray menu show the 5 most recently accessed workspaces
- Clean rename throughout: field name, column label, sort keys, Rust struct

**Non-Goals:**
- Adding "Last Modified" as a separate/additional column
- Changing how workspace discovery works (only the timestamp source changes)
- Adding relative time labels to tray menu items

## Decisions

### 1. Use `atime` of the storage directory, not `workspace.json`
The storage directory (e.g., `workspaceStorage/<hash>/`) is touched by VS Code when opening a workspace. We'll `fs.stat()` the storage directory itself and use `stats.atime` instead of statting `workspace.json` and using `stats.mtime`.

### 2. Rename the API field from `lastModified` to `lastAccessed`
This is a breaking API change, but since the only consumers are our own frontend and the Rust tray code, it's safe. A clean rename avoids confusion about what the field actually represents.

### 3. Keep the same ISO 8601 string format
The value will still be an ISO 8601 date string (`.toISOString()`). No format changes needed in consumers — only the field name and data source change.

### 4. Update all layers atomically
Since backend, frontend, and Rust tray all reference the field name, all must be updated together. This is a coordinated rename across:
- `server/workspaceScanner.js` — data source + field name
- `src/components/WorkspaceTable.js` — column definition + rendering
- `src/components/Dashboard.js` — default sort config + sort logic
- `src-tauri/src/tray.rs` — struct field + serde rename + sort logic
- All corresponding test files

## Risks / Trade-offs

### `atime` reliability across platforms and filesystems
Some filesystems mount with `noatime` or `relatime`, which may cause `atime` not to update on every access. On macOS (HFS+/APFS) and Windows (NTFS), `atime` is updated by default. On Linux, `relatime` is common (updates atime only if older than mtime), which is still good enough for our use case — it just means the resolution may be ~1 day rather than exact. This is acceptable since we only need relative ordering of "recently used" workspaces.

### Breaking API change
The field rename from `lastModified` to `lastAccessed` will break any external consumers of `GET /api/workspaces`. Since this is a desktop app with no known external API consumers, the risk is negligible.
