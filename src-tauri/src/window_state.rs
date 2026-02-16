use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, LogicalSize, LogicalPosition, WebviewWindow};

const WINDOW_STATE_FILE: &str = "window-state.json";

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct WindowState {
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub maximized: bool,
}

impl WindowState {
    pub fn from_window(window: &WebviewWindow) -> Option<Self> {
        let scale_factor = window.scale_factor().ok()?;
        let size = window.inner_size().ok()?;
        let position = window.outer_position().ok()?;

        let logical_size: LogicalSize<u32> = size.to_logical(scale_factor);
        let logical_pos: LogicalPosition<i32> = position.to_logical(scale_factor);

        Some(Self {
            width: logical_size.width,
            height: logical_size.height,
            x: logical_pos.x,
            y: logical_pos.y,
            maximized: window.is_maximized().unwrap_or(false),
        })
    }
}

fn get_state_path(app: &AppHandle) -> PathBuf {
    app.path()
        .app_config_dir()
        .unwrap_or_else(|_| std::env::temp_dir())
        .join(WINDOW_STATE_FILE)
}

pub fn save_window_state(app: &AppHandle, window: &WebviewWindow) {
    if let Some(state) = WindowState::from_window(window) {
        let state_path = get_state_path(app);

        if let Ok(json) = serde_json::to_string_pretty(&state) {
            let _ = std::fs::write(&state_path, json);
        }
    }
}

pub fn restore_window_state(app: &AppHandle, window: &WebviewWindow) {
    let state_path = get_state_path(app);

    if let Ok(content) = std::fs::read_to_string(&state_path) {
        if let Ok(state) = serde_json::from_str::<WindowState>(&content) {
            // Check if window position is valid (not off-screen)
            let monitors = window.available_monitors().unwrap_or_default();
            let mut is_valid_position = false;

            for monitor in monitors {
                let monitor_pos = monitor.position();
                let monitor_size = monitor.size();

                // Check if window is at least partially visible on this monitor
                if (state.x as i32) < (monitor_pos.x + monitor_size.width as i32)
                    && (state.x as i32 + state.width as i32) > monitor_pos.x
                    && (state.y as i32) < (monitor_pos.y + monitor_size.height as i32)
                    && (state.y as i32 + state.height as i32) > monitor_pos.y
                {
                    is_valid_position = true;
                    break;
                }
            }

            if is_valid_position {
                let _ = window.set_position(PhysicalPosition::new(state.x, state.y));
                let _ = window.set_size(PhysicalSize::new(state.width, state.height));
            } else {
                // Center window if position is off-screen
                let _ = window.center();
            }

            if state.maximized {
                let _ = window.maximize();
            }
        }
    }
}
