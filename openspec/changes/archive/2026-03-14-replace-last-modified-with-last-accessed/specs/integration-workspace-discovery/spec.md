## MODIFIED Requirements

### Requirement: Workspace attributes are extracted correctly
CHANGED: The scanner returns `lastAccessed` (access time of storage directory) instead of `lastModified` (modification time of workspace.json).

#### Scenario: Last accessed time is extracted from storage directory
- **WHEN** a workspace storage directory is scanned
- **THEN** the system SHALL stat the storage directory itself (not workspace.json) and use `atime` as the `lastAccessed` field

#### Scenario: Last accessed time format
- **WHEN** workspace data is returned
- **THEN** the `lastAccessed` field SHALL be an ISO 8601 date string
