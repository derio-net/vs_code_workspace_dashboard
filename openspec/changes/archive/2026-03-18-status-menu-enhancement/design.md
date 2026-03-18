## Context

The system tray quick-access menu currently shows up to 5 recent workspaces as plain text labels with no visual differentiation by type and no indication of path validity. The dashboard frontend already has a type color system (CSS variables `--type-local`, `--type-ssh-remote`, etc.) and path validation via `POST /api/validate-paths`. The tray is built with Tauri's native `MenuItem` API, which only supports plain text labels — no HTML, CSS, images, or rich formatting.

## Goals / Non-Goals

**Goals:**
- Show up to 10 recently accessed workspaces in the tray menu
- Visually indicate workspace type using emoji prefixes that map to the dashboard's color scheme
- Mark workspaces with missing/invalid paths as disabled with a visual indicator
- Validate workspace paths during each tray refresh cycle

**Non-Goals:**
- Custom-rendered tray menu (native menus only)
- Changing the dashboard's type colors or validation logic
- Adding new API endpoints — existing `/api/validate-paths` suffices
- Notification or alert when workspaces become invalid

## Decisions

### D1: Emoji circle prefixes for workspace type

Each workspace entry in the tray menu will be prefixed with a colored circle emoji matching its type:

| Type | Emoji | Dashboard Color |
|------|-------|----------------|
| local | 🔵 | `--type-local` (#58a6ff) |
| ssh-remote | 🟣 | `--type-ssh-remote` (#f778ba) |
| dev-container | 🟢 | `--type-dev-container` (#56d364) |
| attached-container | 🟡 | `--type-attached-container` (#e3b341) |
| remote | 🩷 | `--type-remote` (#bc8cff) |
| unknown / empty | ⚪ | `--type-unknown` (#8b949e) |

**Format**: `🔵 my-project`

**Why emoji over text prefixes like `[local]`**: Emoji are compact, immediately recognizable, and render reliably in native tray menus across macOS, Windows, and Linux. Text prefixes like `[SSH]` would add visual noise and widen entries. Emoji circles map intuitively to the colored badges in the dashboard.

**Alternative considered**: Unicode combining strikethrough characters (U+0336). Rejected because rendering is inconsistent across tray renderers — on some platforms the combining characters don't display properly in native menus.

### D2: Missing workspace indication via disabled item + text marker

Workspaces with invalid paths will be:
1. **Disabled** (`enabled: false` on the `MenuItem`) so they cannot be clicked
2. **Prefixed with ✗** to visually signal the issue: `🔵 ✗ my-deleted-project`

**Why not Unicode strikethrough**: Native tray menu renderers on macOS (NSMenu) and Windows handle Unicode combining characters inconsistently. A simple `✗` prefix combined with the disabled (grayed-out) state provides a clear, reliable signal across all platforms.

**Why disabled rather than hidden**: Users benefit from seeing that a workspace exists but is unreachable — it helps them understand what happened (project moved/deleted) and decide whether to clean up via the dashboard.

### D3: Path validation during tray refresh

The `refresh_tray` function in `tray.rs` will be extended to call `POST /api/validate-paths` after fetching workspaces. This reuses the backend's existing validation logic (which already handles local vs remote path types).

**Flow**:
1. Fetch workspaces from `GET /api/workspaces` (existing)
2. POST the workspace list to `/api/validate-paths` to get validity results
3. Merge validity data into workspace structs
4. Build menu with type emoji prefixes and disabled state for invalid entries

**Why call validate-paths instead of adding a `valid` field to the workspace list API**: The workspace list API returns cached scan results. Path validation is an I/O operation (disk access) that the scanner intentionally separates. The frontend already uses this two-step pattern. Keeping the same separation in the tray avoids changing the scanner's API contract.

### D4: Increase limit from 5 to 10

The `.take(5)` call in `build_menu` becomes `.take(10)`. This is a simple constant change. 10 entries is still within the range of a comfortable tray menu length (10 workspaces + separator + 3 standard items + separator + status = 16 items max).

## Risks / Trade-offs

- **Emoji rendering on older Linux DEs** → Some tray implementations may not render emoji. Mitigation: the workspace name still appears in full, so functionality is unaffected even if the emoji doesn't render.
- **Validate-paths adds latency to tray refresh** → Each refresh now makes two HTTP calls instead of one. Mitigation: the validation call is lightweight (local disk checks) and runs on a 30-second timer, so the added latency is imperceptible.
- **10 items may feel long on small screens** → Mitigation: 10 is a modest increase from 5, and tray menus scroll natively on all platforms if they exceed screen height.
- **Remote workspaces always show as valid** → The existing validate-paths endpoint skips validation for remote types (ssh-remote, dev-container, etc.) and returns them as valid. This is correct behavior — we cannot check remote host availability from the local machine.
