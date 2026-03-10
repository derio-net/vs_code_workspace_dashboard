## Why

The current system tray implementation (`tray.rs`) uses a default icon and has a minimal context menu (Show Dashboard, Check for Updates, Quit). On macOS this appears as the status menu bar item, and on Windows/Linux as the system tray icon. The tray does not use the app's custom icon, and the menu lacks useful quick-access actions like opening recent workspaces or viewing sidecar health status. Improving this makes the app feel more polished and gives users fast access to workspaces without opening the main window.

## What Changes

- **Use the custom app icon for the tray/status menu** across all platforms instead of the default Tauri icon
- **Expand the tray context menu** with richer actions: show workspace count, quick-open recent workspaces, sidecar health indicator, and separator-grouped sections
- **Platform-appropriate behavior**: on macOS, left-click opens the menu (status menu convention); on Windows/Linux, left-click shows the dashboard window (system tray convention)
- **Dynamic menu updates**: refresh tray menu content when workspace data changes (e.g., after a refresh or deletion)

## Capabilities

### New Capabilities
- `status-menu`: Cross-platform tray/status menu with app icon, dynamic workspace quick-access, and sidecar status indicator

### Modified Capabilities
- `tauri-desktop-app`: System tray integration requirements expand — tray icon uses the app icon, tray menu includes dynamic workspace entries and health status, platform-specific click behavior

## Impact

- **Rust code**: `src-tauri/src/tray.rs` — major rework for dynamic menu, icon loading, platform-specific behavior
- **Rust code**: `src-tauri/src/lib.rs` — tray needs access to sidecar state and workspace data to populate dynamic menu entries
- **Icons**: tray icon assets may need platform-specific sizes (16x16 for macOS menu bar, 32x32 for Windows, etc.) derived from existing app icons in `src-tauri/icons/`
- **Backend API**: no changes — tray menu fetches workspace data from the existing `/api/workspaces` endpoint via the sidecar
- **Dependencies**: no new crate dependencies expected — Tauri 2.x tray API already supports custom icons and dynamic menus
