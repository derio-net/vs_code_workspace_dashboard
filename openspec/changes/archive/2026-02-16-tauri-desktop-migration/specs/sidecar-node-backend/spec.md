## ADDED Requirements

### Requirement: Node.js backend packaging
The system SHALL package the Node.js/Express backend as a standalone executable using `pkg` to eliminate the Node.js runtime dependency for end users.

#### Scenario: Backend is compiled to executable
- **WHEN** the build process runs
- **THEN** the `server/index.js` and its dependencies SHALL be compiled into platform-specific executables
- **AND** the output SHALL be named `sidecar-vscode-dashboard-{platform}-{arch}`

#### Scenario: Executable includes all dependencies
- **WHEN** the sidecar executable runs
- **THEN** it SHALL function without Node.js installed on the target system
- **AND** all required modules including `express` and workspace scanning logic SHALL be included

#### Scenario: Multiple platform targets
- **WHEN** the build process completes
- **THEN** executables SHALL be generated for: macOS (x64, arm64), Linux (x64), and Windows (x64)

### Requirement: Sidecar spawning and lifecycle management
The system SHALL spawn the sidecar process on application startup and manage its entire lifecycle including startup, monitoring, and shutdown.

#### Scenario: Sidecar spawns successfully
- **WHEN** the Tauri application initializes
- **THEN** the system SHALL spawn the sidecar binary as a subprocess
- **AND** the sidecar SHALL bind to `127.0.0.1:3010`
- **AND** the sidecar SHALL be ready to accept requests within 5 seconds

#### Scenario: Sidecar startup failure handling
- **WHEN** the sidecar fails to start
- **THEN** the system SHALL retry up to 3 times with exponential backoff
- **AND** if all retries fail, an error dialog SHALL be shown to the user

#### Scenario: Sidecar port configuration
- **WHEN** the sidecar starts
- **THEN** it SHALL use port 3010 by default
- **AND** the port SHALL be configurable via environment variable `SIDECAR_PORT`

### Requirement: Health monitoring and crash recovery
The system SHALL monitor the sidecar process health and automatically restart it if it becomes unresponsive or crashes.

#### Scenario: Health check polling
- **WHEN** the sidecar is running
- **THEN** the system SHALL poll the `/health` endpoint every 5 seconds
- **AND** if the endpoint responds with HTTP 200, the sidecar is considered healthy

#### Scenario: Automatic restart on crash
- **WHEN** the sidecar process crashes or becomes unresponsive
- **THEN** the system SHALL automatically attempt to restart it
- **AND** the restart SHALL be limited to 3 attempts within 60 seconds

#### Scenario: Crash recovery notification
- **WHEN** the sidecar is restarted due to a crash
- **THEN** a notification SHALL be displayed to the user indicating the backend was restarted
- **AND** the dashboard SHALL automatically reconnect to the new sidecar instance

### Requirement: Graceful shutdown
The system SHALL gracefully terminate the sidecar process when the application exits.

#### Scenario: Clean shutdown on app exit
- **WHEN** the user closes the application
- **THEN** the system SHALL send a SIGTERM signal to the sidecar
- **AND** wait up to 5 seconds for graceful termination

#### Scenario: Force kill on unresponsive sidecar
- **WHEN** the sidecar does not terminate within 5 seconds of SIGTERM
- **THEN** the system SHALL send a SIGKILL signal to force termination
- **AND** the application SHALL exit regardless of sidecar state

### Requirement: Inter-process communication
The system SHALL enable communication between the Tauri frontend and the Node.js sidecar via HTTP requests.

#### Scenario: Frontend can reach sidecar API
- **WHEN** the frontend makes a request to `http://localhost:3010/api/workspaces`
- **THEN** the sidecar SHALL receive and process the request
- **AND** return the workspace data as JSON

#### Scenario: CORS is properly configured
- **WHEN** the frontend running in Tauri webview makes API requests
- **THEN** CORS headers SHALL allow requests from the webview origin
- **AND** preflight requests SHALL be handled correctly

### Requirement: Sidecar logging
The system SHALL capture and manage logs from the sidecar process for debugging purposes.

#### Scenario: Logs are captured to file
- **WHEN** the sidecar process runs
- **THEN** stdout and stderr SHALL be redirected to log files in the app data directory
- **AND** log files SHALL be rotated when they exceed 10MB

#### Scenario: Log levels are configurable
- **WHEN** the application starts with `LOG_LEVEL=debug` environment variable
- **THEN** the sidecar SHALL output debug-level logs
- **AND** by default, only info and above SHALL be logged

### Requirement: Sidecar binary distribution
The system SHALL bundle the sidecar binary with the Tauri application for each target platform.

#### Scenario: Binary is included in app bundle
- **WHEN** the Tauri application is built
- **THEN** the appropriate sidecar binary SHALL be included in `src-tauri/binaries/`
- **AND** the binary SHALL be referenced in `tauri.conf.json` under `bundle.externalBin`

#### Scenario: Binary permissions are correct
- **WHEN** the application is installed on macOS/Linux
- **THEN** the sidecar binary SHALL have executable permissions
- **AND** on Windows, the `.exe` extension SHALL be present
