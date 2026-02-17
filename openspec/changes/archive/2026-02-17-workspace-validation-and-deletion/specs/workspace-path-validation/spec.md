## ADDED Requirements

### Requirement: Validate local workspace paths
The system SHALL validate that local workspace paths exist on the filesystem and provide visual feedback for invalid paths.

#### Scenario: Valid local workspace path
- **WHEN** the dashboard loads local workspaces
- **AND** a workspace path exists on the filesystem
- **THEN** the workspace row SHALL display with normal styling

#### Scenario: Invalid local workspace path
- **WHEN** the dashboard loads local workspaces
- **AND** a workspace path does not exist on the filesystem
- **THEN** the workspace row SHALL display with a red background color

#### Scenario: Remote workspaces are not validated
- **WHEN** the dashboard loads remote workspaces (URLs starting with http://, https://, or vscode://)
- **THEN** the system SHALL NOT perform filesystem validation
- **AND** the workspace row SHALL display with normal styling

### Requirement: Path validation API
The system SHALL provide a backend API endpoint to check path existence.

#### Scenario: Check single path existence
- **WHEN** a POST request is made to `/api/validate-path` with a path parameter
- **THEN** the system SHALL return `{ exists: true }` if the path exists
- **AND** return `{ exists: false }` if the path does not exist

#### Scenario: Batch path validation
- **WHEN** a POST request is made to `/api/validate-paths` with an array of paths
- **THEN** the system SHALL return an array of results with path and exists status for each
