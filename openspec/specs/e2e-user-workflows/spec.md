## ADDED Requirements

### Requirement: User can view dashboard with workspace list
The user MUST be able to load the dashboard and see the list of available workspaces.

#### Scenario: Dashboard loads successfully
- **WHEN** User navigates to dashboard URL
- **THEN** page SHALL load without errors and display workspace table

#### Scenario: Dashboard shows loading state then workspaces
- **WHEN** Dashboard is loading
- **THEN** loading indicator SHALL be displayed, then replaced with workspace data

#### Scenario: Empty dashboard state
- **WHEN** No workspaces are configured
- **THEN** user SHALL see a message indicating no workspaces found

### Requirement: User can open a workspace
The user MUST be able to open a workspace by interacting with the dashboard.

#### Scenario: User opens workspace via click
- **WHEN** User clicks on a workspace row
- **THEN** VS Code SHALL open with the selected workspace

#### Scenario: User opens workspace via button
- **WHEN** User clicks the open button for a workspace
- **THEN** VS Code SHALL open with the selected workspace

### Requirement: User can toggle column visibility
The user MUST be able to show/hide table columns.

#### Scenario: Column visibility menu opens
- **WHEN** User clicks column visibility toggle
- **THEN** menu SHALL appear with column options

#### Scenario: User hides a column
- **WHEN** User unchecks a column in the visibility menu
- **THEN** that column SHALL disappear from the table

#### Scenario: User shows a hidden column
- **WHEN** User checks a hidden column in the visibility menu
- **THEN** that column SHALL reappear in the table

### Requirement: User can resize table columns
The user MUST be able to resize table columns by dragging.

#### Scenario: Column resize works
- **WHEN** User drags column resize handle
- **THEN** column width SHALL update to the new size

### Requirement: Dark theme is applied correctly
The user MUST see the dark theme styling applied to all UI elements.

#### Scenario: Dark theme colors are applied
- **WHEN** Dashboard renders with dark theme
- **THEN** background, text, and accent colors SHALL use dark theme palette
