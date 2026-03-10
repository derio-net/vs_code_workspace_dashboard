## Context

The app currently has a basic system tray (`tray.rs`) with a default icon and a static 3-item menu (Show Dashboard, Check for Updates, Quit). The tray is created once at startup and never updated. The app already has custom icons in `src-tauri/icons/` for all platforms, a working sidecar health-check system in `lib.rs`, and a `/api/workspaces` endpoint that returns the full workspace list.

## Goals / Non-Goals

**Goals:**
- Use the custom app icon as the tray/status menu icon on all platforms
- Provide a dynamic tray menu that shows recent workspaces for quick-open without opening the main window
- Show sidecar backend health status in the tray menu
- Follow platform conventions: macOS status menu (click opens menu), Windows/Linux system tray (left-click shows window, right-click opens menu)

**Non-Goals:**
- Adding new backend API endpoints — reuse the existing `/api/workspaces` and `/health` endpoints
- Animated or colored tray icons to indicate status (keep it simple with a single static icon)
- Tray-only mode (hiding to tray on close) — the app continues to quit on window close
- Notification popups from the tray

## Decisions

### 1. Icon loading: use Tauri's `Image::from_path` with platform-specific sizes

The tray icon should be the app's own icon. Tauri 2.x `TrayIconBuilder::icon()` accepts a `tauri::image::Image`. Use `Image::from_path()` to load from the existing `icons/` directory.

- macOS status bar expects ~22x22 points (44px @2x). Use `32x32.png` — the OS will scale it.
- Windows system tray uses 16x16 or 32x32. Use `32x32.png`.
- Linux varies by DE but 32x32 works broadly.

**Alternative considered**: Embedding the icon as bytes at compile time with `include_bytes!`. Rejected because the icon files already exist on disk in the bundle and `from_path` is simpler.

### 2. Dynamic menu: rebuild the tray menu on a timer and on workspace refresh events

The tray menu needs to show current workspace data. Approach:
- On startup and every 30 seconds, fetch `/api/workspaces` from the sidecar and rebuild the tray menu.
- Also rebuild when the frontend triggers a refresh (listen for a `workspaces-changed` Tauri event from the frontend).
- Show up to 5 most recently modified workspaces as menu items. Each item opens VS Code via the existing `open_vscode` command logic.
- Show a "No workspaces found" disabled item if the list is empty or the sidecar is down.

**Alternative considered**: Updating individual menu items in place. Rejected because Tauri 2.x doesn't support mutating menu item text after creation — the menu must be rebuilt.

### 3. Sidecar status indicator: text-based label in the menu

Add a disabled (non-clickable) menu item at the bottom showing sidecar status:
- "Backend: Running" when health check passes
- "Backend: Offline" when health check fails

This reuses the existing `check_sidecar_health()` function. No icon changes based on status — just the text label.

**Alternative considered**: Using a colored dot emoji (🟢/🔴) as prefix. Rejected for now to keep it clean and cross-platform safe, but could be added later.

### 4. Platform-specific click behavior: conditional compilation

Use `#[cfg(target_os = "macos")]` in `on_tray_icon_event`:
- macOS: left-click does nothing extra (the menu opens automatically on click — macOS status menu convention)
- Windows/Linux: left-click shows and focuses the main window (current behavior preserved)

### 5. Architecture: keep tray logic in `tray.rs`, add state sharing

- `tray.rs` gains a `update_tray_menu()` function that accepts the app handle and workspace data
- Store the `TrayIcon` in Tauri managed state so it can be accessed later for menu updates
- The periodic refresh spawns an async task (similar to the existing health monitor pattern in `lib.rs`)
- Workspace data is fetched via HTTP from the sidecar (same as the frontend does), not by importing scanner logic into Rust

## Risks / Trade-offs

- **[Menu rebuild frequency]** → Rebuilding every 30s is infrequent enough to have negligible performance impact. The workspace list is small (typically <100 items) and we only show 5.
- **[Sidecar not ready at startup]** → The tray menu shows "No workspaces found" and "Backend: Offline" until the sidecar responds. The periodic refresh will populate it once ready. Mitigated by the existing 2-second startup delay before health monitoring begins.
- **[Icon path in production bundles]** → Icon path resolution differs between dev and prod (similar to sidecar path). Use `app.path().resource_dir()` to resolve bundled icon paths in production. Fall back to default icon if file not found.
- **[Tauri tray icon ID]** → `TrayIconBuilder` requires a unique ID. Use a constant `"main-tray"` to avoid conflicts if tray is rebuilt.
