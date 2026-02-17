## CHANGED Requirements

### Requirement: Simplified environment variable structure

The system SHALL use a minimal set of environment variables for configuration.

#### Scenario: Standard port variable

- **WHEN** the server starts
- **THEN** it SHALL use DASHBOARD_PORT if provided
- **AND** it SHALL fall back to 3010 if DASHBOARD_PORT is not set

#### Scenario: React dev server port variable

- **WHEN** the React dev server starts
- **THEN** it SHALL use DASHBOARD_DEV_PORT if provided
- **AND** it SHALL fall back to 3020 if DASHBOARD_DEV_PORT is not set

#### Scenario: Legacy PORT variable support removed

- **WHEN** PORT environment variable is set
- **THEN** it SHALL NOT affect the server's default port
- **AND** the server SHALL continue to use DASHBOARD_PORT or 3010

### Requirement: Environment variable documentation

The system SHALL provide clear documentation of environment variables.

#### Scenario: Example environment file includes all variables

- **WHEN** a user views .env.example
- **THEN** it SHALL include DASHBOARD_PORT=3010
- **AND** it SHALL include DASHBOARD_DEV_PORT=3020
- **AND** it SHALL NOT include the legacy PORT variable

#### Scenario: Environment variable validation

- **WHEN** invalid port values are provided
- **THEN** the system SHALL fall back to the default values
- **AND** it SHALL log a warning message

### Requirement: Consistency across all environments

The system SHALL use the same environment variable names across all platforms and deployment scenarios.

#### Scenario: Docker container respects environment variables

- **WHEN** DASHBOARD_PORT is set in Docker environment
- **THEN** the container SHALL expose the specified port
- **AND** the server SHALL listen on the configured port

#### Scenario: Tauri app respects environment variables

- **WHEN** DASHBOARD_PORT is set during Tauri development
- **THEN** the sidecar server SHALL listen on the specified port

#### Scenario: Development and production consistency

- **WHEN** the same environment variables are set in development and production
- **THEN** the server SHALL behave consistently across both environments
