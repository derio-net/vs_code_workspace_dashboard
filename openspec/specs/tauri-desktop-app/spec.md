# tauri-desktop-app Specification

## Purpose
Define the Tauri-based desktop application structure, window management, and integration with the sidecar backend.

## Requirements

### Requirement: Tauri application initialization
The system SHALL initialize a Tauri-based desktop application with a webview window that loads the React frontend.

#### Scenario: Application starts successfully
- **WHEN** the user launches the application
- **THEN** a Tauri window opens displaying the dashboard UI
- **AND** the window loads the bundled React frontend

#### Scenario: Window has correct dimensions and title
- **WHEN** the application window opens
- **THEN** the window SHALL have a minimum size of 1024x768 pixels
- **AND** the window title SHALL be "VS Code: Workspace Dashboard"

### Requirement: Tauri configuration management
The system SHALL use a `tauri.conf.json` configuration file that defines build settings, bundle metadata, security policies, and window properties.

#### Scenario: Configuration is valid and complete
- **WHEN** the Tauri configuration is loaded
- **THEN** all required fields SHALL be present including app metadata, build paths, and security settings
- **AND** the configuration SHALL reference the correct frontend dist directory

#### Scenario: Security policies are configured
- **WHEN** the application initializes
- **THEN** the Content Security Policy SHALL allow connections to `http://localhost:3010`
- **AND** the default-src SHALL be restricted to `'self'`

### Requirement: Sidecar process management
The system SHALL spawn the Node.js sidecar process on application startup and manage its lifecycle.

#### Scenario: Sidecar spawns on startup
- **WHEN** the Tauri application starts
- **THEN** the system SHALL spawn the sidecar binary
- **AND** the sidecar SHALL start listening on `127.0.0.1:3010`

#### Scenario: Sidecar health monitoring
- **WHEN** the sidecar is running
- **THEN** the system SHALL monitor its health every 5 seconds
- **AND** if the sidecar becomes unresponsive, the system SHALL attempt to restart it

#### Scenario: Sidecar cleanup on exit
- **WHEN** the user closes the application
- **THEN** the system SHALL gracefully terminate the sidecar process
- **AND** if graceful termination fails, the system SHALL force kill the process

### Requirement: Window state management
The system SHALL persist and restore window state including size, position, and maximized state across application restarts.

#### Scenario: Window state is saved on close
- **WHEN** the user closes the application window
- **THEN** the current window dimensions and position SHALL be saved to the app configuration directory

#### Scenario: Window state is restored on open
- **WHEN** the user reopens the application
- **THEN** the window SHALL restore to its previous size and position
- **AND** if the previous position is off-screen, the window SHALL be centered

### Requirement: Application menu integration
The system SHALL provide a native application menu with standard options for the platform.

#### Scenario: Menu contains standard items
- **WHEN** the application is running
- **THEN** the menu bar SHALL contain: Application (About, Quit), Edit (Copy, Paste), View (Reload, Toggle DevTools), Window (Minimize, Close)

#### Scenario: Platform-specific menu layout
- **WHEN** the application runs on macOS
- **THEN** the menu SHALL follow macOS conventions with the app menu in the global menu bar
- **AND** when running on Windows/Linux, the menu SHALL be integrated into the window

### Requirement: System tray integration
The system SHALL support system tray integration with the application's custom icon, dynamic workspace quick-access, and sidecar health status.

#### Scenario: Tray icon is displayed
- **WHEN** the application is running
- **THEN** the application's custom icon SHALL be visible in the system tray

#### Scenario: Tray menu provides quick actions
- **WHEN** the user right-clicks the tray icon (or clicks on macOS)
- **THEN** a context menu SHALL appear with sections:
  - Up to 5 recent workspaces (clickable to open in VS Code)
  - Separator
  - Show Dashboard, Check for Updates, Quit
  - Separator
  - Backend status indicator (disabled label showing "Backend: Running" or "Backend: Offline")

#### Scenario: Tray menu reflects current state
- **WHEN** workspace data changes or 30 seconds have elapsed
- **THEN** the tray menu SHALL be rebuilt with current workspace and backend health data

### Requirement: Error handling and user feedback
The system SHALL display user-friendly error dialogs when critical errors occur.

#### Scenario: Sidecar fails to start
- **WHEN** the sidecar process fails to spawn after 3 retry attempts
- **THEN** an error dialog SHALL be displayed with the message "Failed to start backend service"
- **AND** the dialog SHALL provide "Retry" and "Exit" buttons

#### Scenario: Platform not supported
- **WHEN** the application runs on an unsupported platform
- **THEN** an error dialog SHALL be displayed explaining the platform is not supported
- **AND** the application SHALL exit gracefully

### Requirement: Development mode support
The system SHALL support a development mode that connects to a local dev server instead of the bundled frontend.

#### Scenario: Dev mode uses local server
- **WHEN** the application is started in development mode
- **THEN** the webview SHALL load from `http://localhost:3000` instead of the bundled files
- **AND** hot reload SHALL be enabled

#### Scenario: Production mode uses bundled files
- **WHEN** the application is started in production mode
- **THEN** the webview SHALL load the bundled frontend from the `dist` directory
