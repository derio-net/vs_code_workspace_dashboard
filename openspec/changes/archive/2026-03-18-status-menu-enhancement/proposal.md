## Why

The system tray menu currently shows only 5 workspaces with no visual differentiation between workspace types and no indication of which workspaces have missing/invalid paths. Users who rely on the tray for quick access want more workspaces visible, the same type-aware color coding they see in the dashboard, and a clear signal when a workspace path no longer exists — so they can skip stale entries without opening the dashboard to investigate.

## What Changes

- **Increase workspace limit from 5 to 10** in the tray quick-access menu, allowing more recently accessed workspaces to be reachable from the tray.
- **Add workspace type indicator** to each tray menu entry using a colored emoji or text prefix that matches the type color scheme from the dashboard (local, ssh-remote, dev-container, attached-container, remote).
- **Add strikethrough styling for missing workspaces** — workspaces whose paths no longer exist on disk should be visually marked (e.g., strikethrough Unicode text or a prefix marker) and made non-clickable (disabled) in the tray menu.
- **Add path validation to the tray refresh cycle** — the tray backend must call the existing `/api/validate-paths` endpoint during each refresh to determine which workspace paths are still valid.

## Capabilities

### New Capabilities

_None — all changes modify existing capabilities._

### Modified Capabilities

- `status-menu`: The workspace quick-access limit changes from 5 to 10; workspace entries gain type indicators and missing-path styling; the refresh cycle now includes path validation.

## Impact

- **Rust tray code** (`src-tauri/src/tray.rs`): `build_menu` must render type indicators and handle disabled/styled entries for invalid paths; `fetch_workspaces` (or a new helper) must call `/api/validate-paths` during refresh; the `.take(5)` limit changes to `.take(10)`.
- **Backend API**: No new endpoints — uses existing `POST /api/validate-paths` which already accepts workspace arrays and returns validity results.
- **Native menu constraints**: Tauri's `MenuItem` does not support CSS, colored backgrounds, or rich text. Type indicators and strikethrough must use Unicode/emoji techniques (e.g., colored circle emoji for type, Unicode strikethrough combining characters or bracketed text for missing paths).
- **Spec update**: The `status-menu` spec's "up to 5" scenario must change to "up to 10", and new scenarios are needed for type indicators and missing-path display.
