## MODIFIED Requirements

### Requirement: Dynamic workspace quick-access menu
CHANGED: Workspaces in the tray menu are sorted by last-accessed time instead of last-modified time.

#### Scenario: Recent workspaces are shown in the menu
- **WHEN** the user opens the tray context menu
- **THEN** the menu SHALL display up to 5 of the most recently accessed workspaces by name
- **AND** the workspace entries SHALL appear above the standard menu items (Show Dashboard, Check for Updates, Quit)
- **AND** a separator SHALL divide the workspace entries from the standard items
