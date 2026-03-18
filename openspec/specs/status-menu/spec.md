# status-menu Specification

## Purpose
Define the system tray / status menu behavior including custom icon display, dynamic workspace quick-access, sidecar health status, periodic refresh, and platform-specific click behavior.

## Requirements

### Requirement: Tray icon uses the application icon
The system SHALL display the custom application icon as the tray/status menu icon on all supported platforms.

#### Scenario: Custom icon is displayed in the tray
- **WHEN** the application starts
- **THEN** the system tray icon SHALL be the application's custom icon loaded from the bundled icon assets
- **AND** the icon SHALL be visible in the macOS menu bar, Windows system tray, or Linux notification area

#### Scenario: Icon fallback on missing asset
- **WHEN** the custom icon file cannot be found at the expected path
- **THEN** the system SHALL fall back to the default Tauri icon
- **AND** the tray SHALL still be created and functional

### Requirement: Dynamic workspace quick-access menu
The system SHALL display recently accessed workspaces in the tray context menu for quick access.

#### Scenario: Recent workspaces are shown in the menu
- **WHEN** the user opens the tray context menu
- **THEN** the menu SHALL display up to 10 of the most recently accessed workspaces by name
- **AND** each workspace entry SHALL be prefixed with a type indicator emoji
- **AND** the workspace entries SHALL appear above the standard menu items (Show Dashboard, Check for Updates, Quit)
- **AND** a separator SHALL divide the workspace entries from the standard items

#### Scenario: Clicking a workspace entry opens it in VS Code
- **WHEN** the user clicks an enabled workspace entry in the tray menu
- **THEN** the system SHALL open that workspace in VS Code using the same mechanism as the dashboard's open action

#### Scenario: No workspaces available
- **WHEN** no workspaces are found or the backend is offline
- **THEN** the menu SHALL display a disabled item with the text "No workspaces found"
- **AND** the standard menu items SHALL still be present and functional

### Requirement: Workspace type indicator in tray menu entries
The system SHALL display a colored emoji prefix on each workspace entry in the tray menu to indicate its type, matching the dashboard's type color scheme.

#### Scenario: Local workspace shows blue circle
- **WHEN** a workspace of type "local" appears in the tray menu
- **THEN** the menu entry label SHALL be prefixed with 🔵 followed by a space

#### Scenario: SSH remote workspace shows purple circle
- **WHEN** a workspace of type "ssh-remote" appears in the tray menu
- **THEN** the menu entry label SHALL be prefixed with 🟣 followed by a space

#### Scenario: Dev container workspace shows green circle
- **WHEN** a workspace of type "dev-container" appears in the tray menu
- **THEN** the menu entry label SHALL be prefixed with 🟢 followed by a space

#### Scenario: Attached container workspace shows yellow circle
- **WHEN** a workspace of type "attached-container" appears in the tray menu
- **THEN** the menu entry label SHALL be prefixed with 🟡 followed by a space

#### Scenario: Remote workspace shows pink heart
- **WHEN** a workspace of type "remote" appears in the tray menu
- **THEN** the menu entry label SHALL be prefixed with 🩷 followed by a space

#### Scenario: Unknown or empty type shows white circle
- **WHEN** a workspace has an unknown or empty type in the tray menu
- **THEN** the menu entry label SHALL be prefixed with ⚪ followed by a space

### Requirement: Missing workspace path indication in tray menu
The system SHALL visually mark workspaces with invalid or missing paths in the tray menu and prevent them from being opened.

#### Scenario: Missing workspace is disabled and marked
- **WHEN** a workspace's path does not exist on disk (validation returns false)
- **THEN** the menu entry SHALL be disabled (non-clickable)
- **AND** the label SHALL include a ✗ marker between the type emoji and the workspace name (e.g., "🔵 ✗ my-project")

#### Scenario: Valid workspace remains enabled
- **WHEN** a workspace's path exists on disk (validation returns true)
- **THEN** the menu entry SHALL remain enabled and clickable
- **AND** the label SHALL NOT include the ✗ marker

#### Scenario: Remote workspaces are always treated as valid
- **WHEN** a workspace is of a remote type (ssh-remote, dev-container, attached-container, remote)
- **THEN** the workspace SHALL always be shown as enabled without the ✗ marker
- **AND** the system SHALL NOT attempt local path validation for remote workspaces

### Requirement: Path validation during tray refresh
The system SHALL validate workspace paths during each tray menu refresh cycle using the existing backend validation API.

#### Scenario: Paths are validated on periodic refresh
- **WHEN** the tray menu refresh cycle runs (every 30 seconds)
- **THEN** the system SHALL call the backend `POST /api/validate-paths` endpoint with the fetched workspaces
- **AND** the validation results SHALL be used to determine which entries are disabled

#### Scenario: Paths are validated on event-driven refresh
- **WHEN** the tray menu is refreshed due to a `workspaces-changed` event
- **THEN** the system SHALL also validate paths before rebuilding the menu

#### Scenario: Validation failure falls back to all-valid
- **WHEN** the path validation API call fails (network error, backend offline)
- **THEN** all workspaces SHALL be treated as valid (enabled) in the tray menu

### Requirement: Sidecar health status indicator
The system SHALL display the current sidecar backend status in the tray context menu.

#### Scenario: Backend is running
- **WHEN** the sidecar health check succeeds
- **THEN** the tray menu SHALL include a disabled item showing "Backend: Running"
- **AND** this item SHALL appear at the bottom of the menu, below a separator

#### Scenario: Backend is offline
- **WHEN** the sidecar health check fails
- **THEN** the tray menu SHALL include a disabled item showing "Backend: Offline"
- **AND** this item SHALL appear at the bottom of the menu, below a separator

### Requirement: Periodic tray menu refresh
The system SHALL periodically refresh the tray menu content to reflect current workspace and backend state.

#### Scenario: Automatic periodic refresh
- **WHEN** the application is running
- **THEN** the tray menu content SHALL be refreshed every 30 seconds
- **AND** the refresh SHALL fetch current workspace data from the sidecar API

#### Scenario: Event-driven refresh
- **WHEN** the frontend emits a `workspaces-changed` event (after user triggers refresh or deletion)
- **THEN** the tray menu SHALL be rebuilt with updated workspace data

### Requirement: Platform-specific tray click behavior
The system SHALL follow platform conventions for tray icon click interactions.

#### Scenario: macOS left-click behavior
- **WHEN** the user clicks the tray icon on macOS
- **THEN** the context menu SHALL open (standard macOS status menu behavior)

#### Scenario: Windows and Linux left-click behavior
- **WHEN** the user left-clicks the tray icon on Windows or Linux
- **THEN** the main application window SHALL be shown and focused
