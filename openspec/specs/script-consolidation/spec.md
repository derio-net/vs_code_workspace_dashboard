## CHANGED Requirements

### Requirement: Concurrent development script execution

The system SHALL provide a single development script that runs both the server and React dev server concurrently.

#### Scenario: Start concurrent development servers

- **WHEN** a user runs `npm run dev`
- **THEN** both the Express server and React dev server SHALL start concurrently
- **AND** the terminal output SHALL display both servers' logs with distinct colors

#### Scenario: Start server separately

- **WHEN** a user runs `npm run dev:server`
- **THEN** only the Express server SHALL start on port 3010
- **AND** the server SHALL be accessible at `http://localhost:3010`

#### Scenario: Start React separately

- **WHEN** a user runs `npm run dev:react`
- **THEN** only the React dev server SHALL start on port 3020
- **AND** the server SHALL be accessible at `http://localhost:3020`

### Requirement: Simplified build processes

The system SHALL provide streamlined build scripts that eliminate redundancy.

#### Scenario: Build both frontend and backend

- **WHEN** a user runs `npm run build`
- **THEN** the React app SHALL be built
- **AND** the build artifacts SHALL be copied to the public folder
- **AND** the backend SHALL be built

#### Scenario: Build React app only

- **WHEN** a user runs `npm run build:react`
- **THEN** the React app SHALL be built using react-scripts
- **AND** the build artifacts SHALL be copied to the public folder

#### Scenario: Build sidecar binary

- **WHEN** a user runs `npm run build:sidecar`
- **THEN** the server SHALL be built
- **AND** `pkg` SHALL package the server into a standalone binary
- **AND** the binary SHALL be saved to `src-tauri/binaries/`

### Requirement: Improved Tauri integration

The system SHALL provide Tauri-specific scripts that ensure proper dependencies are built.

#### Scenario: Start Tauri dev mode

- **WHEN** a user runs `npm run tauri:dev`
- **THEN** Tauri SHALL start in development mode
- **AND** the React dev server SHALL be started automatically
- **AND** the Tauri webview SHALL point to `http://localhost:3020`

#### Scenario: Build Tauri production app

- **WHEN** a user runs `npm run tauri:build`
- **THEN** all dependencies SHALL be built
- **AND** the Tauri app SHALL be compiled for production
- **AND** the final executable SHALL be created in `src-tauri/target/release/`
