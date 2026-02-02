# Workspace Volume Mounting Specification

## ADDED Requirements

### Requirement: Host workspaces directory is mounted as Docker volume
The system SHALL mount the host's VS Code workspaces directory into the container at /workspaces.

#### Scenario: Volume mount is configured in docker-compose
- **WHEN** docker-compose.yml is parsed
- **THEN** a volume mount is defined mapping host workspaces to /workspaces in the container

#### Scenario: Host path is parameterized
- **WHEN** WORKSPACES_PATH environment variable is set
- **THEN** the volume mount uses the specified host path

#### Scenario: Default host path is used when not specified
- **WHEN** WORKSPACES_PATH is not set
- **THEN** the volume mount uses a default path (e.g., $HOME/.vscode/extensions or similar)

### Requirement: Container can read workspace files from mounted volume
The system SHALL ensure the application can access and read workspace files from the mounted volume.

#### Scenario: Workspace scanner finds workspaces in mounted volume
- **WHEN** the application starts with a mounted workspaces volume
- **THEN** the workspace scanner successfully discovers workspaces in /workspaces

#### Scenario: Workspace metadata is accessible
- **WHEN** the application queries the /api/workspaces endpoint
- **THEN** workspace information from the mounted volume is returned

#### Scenario: File permissions are preserved
- **WHEN** workspace files are accessed from the mounted volume
- **THEN** the application can read files with appropriate permissions

### Requirement: Volume mount path is configurable
The system SHALL allow the host path to be configured without rebuilding the Docker image.

#### Scenario: Host path can be changed via .env file
- **WHEN** WORKSPACES_PATH=/data/workspaces is set in .env
- **THEN** docker-compose mounts /data/workspaces from the host

#### Scenario: Different paths can be used for different deployments
- **WHEN** multiple docker-compose instances are running
- **THEN** each can use a different WORKSPACES_PATH without conflicts

#### Scenario: Relative paths are supported
- **WHEN** WORKSPACES_PATH=./workspaces is set
- **THEN** docker-compose resolves the path relative to the docker-compose.yml location

### Requirement: Volume mount does not require write access
The system SHALL support read-only volume mounts for security.

#### Scenario: Volume can be mounted as read-only
- **WHEN** docker-compose is configured with read-only volume mount
- **THEN** the container can read workspace files but cannot modify them

#### Scenario: Application functions correctly with read-only volume
- **WHEN** the volume is mounted as read-only
- **THEN** the workspace scanner and API continue to function normally

### Requirement: Container user has appropriate permissions for volume access
The system SHALL ensure the container process has sufficient permissions to read the mounted volume.

#### Scenario: Container user can read mounted files
- **WHEN** the container starts with a mounted volume
- **THEN** the Node.js process can read files from the mounted directory

#### Scenario: Permission errors are handled gracefully
- **WHEN** the container lacks read permissions on the mounted volume
- **THEN** the application logs a clear error message and continues with limited functionality
