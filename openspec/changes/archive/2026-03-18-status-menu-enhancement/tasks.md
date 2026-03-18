## 1. Type Emoji Prefix

- [x] 1.1 Add a `type_emoji` helper function in `tray.rs` that maps workspace type strings to emoji: local→🔵, ssh-remote→🟣, dev-container→🟢, attached-container→🟡, remote→🩷, unknown/empty→⚪
- [x] 1.2 Update `build_menu` to format workspace labels as `"{emoji} {name}"` using the helper
- [x] 1.3 Add unit tests for `type_emoji` covering all type mappings and the unknown/empty fallback

## 2. Path Validation in Tray Refresh

- [x] 2.1 Add a `validate_workspace_paths` async function in `tray.rs` that calls `POST /api/validate-paths` with the workspace list and returns a `HashMap<String, bool>` of path→valid
- [x] 2.2 Update `refresh_tray` to call `validate_workspace_paths` after fetching workspaces and pass validity data to `update_tray_menu`
- [x] 2.3 Handle validation API failure gracefully — fall back to treating all workspaces as valid
- [x] 2.4 Add unit test for `validate_workspace_paths` response parsing (mock HTTP response)

## 3. Missing Workspace Indication

- [x] 3.1 Update `build_menu` to accept validity data (e.g., `&HashMap<String, bool>`) alongside workspace list
- [x] 3.2 For invalid workspaces, set `enabled: false` on the `MenuItem` and format label as `"{emoji} ✗ {name}"`
- [x] 3.3 For remote workspace types, always treat as valid regardless of validation result
- [x] 3.4 Update `update_tray_menu` signature and callers to pass validity data through
- [x] 3.5 Add unit tests verifying label formatting for valid and invalid workspaces

## 4. Increase Workspace Limit

- [x] 4.1 Change `.take(5)` to `.take(10)` in `build_menu`
- [x] 4.2 Update the existing `workspaces_limited_to_five` test to verify the new limit of 10

## 5. Update Spec

- [x] 5.1 Sync delta spec to main `openspec/specs/status-menu/spec.md` via `/opsx:sync`
