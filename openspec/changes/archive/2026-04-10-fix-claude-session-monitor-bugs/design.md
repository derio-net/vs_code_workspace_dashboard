## Context

The Claude session monitor feature was recently shipped (commit e6c77d4). Post-installation testing revealed 5 bugs of varying severity. The most critical is a black screen in production builds caused by a build pipeline feedback loop predating this feature. The remaining bugs are in the session monitor implementation itself.

Current state of each bug:
1. **Black screen**: `public/index.html` has 12 `<script>` tags loading 7 different React bundles. Each `npm run build` appends new tags because the CRA template and build output share the same file.
2. **Claude column hidden**: `WorkspaceTable.js` initializes `visibleColumns.claude` from `hookConfigured` prop via `useState`, which only evaluates once on mount. If the API hasn't responded when the component mounts, the column stays hidden forever.
3. **Tray mislabels counts**: `tray.rs:465` computes `total_idle` as all non-working sessions, then labels them "waiting" in the summary.
4. **Weak hook check**: `claudeSessionScanner.js:48` only checks for `Notification` hook, not all three required hooks.
5. **Test issues**: `getAggregateState` tests use old state names and lack an all-idle case.

## Goals / Non-Goals

**Goals:**
- Fix the production black screen so `npm run tauri:build:full` produces a working app
- Make the Claude column reliably appear when `hookConfigured` becomes true
- Show correct session state counts in the tray menu
- Require all three hooks as designed before enabling the feature
- Clean up test descriptions and add missing coverage

**Non-Goals:**
- Restructuring the build pipeline to use a separate template directory (fix the symptom, not redesign)
- Adding a UI indicator for "hooks partially configured"
- Changing the polling interval or API design

## Decisions

### D1: Fix build corruption by restoring clean template and preventing re-accumulation

**Decision**: Restore `public/index.html` to a clean CRA template (no injected script/CSS tags). The existing build script (`rm -rf public/static public/index.html && cp -r build/* public/`) already handles cleanup correctly — the accumulation happened because the corrupted file was committed to git. After restoring the clean template, `npm run build` will work correctly: it reads the clean template, injects one set of tags into `build/index.html`, then copies that to `public/`. The next build starts from the same clean template again because `rm -rf public/index.html` removes the previous output before copying.

**Also**: Clean up stale JS/CSS bundles from `public/static/` that accumulated from previous builds.

**Rationale**: The build script's `rm -rf` already prevents re-accumulation in a single session. The bug was that the corrupted output was committed, becoming the new "template". Restoring the clean template is sufficient.

### D2: Sync Claude column visibility with hookConfigured prop via useEffect

**Decision**: Add a `useEffect` in `WorkspaceTable` that updates `visibleColumns.claude` when `hookConfigured` changes from `false` to `true`. Only auto-show — never auto-hide (respect manual column toggle).

```js
useEffect(() => {
  if (hookConfigured) {
    setVisibleColumns(prev => ({ ...prev, claude: true }));
  }
}, [hookConfigured]);
```

**Rationale**: `useState` initial values are evaluated once. Since `hookConfigured` starts as `false` (API hasn't responded yet) and becomes `true` asynchronously, we need a `useEffect` to react to the change. Only auto-showing (not auto-hiding) preserves user intent if they manually toggled the column.

### D3: Fix tray session counts — compute three separate counts

**Decision**: In `refresh_tray()` in `tray.rs`, compute three separate counts:
```rust
let total_working = live_sessions.iter().filter(|s| s.state == "working").count();
let total_waiting = live_sessions.iter().filter(|s| s.state == "waiting").count();
let total_idle = live_sessions.iter().filter(|s| s.state == "idle").count();
```

Update `build_menu` signature and summary label to use all three counts correctly.

**Rationale**: The current code conflates idle+waiting into a single count labeled "waiting". The design specified three distinct counts.

### D4: Check all three hooks in checkHookConfigured

**Decision**: Change `checkHookConfigured()` to require `Notification` AND at least one of `UserPromptSubmit`/`Stop` hooks. Checking for all three would be ideal but `UserPromptSubmit` and `Stop` could reasonably be added later. Requiring at least `Notification` + one other ensures meaningful state coverage.

Actually, to match the original design exactly: require all three.

```js
return hasHook('Notification') && hasHook('UserPromptSubmit') && hasHook('Stop');
```

**Rationale**: Without `UserPromptSubmit`, sessions never show "working". Without `Stop`, sessions never return to "idle" after working. The feature is misleading with only partial hooks.

### D5: Fix test names and add missing coverage

**Decision**: Rename test descriptions to use current state names and add an all-idle test case for `getAggregateState`.

**Rationale**: Cosmetic but important for maintainability. Misleading test names cause confusion when tests fail.

## Risks / Trade-offs

**[Existing users with partial hook config]** → Users who only configured the `Notification` hook will see the Claude feature disappear after this fix. Mitigation: README already documents all three hooks. This is the correct behavior — partial hooks produce misleading state.

**[Build output in git]** → `public/index.html` being both a CRA template and committed build output is fragile. This fix restores it but doesn't restructure the pattern. Mitigation: The `rm -rf` in the build script prevents local re-accumulation. A future change could separate template from output.
