## MODIFIED Requirements

### Requirement: Display SSH Host for remote workspaces
The system SHALL extract and display connection information for SSH remote workspaces in a dedicated "CONNECTION" column (renamed from "SSH Host"). When the host identifier is a hex-encoded JSON blob, the system SHALL decode it and present structured connection details in `user@host:port` format, omitting absent fields.

#### Scenario: Plain hostname is displayed in CONNECTION column
- **WHEN** a workspace is of type `ssh-remote` with a plain hostname in the URI (e.g., `ssh-remote%2Braspi-clawdia-lab`)
- **THEN** the CONNECTION column SHALL display the hostname as-is (e.g., `raspi-clawdia-lab`)

#### Scenario: Hex-encoded JSON host is decoded and displayed
- **WHEN** a workspace URI contains a hex-encoded JSON host blob (starting with `7b22`)
- **THEN** the system SHALL hex-decode the string, parse the JSON, and display connection info in `user@host:port` format

#### Scenario: Hex-encoded host with only hostName field
- **WHEN** the decoded JSON contains only a `hostName` field (no `user` or `port`)
- **THEN** the CONNECTION column SHALL display just the hostname (e.g., `build-server-01`)

#### Scenario: Hex-encoded host with hostName and user
- **WHEN** the decoded JSON contains `hostName` and `user` fields
- **THEN** the CONNECTION column SHALL display `user@host` format (e.g., `root@build-server-01`)

#### Scenario: Hex-encoded host with hostName, user, and port
- **WHEN** the decoded JSON contains `hostName`, `user`, and `port` fields
- **THEN** the CONNECTION column SHALL display `user@host:port` format (e.g., `root@build-server-01:2222`)

#### Scenario: Hex decoding or JSON parsing fails
- **WHEN** the host string starts with `7b22` but cannot be decoded as valid hex or parsed as valid JSON
- **THEN** the CONNECTION column SHALL display an error indicator (e.g., `⚠ decode error`)
- **AND** the raw hex string SHALL be available in the element's title attribute (tooltip)

#### Scenario: CONNECTION column is empty for non-SSH workspaces
- **WHEN** a workspace is not of type `ssh-remote` and does not contain `@ssh-remote%2B` in its path
- **THEN** the CONNECTION column SHALL be empty for that workspace

#### Scenario: SSH host with complex identifiers is parsed correctly
- **WHEN** a workspace URI contains complex SSH identifiers (e.g., `ssh-remote+user@host:port`)
- **THEN** the CONNECTION column SHALL display the host identifier correctly

### Requirement: Display workspace path for all workspace types
The system SHALL display the workspace path in a dedicated "Path" column, with content varying by workspace type.

#### Scenario: Local workspace path is displayed
- **WHEN** a workspace is of type `local` with URI `vscode://file/Users/user/projects/myproject`
- **THEN** the Path column displays `/Users/user/projects/myproject`

#### Scenario: SSH remote path is displayed
- **WHEN** a workspace is of type `ssh-remote` with URI `vscode://vscode-remote/ssh-remote+host@/home/user/project`
- **THEN** the Path column displays `/home/user/project`

#### Scenario: Dev container path is displayed
- **WHEN** a workspace is of type `dev-container` with URI `vscode://vscode-remote/dev-container+<container-id>/workspace`
- **THEN** the Path column displays the workspace path from the URI

#### Scenario: Attached container path is displayed
- **WHEN** a workspace is of type `attached-container` with URI `vscode://vscode-remote/attached-container+<id>@ssh-remote+host@/path`
- **THEN** the Path column displays `/path`

### Requirement: Handle missing or malformed attributes gracefully
The system SHALL display empty values for attributes that cannot be extracted or are not applicable to the workspace type.

#### Scenario: Missing SSH host shows empty cell
- **WHEN** a workspace URI is malformed or missing SSH host information
- **THEN** the CONNECTION column SHALL display an empty string

#### Scenario: Missing path shows empty cell
- **WHEN** a workspace URI is malformed or missing path information
- **THEN** the Path column displays an empty string

## RENAMED Requirements

### Requirement: Display SSH Host for remote workspaces
- **FROM:** SSH Host
- **TO:** CONNECTION
