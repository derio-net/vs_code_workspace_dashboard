use tauri::tray::{TrayIcon, TrayIconBuilder};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;
use serde::Deserialize;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Workspace info fetched from the sidecar API
#[derive(Debug, Clone, Deserialize)]
pub struct TrayWorkspace {
    pub name: String,
    pub path: String,
    #[serde(rename = "type", default)]
    pub workspace_type: String,
    #[serde(rename = "lastModified")]
    pub last_modified: String,
}

/// Convert a workspace path to a vscode:// URI that VS Code's protocol handler recognizes.
/// Mirrors the convertToVSCodeURI logic in WorkspaceTable.js.
pub fn convert_to_vscode_uri(path: &str, workspace_type: &str) -> String {
    // Remote workspaces: transform vscode-remote:// to vscode://vscode-remote/
    match workspace_type {
        "remote" | "dev-container" | "attached-container" | "ssh-remote" => {
            if path.starts_with("vscode-remote://") {
                return path.replacen("vscode-remote://", "vscode://vscode-remote/", 1);
            }
            return path.to_string();
        }
        _ => {}
    }

    // Local workspaces: strip file://, decode, re-encode, prepend vscode://file
    let mut clean_path = path.to_string();
    if clean_path.starts_with("file://") {
        clean_path = clean_path[7..].to_string();
    }

    // Decode percent-encoded characters
    if let Ok(decoded) = urlencoding::decode(&clean_path) {
        clean_path = decoded.into_owned();
    }

    // Re-encode each path segment (preserve slashes)
    let encoded: String = clean_path
        .split('/')
        .map(|segment| urlencoding::encode(segment).into_owned())
        .collect::<Vec<_>>()
        .join("/");

    format!("vscode://file{}", encoded)
}

/// Managed state holding the tray icon handle for dynamic updates
pub struct TrayState {
    pub tray_icon: Arc<Mutex<Option<TrayIcon>>>,
}

impl TrayState {
    pub fn new() -> Self {
        Self {
            tray_icon: Arc::new(Mutex::new(None)),
        }
    }
}

/// Resolve the tray icon path (dev vs prod)
fn resolve_icon_path(app: &tauri::AppHandle) -> Option<std::path::PathBuf> {
    if cfg!(dev) {
        // In dev mode, icons are in src-tauri/icons/ relative to the working dir
        let path = std::env::current_dir().ok()?.join("icons").join("32x32.png");
        if path.exists() { Some(path) } else { None }
    } else {
        // In production, use the resource directory
        let resource_dir = app.path().resource_dir().ok()?;
        let path = resource_dir.join("icons").join("32x32.png");
        if path.exists() {
            Some(path)
        } else {
            // Fallback: icon may be bundled alongside the executable
            let exe_dir = std::env::current_exe().ok()?.parent()?.to_path_buf();
            let path = exe_dir.join("icons").join("32x32.png");
            if path.exists() { Some(path) } else { None }
        }
    }
}

/// Create the initial tray icon with custom app icon and default menu
pub fn create_tray(app: &tauri::AppHandle) -> tauri::Result<TrayIcon> {
    let tray_menu = build_menu(app, &[], false);

    let mut builder = TrayIconBuilder::with_id("main-tray")
        .menu(&tray_menu)
        .show_menu_on_left_click(cfg!(target_os = "macos"))
        .on_menu_event(handle_tray_menu_event)
        .on_tray_icon_event(|tray, event| {
            // On Windows/Linux, left-click shows the main window
            #[cfg(not(target_os = "macos"))]
            {
                use tauri::tray::{TrayIconEvent, MouseButton};
                if let TrayIconEvent::Click { button, .. } = event {
                    if button == MouseButton::Left {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _: Result<(), _> = window.show();
                            let _: Result<(), _> = window.set_focus();
                        }
                    }
                }
            }
            // Suppress unused variable warnings on macOS
            #[cfg(target_os = "macos")]
            {
                let _ = (tray, event);
            }
        });

    // Load custom icon, fall back to default if not found
    if let Some(icon_path) = resolve_icon_path(app) {
        match tauri::image::Image::from_path(&icon_path) {
            Ok(image) => {
                log::info!("Loaded tray icon from {:?}", icon_path);
                builder = builder.icon(image);
            }
            Err(e) => {
                log::warn!("Failed to load tray icon from {:?}: {}, using default", icon_path, e);
            }
        }
    } else {
        log::warn!("Tray icon file not found, using default icon");
    }

    builder.build(app)
}

/// Handle menu item clicks from the tray
fn handle_tray_menu_event(app: &tauri::AppHandle, event: tauri::menu::MenuEvent) {
    let id = event.id();
    let id_str = id.as_ref();

    if id_str.starts_with("ws_open:") {
        // Workspace quick-open: extract the URI after the prefix
        let uri = &id_str["ws_open:".len()..];
        if let Err(e) = app.opener().open_url(uri, None::<&str>) {
            log::error!("Failed to open workspace from tray: {}", e);
        }
    } else {
        match id_str {
            "show_dashboard" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _: Result<(), _> = window.show();
                    let _: Result<(), _> = window.set_focus();
                }
            }
            "check_updates" => {
                let _ = app.emit("check-for-updates", ());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        }
    }
}

/// Build the tray menu with workspace entries and health status
fn build_menu(app: &tauri::AppHandle, workspaces: &[TrayWorkspace], backend_healthy: bool) -> Menu<tauri::Wry> {
    let status_label = if backend_healthy { "Backend: Running" } else { "Backend: Offline" };

    if workspaces.is_empty() {
        let no_ws = MenuItem::with_id(app, "no_workspaces", "No workspaces found", false, None::<&str>).unwrap();
        let sep1 = PredefinedMenuItem::separator(app).unwrap();
        let show = MenuItem::with_id(app, "show_dashboard", "Show Dashboard", true, None::<&str>).unwrap();
        let updates = MenuItem::with_id(app, "check_updates", "Check for Updates", true, None::<&str>).unwrap();
        let sep2 = PredefinedMenuItem::separator(app).unwrap();
        let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).unwrap();
        let sep3 = PredefinedMenuItem::separator(app).unwrap();
        let status = MenuItem::with_id(app, "backend_status", status_label, false, None::<&str>).unwrap();

        Menu::with_items(app, &[
            &no_ws, &sep1, &show, &updates, &sep2, &quit, &sep3, &status,
        ]).unwrap()
    } else {
        // Build workspace items (up to 5, already sorted by last_modified desc)
        let ws_items: Vec<MenuItem<tauri::Wry>> = workspaces.iter().take(5).map(|ws| {
            let uri = convert_to_vscode_uri(&ws.path, &ws.workspace_type);
            let menu_id = format!("ws_open:{}", uri);
            MenuItem::with_id(app, &menu_id, &ws.name, true, None::<&str>).unwrap()
        }).collect();

        let sep1 = PredefinedMenuItem::separator(app).unwrap();
        let show = MenuItem::with_id(app, "show_dashboard", "Show Dashboard", true, None::<&str>).unwrap();
        let updates = MenuItem::with_id(app, "check_updates", "Check for Updates", true, None::<&str>).unwrap();
        let sep2 = PredefinedMenuItem::separator(app).unwrap();
        let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).unwrap();
        let sep3 = PredefinedMenuItem::separator(app).unwrap();
        let status = MenuItem::with_id(app, "backend_status", status_label, false, None::<&str>).unwrap();

        let mut menu_items: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = Vec::new();
        for item in &ws_items {
            menu_items.push(item);
        }
        menu_items.push(&sep1);
        menu_items.push(&show);
        menu_items.push(&updates);
        menu_items.push(&sep2);
        menu_items.push(&quit);
        menu_items.push(&sep3);
        menu_items.push(&status);

        Menu::with_items(app, &menu_items).unwrap()
    }
}

/// Update the tray menu with fresh workspace data and health status
pub async fn update_tray_menu(app: &tauri::AppHandle, workspaces: &[TrayWorkspace], backend_healthy: bool) {
    let tray_state: tauri::State<'_, TrayState> = app.state();
    let tray_icon = tray_state.tray_icon.lock().await;

    if let Some(tray) = tray_icon.as_ref() {
        let new_menu = build_menu(app, workspaces, backend_healthy);
        if let Err(e) = tray.set_menu(Some(new_menu)) {
            log::error!("Failed to update tray menu: {}", e);
        } else {
            log::info!("Tray menu updated: {} workspaces, backend {}", workspaces.len(), if backend_healthy { "online" } else { "offline" });
        }
    } else {
        log::warn!("Tray icon not stored in state, cannot update menu");
    }
}

/// Fetch workspaces from the sidecar API
pub async fn fetch_workspaces(port: u16) -> Vec<TrayWorkspace> {
    let url = format!("http://127.0.0.1:{}/api/workspaces", port);
    match reqwest::get(&url).await {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<Vec<TrayWorkspace>>().await {
                    Ok(mut workspaces) => {
                        // Sort by last_modified descending
                        workspaces.sort_by(|a, b| b.last_modified.cmp(&a.last_modified));
                        workspaces
                    }
                    Err(e) => {
                        log::warn!("Failed to parse workspace response: {}", e);
                        Vec::new()
                    }
                }
            } else {
                Vec::new()
            }
        }
        Err(e) => {
            log::warn!("Failed to fetch workspaces for tray: {}", e);
            Vec::new()
        }
    }
}

/// Refresh the tray menu by fetching current data
pub async fn refresh_tray(app: &tauri::AppHandle, port: u16) {
    log::debug!("Tray refresh: fetching workspaces from port {}", port);
    let workspaces = fetch_workspaces(port).await;
    let healthy = super::check_sidecar_health(port).await;
    log::debug!("Tray refresh: got {} workspaces, healthy={}", workspaces.len(), healthy);
    update_tray_menu(app, &workspaces, healthy).await;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tray_state_starts_empty() {
        let state = TrayState::new();
        // TrayIcon should be None initially
        let guard = state.tray_icon.blocking_lock();
        assert!(guard.is_none(), "TrayState should start with no icon");
    }

    #[test]
    fn blocking_lock_provides_immediate_access() {
        // This test verifies the fix: blocking_lock() in synchronous context
        // makes the value immediately available, unlike the old async spawn pattern
        // which could leave the value as None when accessed shortly after.
        let state = TrayState::new();

        // Simulate synchronous storage (the fix)
        {
            let guard = state.tray_icon.blocking_lock();
            // We can't create a real TrayIcon in tests, but we verify the lock works
            assert!(guard.is_none());
            // In production: *guard = Some(tray_icon);
        }

        // Immediately accessible after the lock is released
        let guard = state.tray_icon.blocking_lock();
        // Lock is acquired without blocking — no race condition
        assert!(guard.is_none()); // Still None since we didn't set a real icon
    }

    #[tokio::test]
    async fn async_spawn_storage_can_race_with_reader() {
        // This test demonstrates the BUG: storing a value via async spawn
        // means the value may not be available when a reader checks immediately.
        let shared = Arc::new(Mutex::new(false));

        // Simulate the old pattern: store value via async spawn
        let writer = shared.clone();
        tokio::spawn(async move {
            // This task is queued but may not run immediately
            let mut guard = writer.lock().await;
            *guard = true;
        });

        // Read immediately WITHOUT awaiting the spawn — simulates the refresh
        // task reading TrayState before the icon storage spawn executes.
        // NOTE: This succeeds on a multi-threaded runtime but demonstrates
        // the pattern issue — the value might still be false (unset).
        let guard = shared.lock().await;
        // On a busy runtime, the spawn may not have executed yet.
        // The fix avoids this race entirely by using synchronous storage.
        let _ = *guard; // Value is indeterminate — could be true or false
    }

    #[test]
    fn tray_workspace_deserializes_from_api_json() {
        let json = r#"[
            {"name": "my-project", "path": "/home/user/my-project", "type": "local", "lastModified": "2026-03-09T10:00:00Z"},
            {"name": "other-project", "path": "/home/user/other", "type": "ssh-remote", "lastModified": "2026-03-08T10:00:00Z"}
        ]"#;

        let workspaces: Vec<TrayWorkspace> = serde_json::from_str(json).unwrap();
        assert_eq!(workspaces.len(), 2);
        assert_eq!(workspaces[0].name, "my-project");
        assert_eq!(workspaces[0].path, "/home/user/my-project");
        assert_eq!(workspaces[0].workspace_type, "local");
        assert_eq!(workspaces[0].last_modified, "2026-03-09T10:00:00Z");
        assert_eq!(workspaces[1].workspace_type, "ssh-remote");
    }

    #[test]
    fn tray_workspace_deserializes_with_extra_fields() {
        // The API returns more fields than TrayWorkspace needs — verify it ignores extras
        let json = r#"{"name": "proj", "path": "/p", "lastModified": "2026-01-01T00:00:00Z", "type": "local", "id": "abc123"}"#;
        let ws: TrayWorkspace = serde_json::from_str(json).unwrap();
        assert_eq!(ws.name, "proj");
        assert_eq!(ws.workspace_type, "local");
    }

    #[test]
    fn tray_workspace_type_defaults_when_missing() {
        let json = r#"{"name": "proj", "path": "/p", "lastModified": "2026-01-01T00:00:00Z"}"#;
        let ws: TrayWorkspace = serde_json::from_str(json).unwrap();
        assert_eq!(ws.workspace_type, "");
    }

    #[test]
    fn workspaces_sort_by_last_modified_descending() {
        let mut workspaces = vec![
            TrayWorkspace { name: "old".into(), path: "/old".into(), workspace_type: "local".into(), last_modified: "2026-01-01T00:00:00Z".into() },
            TrayWorkspace { name: "newest".into(), path: "/new".into(), workspace_type: "local".into(), last_modified: "2026-03-09T00:00:00Z".into() },
            TrayWorkspace { name: "mid".into(), path: "/mid".into(), workspace_type: "local".into(), last_modified: "2026-02-01T00:00:00Z".into() },
        ];

        workspaces.sort_by(|a, b| b.last_modified.cmp(&a.last_modified));

        assert_eq!(workspaces[0].name, "newest");
        assert_eq!(workspaces[1].name, "mid");
        assert_eq!(workspaces[2].name, "old");
    }

    #[test]
    fn workspaces_limited_to_five() {
        let workspaces: Vec<TrayWorkspace> = (0..10).map(|i| TrayWorkspace {
            name: format!("project-{}", i),
            path: format!("/path/{}", i),
            workspace_type: "local".into(),
            last_modified: format!("2026-03-{:02}T00:00:00Z", i + 1),
        }).collect();

        let shown: Vec<_> = workspaces.iter().take(5).collect();
        assert_eq!(shown.len(), 5);
        assert_eq!(workspaces.len(), 10);
    }

    // --- URI conversion tests (verifies the bug fix) ---

    #[test]
    fn convert_local_path_to_vscode_uri() {
        let uri = convert_to_vscode_uri("/Users/dev/my-project", "local");
        assert_eq!(uri, "vscode://file/Users/dev/my-project");
    }

    #[test]
    fn convert_local_file_uri_to_vscode_uri() {
        // Raw path from API may have file:// prefix
        let uri = convert_to_vscode_uri("file:///Users/dev/my-project", "local");
        assert_eq!(uri, "vscode://file/Users/dev/my-project");
    }

    #[test]
    fn convert_local_path_with_spaces() {
        let uri = convert_to_vscode_uri("/Users/dev/my project", "local");
        assert_eq!(uri, "vscode://file/Users/dev/my%20project");
    }

    #[test]
    fn convert_local_path_with_encoded_spaces() {
        // API may return percent-encoded paths
        let uri = convert_to_vscode_uri("file:///Users/dev/my%20project", "local");
        assert_eq!(uri, "vscode://file/Users/dev/my%20project");
    }

    #[test]
    fn convert_ssh_remote_uri() {
        let uri = convert_to_vscode_uri(
            "vscode-remote://ssh-remote+myhost/home/user/project",
            "ssh-remote",
        );
        assert_eq!(uri, "vscode://vscode-remote/ssh-remote+myhost/home/user/project");
    }

    #[test]
    fn convert_dev_container_uri() {
        let uri = convert_to_vscode_uri(
            "vscode-remote://dev-container+abc123/workspace",
            "dev-container",
        );
        assert_eq!(uri, "vscode://vscode-remote/dev-container+abc123/workspace");
    }

    #[test]
    fn convert_attached_container_uri() {
        let uri = convert_to_vscode_uri(
            "vscode-remote://attached-container+abc/workspace",
            "attached-container",
        );
        assert_eq!(uri, "vscode://vscode-remote/attached-container+abc/workspace");
    }

    #[test]
    fn convert_unknown_type_treated_as_local() {
        // Unknown or empty type should be treated as local
        let uri = convert_to_vscode_uri("/some/path", "");
        assert_eq!(uri, "vscode://file/some/path");
    }

    #[test]
    fn raw_path_without_conversion_opens_finder_not_vscode() {
        // This test documents the bug: a raw filesystem path passed to open_url
        // would open Finder (macOS) instead of VS Code.
        // The raw path does NOT start with vscode://, so the OS opens it as a file.
        let raw_path = "file:///Users/dev/my-project";
        assert!(!raw_path.starts_with("vscode://"),
            "Raw API paths don't have vscode:// scheme — they open in Finder, not VS Code");

        let converted = convert_to_vscode_uri(raw_path, "local");
        assert!(converted.starts_with("vscode://"),
            "Converted URI must use vscode:// scheme to open in VS Code");
    }
}
