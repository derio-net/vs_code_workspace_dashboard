# basic-view-dashboard Specification - Delta

## MODIFIED Requirements

### Requirement: Webserver listens on localhost
The system SHALL run a webserver that listens on a configurable host and port. When running locally (not in Docker), it SHALL listen on localhost (127.0.0.1) on a configurable port (default 3000) and not be accessible from external networks. When running in Docker, it SHALL listen on 0.0.0.0 to accept connections from any network interface.

#### Scenario: Server starts successfully on localhost in development
- **WHEN** the application is started locally without HOST environment variable
- **THEN** the webserver listens on http://localhost:3000

#### Scenario: Server starts successfully on all interfaces in Docker
- **WHEN** the application is started in Docker with HOST=0.0.0.0
- **THEN** the webserver listens on 0.0.0.0:3000 and accepts connections from any network interface

#### Scenario: Server rejects external connections in development mode
- **WHEN** the application is started locally without HOST environment variable
- **THEN** the connection is rejected or the server only binds to localhost

#### Scenario: Server accepts external connections in Docker mode
- **WHEN** the application is started in Docker with HOST=0.0.0.0
- **THEN** external clients can connect to the server on the configured port

#### Scenario: Custom port is used when PORT is set
- **WHEN** the application is started with PORT=8080
- **THEN** the webserver listens on the specified port (localhost:8080 or 0.0.0.0:8080 depending on HOST)
