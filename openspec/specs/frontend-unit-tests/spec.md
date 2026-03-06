## ADDED Requirements

### Requirement: Dashboard component renders correctly
The Dashboard component MUST render without errors and display the workspace list container.

#### Scenario: Dashboard renders loading state
- **WHEN** Dashboard component mounts with loading state
- **THEN** it SHALL display a loading indicator

#### Scenario: Dashboard renders workspace table
- **WHEN** Dashboard receives workspace data
- **THEN** it SHALL display a table with workspace rows

#### Scenario: Dashboard handles empty workspace list
- **WHEN** Dashboard receives empty workspace array
- **THEN** it SHALL display a "No workspaces found" message

### Requirement: WorkspaceTable component displays workspace data
The WorkspaceTable component MUST render workspace data in tabular format with correct columns.

#### Scenario: WorkspaceTable renders with data
- **WHEN** WorkspaceTable receives workspace array with name, path, and attributes
- **THEN** it SHALL display each workspace in a table row with all column values

#### Scenario: WorkspaceTable handles column visibility toggle
- **WHEN** User toggles column visibility
- **THEN** affected columns SHALL show/hide accordingly without breaking the table

#### Scenario: WorkspaceTable columns are resizable
- **WHEN** User drags column resize handle
- **THEN** column width SHALL update to the new size

### Requirement: Workspace can be opened via click action
The system MUST allow users to open a workspace by clicking a row or open button.

#### Scenario: User clicks workspace row to open
- **WHEN** User clicks on a workspace table row
- **THEN** system SHALL open VS Code with the workspace URI

#### Scenario: User clicks open button
- **WHEN** User clicks the open button on a workspace row
- **THEN** system SHALL open VS Code with the workspace URI

### Requirement: Dark theme styling applies correctly
The application MUST apply dark theme styles to all components.

#### Scenario: Dark theme applied to dashboard
- **WHEN** Dashboard renders with dark theme enabled
- **THEN** all UI elements SHALL use dark theme colors and styling
