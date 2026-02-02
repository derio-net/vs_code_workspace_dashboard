# Environment Configuration Specification

## ADDED Requirements

### Requirement: Application supports PORT environment variable
The system SHALL read the PORT environment variable to determine which port the server listens on.

#### Scenario: Default port is used when PORT is not set
- **WHEN** the application starts without PORT environment variable
- **THEN** the server listens on port 3000

#### Scenario: Custom port is used when PORT is set
- **WHEN** the application starts with PORT=8080
- **THEN** the server listens on port 8080

#### Scenario: PORT value is validated
- **WHEN** the application starts with an invalid PORT value
- **THEN** the application logs an error and uses the default port

### Requirement: Application supports HOST environment variable
The system SHALL read the HOST environment variable to determine which network interface the server binds to.

#### Scenario: Default host is localhost in development
- **WHEN** the application starts without HOST environment variable
- **THEN** the server binds to 127.0.0.1 (localhost only)

#### Scenario: Custom host is used when HOST is set
- **WHEN** the application starts with HOST=0.0.0.0
- **THEN** the server binds to 0.0.0.0 (all network interfaces)

#### Scenario: HOST value is validated
- **WHEN** the application starts with an invalid HOST value
- **THEN** the application logs an error and uses the default host

### Requirement: Application supports WORKSPACES_PATH environment variable
The system SHALL read the WORKSPACES_PATH environment variable to determine where to scan for VS Code workspaces.

#### Scenario: Default workspace path is used when WORKSPACES_PATH is not set
- **WHEN** the application starts without WORKSPACES_PATH environment variable
- **THEN** the workspace scanner uses the default path (typically user's home directory)

#### Scenario: Custom workspace path is used when WORKSPACES_PATH is set
- **WHEN** the application starts with WORKSPACES_PATH=/custom/path
- **THEN** the workspace scanner scans for workspaces in /custom/path

#### Scenario: WORKSPACES_PATH is validated
- **WHEN** the application starts with a non-existent WORKSPACES_PATH
- **THEN** the application logs a warning and continues with default path

### Requirement: NODE_ENV is set to production in Docker
The system SHALL set NODE_ENV=production when running in Docker to optimize performance.

#### Scenario: NODE_ENV is production in Docker
- **WHEN** the application runs in a Docker container
- **THEN** NODE_ENV environment variable is set to "production"

#### Scenario: NODE_ENV affects application behavior
- **WHEN** NODE_ENV=production is set
- **THEN** the application disables development features and optimizes for performance

### Requirement: Environment variables can be configured via .env file
The system SHALL support loading environment variables from a .env file in the project root.

#### Scenario: .env file is loaded by docker-compose
- **WHEN** a .env file exists in the project root
- **THEN** docker-compose loads variables from the .env file

#### Scenario: Environment variables in .env override defaults
- **WHEN** .env file contains PORT=8080 and WORKSPACES_PATH=/data/workspaces
- **THEN** the application uses these values instead of defaults

#### Scenario: Missing .env file does not cause errors
- **WHEN** no .env file exists
- **THEN** the application uses default values and continues normally
