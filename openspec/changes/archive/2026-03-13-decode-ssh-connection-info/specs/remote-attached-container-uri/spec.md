## MODIFIED Requirements

### Requirement: SSH host extraction from remotely-attached container URIs
The system SHALL extract the SSH host name from attached-container workspace URIs that include an `@ssh-remote%2B<host>` authority segment. When the host segment is a hex-encoded JSON blob, the system SHALL decode it and extract structured connection information.

#### Scenario: Attached container on remote SSH host with plain hostname
- **WHEN** a workspace has type `attached-container` and its path contains `@ssh-remote%2B<host>` with a plain hostname
- **THEN** the CONNECTION column SHALL display the decoded host name (e.g., `dev-server-01`)

#### Scenario: Attached container on remote SSH host with hex-encoded JSON host
- **WHEN** a workspace has type `attached-container` and its path contains `@ssh-remote%2B<hex>` where the hex string starts with `7b22`
- **THEN** the system SHALL hex-decode and JSON-parse the host string and display connection info in `user@host:port` format

#### Scenario: Attached container without SSH remote
- **WHEN** a workspace has type `attached-container` and its path does NOT contain `@ssh-remote%2B`
- **THEN** the CONNECTION column SHALL remain empty

#### Scenario: SSH host with URL-encoded characters
- **WHEN** the SSH host portion contains URL-encoded characters (e.g., `%2E` for `.`)
- **THEN** the extracted host name SHALL be URL-decoded before display

#### Scenario: Hex decode failure on attached container host
- **WHEN** the host segment in an attached-container URI starts with `7b22` but cannot be decoded
- **THEN** the CONNECTION column SHALL display an error indicator with the raw value in tooltip
