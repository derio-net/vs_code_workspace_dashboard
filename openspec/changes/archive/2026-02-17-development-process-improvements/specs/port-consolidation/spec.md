## CHANGED Requirements

### Requirement: Consistent port configuration

The system SHALL use port 3010 as the default port for all server and Docker container communications.

#### Scenario: Server listens on configured port

- **WHEN** the server starts without PORT environment variable
- **THEN** it SHALL listen on port 3010
- **AND** it SHALL display "Server is running on port 3010" in the console

#### Scenario: Docker container uses consistent port

- **WHEN** the Docker container starts
- **THEN** it SHALL expose port 3010
- **AND** it SHALL be accessible at `http://localhost:3010`

#### Scenario: API client connects to correct port

- **WHEN** the React app makes an API call
- **THEN** it SHALL connect to `http://localhost:3010` by default
- **AND** it SHALL respect the DASHBOARD_PORT environment variable if set

### Requirement: React dev server port configuration

The system SHALL allow configuration of the React dev server port.

#### Scenario: React dev server defaults

- **WHEN** npm run dev:react runs without environment variables
- **THEN** the React dev server SHALL start on port 3020
- **AND** it SHALL display "Compiled successfully!" with localhost:3020 in the console

#### Scenario: Custom React dev server port

- **WHEN** DASHBOARD_DEV_PORT environment variable is set to 3030
- **AND** npm run dev:react runs
- **THEN** the React dev server SHALL start on port 3030

### Requirement: Environment variable support for port configuration

The system SHALL support environment variable configuration of server ports.

#### Scenario: Custom server port via environment variable

- **WHEN** DASHBOARD_PORT environment variable is set to 3040
- **AND** the server starts
- **THEN** it SHALL listen on port 3040

#### Scenario: React dev server respects environment variable

- **WHEN** DASHBOARD_DEV_PORT environment variable is set to 3050
- **AND** npm run dev:react runs
- **THEN** the React dev server SHALL start on port 3050

#### Scenario: Both ports configured via environment variables

- **WHEN** both DASHBOARD_PORT and DASHBOARD_DEV_PORT are set
- **AND** npm run dev runs
- **THEN** the server SHALL listen on the configured DASHBOARD_PORT
- **AND** the React dev server SHALL listen on the configured DASHBOARD_DEV_PORT
