## ADDED Requirements

### Requirement: Platform detection
The system SHALL detect the current operating system platform at runtime to determine the correct VS Code workspace storage path.

#### Scenario: Detect macOS platform
- **WHEN** the application runs on macOS
- **THEN** `process.platform` SHALL return `'darwin'`
- **AND** the system SHALL use the macOS-specific path logic

#### Scenario: Detect Windows platform
- **WHEN** the application runs on Windows
- **THEN** `process.platform` SHALL return `'win32'`
- **AND** the system SHALL use the Windows-specific path logic

#### Scenario: Detect Linux platform
- **WHEN** the application runs on Linux
- **THEN** `process.platform` SHALL return `'linux'`
- **AND** the system SHALL use the Linux-specific path logic

### Requirement: macOS workspace storage path
The system SHALL locate VS Code workspace storage at the macOS-specific path when running on macOS.

#### Scenario: Default macOS path resolution
- **WHEN** the application runs on macOS
- **THEN** the workspace storage path SHALL resolve to `~/Library/Application Support/Code/User/workspaceStorage`
- **AND** the path SHALL be constructed using `os.homedir()` for the home directory

#### Scenario: Path exists validation
- **WHEN** the macOS path is resolved
- **THEN** the system SHALL verify the directory exists
- **AND** if the directory does not exist, an appropriate error SHALL be logged

### Requirement: Windows workspace storage path
The system SHALL locate VS Code workspace storage at the Windows-specific path when running on Windows.

#### Scenario: Default Windows path resolution
- **WHEN** the application runs on Windows
- **THEN** the workspace storage path SHALL resolve to `%APPDATA%\Code\User\workspaceStorage`
- **AND** the path SHALL be constructed using `process.env.APPDATA` or `os.homedir()` with `AppData/Roaming`

#### Scenario: Windows path with spaces
- **WHEN** the Windows path contains spaces (e.g., user profile with space)
- **THEN** the path SHALL be properly handled without escaping issues
- **AND** file operations SHALL work correctly

### Requirement: Linux workspace storage path
The system SHALL locate VS Code workspace storage at the Linux-specific path when running on Linux.

#### Scenario: Default Linux path resolution
- **WHEN** the application runs on Linux
- **THEN** the workspace storage path SHALL resolve to `~/.config/Code/User/workspaceStorage`
- **AND** the path SHALL be constructed using `os.homedir()` with `.config`

#### Scenario: XDG Base Directory compliance
- **WHEN** the `XDG_CONFIG_HOME` environment variable is set
- **THEN** the system SHALL use `$XDG_CONFIG_HOME/Code/User/workspaceStorage` instead of the default
- **AND** if not set, fall back to `~/.config`

### Requirement: Environment variable override
The system SHALL support an environment variable to override the default workspace storage path for all platforms.

#### Scenario: Override with WORKSPACES_PATH
- **WHEN** the `WORKSPACES_PATH` environment variable is set
- **THEN** the system SHALL use the specified path instead of the platform-default path
- **AND** the override SHALL take precedence over platform detection

#### Scenario: Override path validation
- **WHEN** the override path is specified but does not exist
- **THEN** the system SHALL log a warning
- **AND** attempt to use the platform-default path as fallback

### Requirement: Path normalization
The system SHALL normalize all paths to ensure consistent behavior across platforms.

#### Scenario: Path separators normalization
- **WHEN** a path contains mixed path separators
- **THEN** the system SHALL normalize them to the platform-appropriate separator
- **AND** the normalized path SHALL be used for all file operations

#### Scenario: Relative path resolution
- **WHEN** a path contains relative components (e.g., `../` or `./`)
- **THEN** the system SHALL resolve them to absolute paths
- **AND** symlinks in the path SHALL be resolved

### Requirement: Unsupported platform handling
The system SHALL gracefully handle unsupported platforms with clear error messages.

#### Scenario: Unknown platform detection
- **WHEN** the application runs on an unsupported platform
- **THEN** an error SHALL be thrown with message `Unsupported platform: {platform}`
- **AND** the application SHALL display a user-friendly error dialog

#### Scenario: FreeBSD or other Unix variants
- **WHEN** the application runs on FreeBSD or other Unix-like systems
- **THEN** the system SHALL attempt to use the Linux path logic
- **AND** log a warning that the platform is not officially supported

### Requirement: VS Code variants support (future)
The system SHALL be designed to support VS Code variants (Insiders, OSS) with minimal changes.

#### Scenario: VS Code Insiders path on macOS
- **WHEN** support for VS Code Insiders is added
- **THEN** the path SHALL be `~/Library/Application Support/Code - Insiders/User/workspaceStorage`
- **AND** the implementation SHALL use a configurable application name

#### Scenario: VS Code OSS path on Linux
- **WHEN** support for VS Code OSS is added
- **THEN** the path SHALL be `~/.config/Code - OSS/User/workspaceStorage`
- **AND** the implementation SHALL use a configurable application name
