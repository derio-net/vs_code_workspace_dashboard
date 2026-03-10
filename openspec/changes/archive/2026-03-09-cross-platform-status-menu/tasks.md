## 1. Tray Icon Setup

- [x] 1.1 Add tray icon loading in `tray.rs`: resolve the app icon path (dev vs prod) and load it via `tauri::image::Image::from_path()`, falling back to default if not found
- [x] 1.2 Pass the loaded icon to `TrayIconBuilder::icon()` and set a stable tray ID (`"main-tray"`)
- [x] 1.3 Verify the custom icon appears in the macOS menu bar, and confirm the icon path resolves correctly in dev mode (`src-tauri/icons/32x32.png`)

## 2. Tray State Management

- [x] 2.1 Create a `TrayState` struct (or extend `SidecarState`) to hold the `TrayIcon` handle so it can be accessed later for menu updates
- [x] 2.2 Register the tray state with `app.manage()` in `lib.rs` after tray creation
- [x] 2.3 Add a `workspaces-changed` event listener in `lib.rs` setup that triggers tray menu rebuild

## 3. Dynamic Menu Building

- [x] 3.1 Add an `update_tray_menu()` function in `tray.rs` that accepts the app handle, a list of workspaces (name + URI), and a backend health status bool
- [x] 3.2 Build the menu structure: workspace items (up to 5, sorted by last modified) → separator → Show Dashboard / Check for Updates / Quit → separator → backend status label (disabled)
- [x] 3.3 When no workspaces are available, show a disabled "No workspaces found" item instead of workspace entries
- [x] 3.4 Handle workspace menu item clicks: extract the workspace URI from the menu item ID and open VS Code (reuse the `open_vscode` logic via `OpenerExt`)

## 4. Periodic Refresh

- [x] 4.1 Add a `fetch_workspaces()` async function in `tray.rs` that calls `GET http://127.0.0.1:{port}/api/workspaces` via `reqwest` and parses the response into a simple struct (name, URI, lastModified)
- [x] 4.2 Spawn an async task in `lib.rs` setup that runs `fetch_workspaces()` + `check_sidecar_health()` every 30 seconds and calls `update_tray_menu()` with the results
- [x] 4.3 On `workspaces-changed` event, trigger an immediate refresh (call `fetch_workspaces` + `update_tray_menu` outside the timer)

## 5. Platform-Specific Click Behavior

- [x] 5.1 Update `on_tray_icon_event` in `tray.rs`: on macOS, remove the left-click → show window behavior (let the OS open the menu); on Windows/Linux, keep the existing left-click → show and focus window behavior
- [x] 5.2 Verify on macOS that clicking the status menu icon opens the context menu, not the main window

## 6. Frontend Integration

- [x] 6.1 Emit a `workspaces-changed` Tauri event from the React fronteBacknd after workspace refresh or deletion operations (in `src/api/client.js` or `src/components/Dashboard.js`)
- [x] 6.2 Verify the tray menu updates when the user refreshes or deletes workspaces from the dashboard

## 7. Testing & Verification

- [x] 7.1 Test tray icon appears with custom icon on macOS (dev mode)
- [x] 7.2 Test tray menu shows recent workspaces after sidecar starts
- [x] 7.3 Test clicking a workspace in the tray menu opens VS Code
- [x] 7.4 Test "Backend: Offline" label appears when sidecar is stopped
- [x] 7.5 Test menu updates after workspace deletion from the dashboard
