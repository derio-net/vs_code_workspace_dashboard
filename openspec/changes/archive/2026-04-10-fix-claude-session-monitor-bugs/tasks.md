## 1. Fix Build Corruption (Critical)

- [x] 1.1 Restore `public/index.html` to a clean CRA template with no injected script/CSS tags
- [x] 1.2 Remove stale JS/CSS bundles from `public/static/` (accumulated from previous builds)
- [x] 1.3 Run `npm run build` and verify the output `public/index.html` contains exactly one script and one CSS tag

## 2. Fix Claude Column Visibility

- [x] 2.1 Add `useEffect` in `WorkspaceTable.js` to sync `visibleColumns.claude` when `hookConfigured` changes to `true` (auto-show only, never auto-hide)
- [x] 2.2 Update frontend test to verify Claude column becomes visible when `hookConfigured` transitions from false to true

## 3. Fix Tray Session Count Labels

- [x] 3.1 In `tray.rs` `refresh_tray()`: compute separate `total_working`, `total_waiting`, `total_idle` counts instead of lumping non-working as idle
- [x] 3.2 Update `build_menu` signature and the summary label to display all three counts correctly
- [x] 3.3 Update `build_menu` call sites to pass the corrected counts

## 4. Strengthen Hook Configuration Check

- [x] 4.1 Change `checkHookConfigured()` in `claudeSessionScanner.js` to require all three hooks: `Notification`, `UserPromptSubmit`, and `Stop`
- [x] 4.2 Update `checkHookConfigured` tests: add cases for partial hook config (only Notification) returning false, and all-three returning true

## 5. Fix Test Descriptions and Coverage

- [x] 5.1 Rename `getAggregateState` test descriptions to use current state names (working/waiting/idle instead of active/idle)
- [x] 5.2 Add missing test case: `getAggregateState` with all-idle sessions returns `'idle'`

## 6. Verification

- [x] 6.1 Run all server tests (`npm run test:server`) and verify they pass
- [x] 6.2 Run all frontend tests (`npm test`) and verify they pass
- [x] 6.3 Run `npm run build` and confirm clean `public/index.html` output
