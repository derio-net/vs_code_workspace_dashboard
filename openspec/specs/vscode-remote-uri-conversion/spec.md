# vscode-remote-uri-conversion Specification

## Purpose
TBD - created by archiving change fix-vscode-remote-url-format. Update Purpose after archive.
## Requirements
### Requirement: Transform vscode-remote URIs to vscode protocol format
The system SHALL convert workspace URIs that start with `vscode-remote://` to the format `vscode://vscode-remote/` to ensure VS Code correctly recognizes and opens remote workspaces.

#### Scenario: SSH remote workspace URI is transformed
- **WHEN** a workspace with type `ssh-remote` has a URI starting with `vscode-remote://ssh-remote`
- **THEN** the URI is transformed to `vscode://vscode-remote/ssh-remote` with all path components preserved

#### Scenario: Dev container workspace URI is transformed
- **WHEN** a workspace with type `dev-container` has a URI starting with `vscode-remote://dev-container`
- **THEN** the URI is transformed to `vscode://vscode-remote/dev-container` with all path components preserved

#### Scenario: Attached container workspace URI is transformed
- **WHEN** a workspace with type `attached-container` has a URI starting with `vscode-remote://attached-container`
- **THEN** the URI is transformed to `vscode://vscode-remote/attached-container` with all path components preserved

### Requirement: Preserve URI encoding and path components
The system SHALL preserve all URL encoding and path components during the URI transformation to maintain workspace identity and special character handling.

#### Scenario: Special characters in path are preserved
- **WHEN** a remote workspace URI contains URL-encoded special characters (e.g., %20 for space)
- **THEN** the encoding is preserved in the transformed URI

#### Scenario: Path separators and identifiers are maintained
- **WHEN** a remote workspace URI contains path separators and remote identifiers (e.g., ssh-remote+<host>)
- **THEN** all path components and identifiers are preserved exactly in the transformed URI

### Requirement: Local workspaces remain unchanged
The system SHALL NOT modify URIs for local file workspaces; only remote workspace URIs starting with `vscode-remote://` shall be transformed.

#### Scenario: Local file URI is not transformed
- **WHEN** a workspace has type `local` with a URI starting with `file://`
- **THEN** the URI is returned unchanged

#### Scenario: Unknown workspace type is not transformed
- **WHEN** a workspace has type `unknown` or an unrecognized format
- **THEN** the URI is returned unchanged

