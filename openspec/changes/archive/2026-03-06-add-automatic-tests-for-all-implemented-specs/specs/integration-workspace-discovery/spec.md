## ADDED Requirements

### Requirement: Workspace scanner discovers all configured workspaces
The workspace scanner MUST discover all workspaces from configured directories.

#### Scenario: Multiple workspace directories configured
- **WHEN** Multiple workspace directories are configured in config
- **THEN** scanner SHALL find workspaces in all directories and combine results

#### Scenario: Workspace files are .code-workspace format
- **WHEN** Directory contains .code-workspace files
- **THEN** scanner SHALL identify them as valid workspaces

#### Scenario: Direct folder workspaces
- **WHEN** Directory contains folders (not .code-workspace files)
- **THEN** scanner SHALL treat each folder as a potential workspace

### Requirement: Workspace paths are validated before returning
The system MUST validate workspace paths exist and are accessible.

#### Scenario: Valid workspace path
- **WHEN** Workspace path points to existing directory
- **THEN** workspace SHALL be included in results with valid flag

#### Scenario: Invalid workspace path (deleted/moved)
- **WHEN** Workspace path points to non-existent directory
- **THEN** workspace SHALL either be excluded or marked as invalid

### Requirement: VS Code Remote URI is correctly generated
The system MUST generate correct VS Code Remote URIs for remote containers.

#### Scenario: Local workspace URI
- **WHEN** Workspace is local (not remote)
- **THEN** URI SHALL be file:// format pointing to local path

#### Scenario: SSH remote host with container
- **WHEN** Workspace is on SSH host with container
- **THEN** URI SHALL be vscode-remote:// format with ssh-remote+container scheme

### Requirement: Workspace attributes are extracted correctly
The system MUST extract workspace attributes from configuration files.

#### Scenario: Repository attribute extraction
- **WHEN** Workspace contains git repository
- **THEN** repository URL SHALL be extracted and displayed

#### Scenario: Custom attributes from config
- **WHEN** Workspace has custom attributes in config
- **THEN** those attributes SHALL be included in workspace data
