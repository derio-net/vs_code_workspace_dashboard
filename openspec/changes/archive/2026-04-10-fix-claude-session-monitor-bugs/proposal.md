## Why

The Claude session monitor feature shipped with several bugs: the production Tauri build shows a black screen due to `public/index.html` accumulating duplicate script tags across builds, the Claude column intermittently disappears because `hookConfigured` is only read once at mount time, the tray menu mislabels idle sessions as "waiting", and the hook configuration check is weaker than designed (only validates `Notification` hook, not all three required hooks).

## What Changes

- **Fix `public/index.html` build corruption**: Restore a clean CRA template and prevent the build feedback loop where `react-scripts build` output is copied back into `public/`, causing script/CSS tags to accumulate with each build
- **Fix Claude column visibility**: Sync `visibleColumns.claude` with the `hookConfigured` prop via `useEffect` instead of relying solely on `useState` initial value, which is only evaluated once on mount
- **Fix tray session count mislabeling**: Compute separate working/waiting/idle counts in `tray.rs` instead of grouping all non-working sessions as "waiting"
- **Strengthen hook configuration check**: Require all three hooks (Notification, UserPromptSubmit, Stop) in `checkHookConfigured()` as the design specified, not just Notification
- **Fix test descriptions and coverage**: Update `getAggregateState` test names to match current state names (working/waiting/idle) and add missing all-idle test case

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `desktop-build-pipeline`: Fix the build script feedback loop that corrupts `public/index.html` with duplicate script/CSS tags across repeated builds
- `claude-session-detection`: Strengthen hook configuration check to require all three hook types (Notification, UserPromptSubmit, Stop)
- `claude-session-dashboard`: Fix Claude column visibility sync with `hookConfigured` prop
- `status-menu`: Fix tray summary to show correct working/waiting/idle counts instead of mislabeling idle as "waiting"

## Impact

- **Build pipeline** (`package.json` build script, `public/index.html`): Core fix — without this the production build is unusable (black screen)
- **Backend** (`server/claudeSessionScanner.js`): Hook config check tightened — users with only partial hook setup will now correctly see the feature as disabled
- **Frontend** (`src/components/WorkspaceTable.js`): Claude column visibility becomes reactive to prop changes
- **Tray** (`src-tauri/src/tray.rs`): Session count computation and labels corrected
- **Tests** (`src/hooks/__tests__/useClaudeSessions.test.js`, `server/__tests__/claudeSessionScanner.test.js`): Test descriptions and coverage updated
