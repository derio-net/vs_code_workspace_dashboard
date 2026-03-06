## ADDED Requirements

### Requirement: SSH host extraction from remotely-attached container URIs
The system SHALL extract the SSH host name from attached-container workspace URIs that include an `@ssh-remote%2B<host>` authority segment.

#### Scenario: Attached container on remote SSH host
- **WHEN** a workspace has type `attached-container` and its path contains `@ssh-remote%2B<host>`
- **THEN** the SSH Host column SHALL display the decoded host name (e.g., `dev-server-01`)

#### Scenario: Attached container without SSH remote
- **WHEN** a workspace has type `attached-container` and its path does NOT contain `@ssh-remote%2B`
- **THEN** the SSH Host column SHALL remain empty

#### Scenario: SSH host with URL-encoded characters
- **WHEN** the SSH host portion contains URL-encoded characters (e.g., `%2E` for `.`)
- **THEN** the extracted host name SHALL be URL-decoded before display

### Requirement: Clean path extraction from remotely-attached container URIs
The system SHALL extract the filesystem path from attached-container URIs that use the `@ssh-remote%2B<host>/<path>` format.

#### Scenario: Path after SSH host authority
- **WHEN** a workspace has path `vscode-remote://attached-container%2B<json>@ssh-remote%2B<host>/<path>`
- **THEN** the Path column SHALL display `/<path>` (e.g., `/opt/bo`)

#### Scenario: Local attached container path extraction unchanged
- **WHEN** a workspace has type `attached-container` and its path does NOT contain `@ssh-remote%2B`
- **THEN** the path extraction SHALL continue using the existing `+<hex>/<path>` pattern

### Requirement: Sorting by SSH host includes remotely-attached containers
The system SHALL include remotely-attached container SSH hosts when sorting by the SSH Host column.

#### Scenario: Sort by SSH Host groups remote containers with SSH remotes
- **WHEN** the user sorts by the SSH Host column
- **THEN** remotely-attached containers SHALL sort alongside SSH Remote workspaces by their extracted host name
