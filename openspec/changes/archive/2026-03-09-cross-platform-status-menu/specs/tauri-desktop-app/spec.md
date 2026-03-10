## MODIFIED Requirements

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
