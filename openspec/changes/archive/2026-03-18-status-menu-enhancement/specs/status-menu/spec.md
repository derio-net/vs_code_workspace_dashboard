## ADDED Requirements

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

## MODIFIED Requirements

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
