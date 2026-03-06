## ADDED Requirements

### Requirement: GET /api/workspaces returns workspace list
The API MUST return a list of discovered workspaces when the /api/workspaces endpoint is called.

#### Scenario: Successful workspace discovery
- **WHEN** Client sends GET request to /api/workspaces
- **THEN** server SHALL return 200 status with JSON array of workspace objects

#### Scenario: Workspace list is empty
- **WHEN** No workspaces are configured
- **THEN** server SHALL return 200 status with empty array []

#### Scenario: Workspace has full attributes
- **WHEN** Workspace exists with name, path, repository, and attributes
- **THEN** returned workspace object SHALL include all these fields

### Requirement: CORS headers are properly configured
The API MUST include appropriate CORS headers for cross-origin requests.

#### Scenario: Preflight OPTIONS request
- **WHEN** Client sends OPTIONS request to /api/workspaces
- **THEN** server SHALL return 200 with CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods)

#### Scenario: GET request includes CORS headers
- **WHEN** Client sends GET request from different origin
- **THEN** response SHALL include Access-Control-Allow-Origin header

### Requirement: API handles errors gracefully
The API MUST return appropriate error responses when errors occur.

#### Scenario: Directory scan fails
- **WHEN** Workspace directory is inaccessible
- **THEN** server SHALL return 500 status with error message

#### Scenario: Invalid workspace path
- **WHEN** Workspace path contains invalid characters
- **THEN** server SHALL either skip the workspace or return it with validation warning
