## 1. Backend — Workspace Scanner

- [x] 1.1 In `server/workspaceScanner.js`: change `fs.stat(workspaceJsonPath)` to `fs.stat(workspaceDir)` to stat the storage directory itself
- [x] 1.2 In `parseWorkspaceData()`: change `lastModified: stats.mtime.toISOString()` to `lastAccessed: stats.atime.toISOString()`
- [x] 1.3 Update `server/__tests__/api.test.js`: rename all `lastModified` references to `lastAccessed` in mock data and assertions

## 2. Frontend — Dashboard & Table

- [x] 2.1 In `src/components/WorkspaceTable.js`: rename column definition from `{ key: 'lastModified', label: 'Last Modified' }` to `{ key: 'lastAccessed', label: 'Last Accessed' }`
- [x] 2.2 In `src/components/WorkspaceTable.js`: update all `visibleColumns.lastModified` references to `visibleColumns.lastAccessed`, and update `columnWidths.lastModified`, `handleHeaderClick('lastModified')`, `handleResizeStart(…, 'lastModified')`, `getSortIndicator('lastModified')`, and `formatDate(workspace.lastModified)` to use `lastAccessed`
- [x] 2.3 In `src/components/Dashboard.js`: change default `sortConfig` from `{ key: 'lastModified', direction: 'desc' }` to `{ key: 'lastAccessed', direction: 'desc' }`
- [x] 2.4 In `src/components/Dashboard.js`: update the sort comparison that checks `sortConfig.key === 'lastModified'` to check `'lastAccessed'`
- [x] 2.5 Update frontend tests: rename `lastModified` → `lastAccessed` in `src/__tests__/components/WorkspaceTable.test.jsx`, `src/__tests__/components/Dashboard.test.jsx`, and `src/__tests__/App.test.jsx`

## 3. Rust Tray Menu

- [x] 3.1 In `src-tauri/src/tray.rs`: rename `TrayWorkspace.last_modified` field to `last_accessed`, update serde rename from `"lastModified"` to `"lastAccessed"`
- [x] 3.2 In `src-tauri/src/tray.rs`: update sort logic `b.last_modified.cmp(&a.last_modified)` → `b.last_accessed.cmp(&a.last_accessed)`
- [x] 3.3 In `src-tauri/src/tray.rs`: update all test fixtures and assertions to use `lastAccessed` / `last_accessed`

## 4. Verification

- [x] 4.1 Run server tests: `npm run test:server`
- [x] 4.2 Run frontend tests: `npm test`
- [x] 4.3 Run Rust build check: `cd src-tauri && cargo check`
