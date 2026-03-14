## 1. Core decoding logic

- [x] 1.1 Add `decodeHexHost(hexString)` helper in `src/utils/workspaceUtils.js` — hex-decode, JSON-parse, return `{ hostName, user, port }` or throw on failure
- [x] 1.2 Add `formatConnectionInfo({ hostName, user, port })` helper — returns `user@host:port` string with graceful omission of absent fields
- [x] 1.3 Refactor `extractSSHHost()` → `extractConnectionInfo()` — detect hex prefix `7b22`, decode via helper, format result; return `{ display, error, raw }` object. On decode failure set `display` to `⚠ decode error` and `raw` to the original hex string
- [x] 1.4 Keep `extractSSHHost` as a deprecated alias that returns `extractConnectionInfo(ws).display` for backward compat

## 2. Column rename (SSH Host → CONNECTION)

- [x] 2.1 Update `AVAILABLE_COLUMNS` in `WorkspaceTable.js` — change key from `sshHost` to `connection`, label from `SSH Host` to `CONNECTION`
- [x] 2.2 Update default column visibility map — `sshHost: true` → `connection: true`
- [x] 2.3 Update column header rendering — CSS class `workspace-ssh-host` → `workspace-connection`, header text, sort key, resize handle key
- [x] 2.4 Update `Dashboard.js` sort logic — `sortConfig.key === 'sshHost'` → `'connection'`
- [x] 2.5 Update `WorkspaceTable.css` — rename `.workspace-ssh-host` to `.workspace-connection`
- [x] 2.6 Add localStorage migration for saved column visibility: map `sshHost` → `connection` on load

## 3. Cell rendering

- [x] 3.1 Update CONNECTION cell in `WorkspaceTable.js` — call `extractConnectionInfo(workspace)`, render `display` value, set `title` to `raw` (for tooltip on error/hex cases)
- [x] 3.2 Style error state — add CSS for error indicator text (e.g., muted color or warning style for `⚠ decode error`)

## 4. Tests

- [x] 4.1 Unit tests for `decodeHexHost` — valid JSON hex, invalid hex, incomplete hex, non-JSON hex
- [x] 4.2 Unit tests for `formatConnectionInfo` — all field combinations (host only, host+user, host+user+port, host+port)
- [x] 4.3 Unit tests for `extractConnectionInfo` — hex-encoded host, plain hostname, decode failure, attached-container with hex host, empty/local workspace
- [x] 4.4 Update `WorkspaceTable.test.jsx` — assert "CONNECTION" column header instead of "SSH Host"
- [x] 4.5 Verify existing `extractWorkspacePath` tests still pass (PATH column unchanged)
