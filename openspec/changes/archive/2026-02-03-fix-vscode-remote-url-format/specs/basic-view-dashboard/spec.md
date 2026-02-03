# basic-view-dashboard Delta Specification

## MODIFIED Requirements

### Requirement: Display dashboard UI
The system SHALL serve a web-based dashboard that displays all workspaces in a user-friendly format with correctly formatted remote workspace URIs.

#### Scenario: Dashboard loads successfully
- **WHEN** a user navigates to http://localhost:3000
- **THEN** the dashboard UI loads and displays a list of all workspaces

#### Scenario: Dashboard displays workspace information
- **WHEN** the dashboard is loaded
- **THEN** each workspace is displayed with its name, path, and last modified date in a sortable table

#### Scenario: Remote workspace links use correct VS Code URI format
- **WHEN** the dashboard displays a remote workspace (SSH, dev container, or attached container)
- **THEN** the workspace link uses the `vscode://vscode-remote/` format instead of `vscode-remote://`

## ADDED Requirements

### Requirement: Workspace links open in VS Code
The system SHALL generate clickable workspace links that open the workspace in VS Code using the appropriate protocol handler.

#### Scenario: Local workspace link opens in VS Code
- **WHEN** a user clicks on a local workspace link
- **THEN** VS Code opens the workspace at the specified file path

#### Scenario: Remote workspace link opens in VS Code
- **WHEN** a user clicks on a remote workspace link (SSH, dev container, or attached container)
- **THEN** VS Code opens the remote workspace using the correct `vscode://vscode-remote/` protocol format

#### Scenario: Remote workspace link is correctly formatted
- **WHEN** a remote workspace is displayed in the dashboard
- **THEN** the href attribute uses the `vscode://vscode-remote/` format that VS Code recognizes
