use tauri::tray::{TrayIconBuilder, TrayIconEvent, MouseButton};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::Emitter;
use tauri::Manager;

pub fn create_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let tray_menu = Menu::with_items(app, &[
        &MenuItem::with_id(app, "show_dashboard", "Show Dashboard", true, None::<&str>).unwrap(),
        &PredefinedMenuItem::separator(app).unwrap(),
        &MenuItem::with_id(app, "check_updates", "Check for Updates", true, None::<&str>).unwrap(),
        &PredefinedMenuItem::separator(app).unwrap(),
        &MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).unwrap(),
    ]).unwrap();

    TrayIconBuilder::new()
        .menu(&tray_menu)
        .on_menu_event(|app: &tauri::AppHandle, event| {
            match event.id().as_ref() {
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
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click { button, .. } = event {
                if button == MouseButton::Left {
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        let _: Result<(), _> = window.show();
                        let _: Result<(), _> = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}
