## 1. Tauri Desktop Application Setup

- [x] 1.1 Initialize Tauri project structure with `npm create tauri-app@latest`
- [x] 1.2 Configure `tauri.conf.json` with app metadata, window settings, and security policies
- [x] 1.3 Set up Content Security Policy allowing connections to `http://localhost:3010`
- [x] 1.4 Configure window properties (min size 1024x768, title "VS Code Workspace Dashboard")
- [x] 1.5 Implement Rust main process with Tauri builder and plugin initialization
- [x] 1.6 Add application menu with standard items (App, Edit, View, Window)
- [x] 1.7 Implement platform-specific menu layouts (macOS global menu vs window-integrated)
- [x] 1.8 Add system tray integration with icon and context menu
- [x] 1.9 Implement window state persistence (size, position, maximized state)
- [x] 1.10 Add window state restoration with off-screen detection and centering
- [x] 1.11 Create error dialog handlers for critical failures
- [x] 1.12 Implement development mode support with hot reload

## 2. Sidecar Node.js Backend Integration

- [x] 2.1 Install and configure `pkg` for Node.js bundling
- [x] 2.2 Create pkg configuration file with build targets
- [ ] 2.3 Build sidecar binaries for macOS (x64, arm64)
- [ ] 2.4 Build sidecar binaries for Linux (x64)
- [ ] 2.5 Build sidecar binaries for Windows (x64)
- [ ] 2.6 Copy sidecar binaries to `src-tauri/binaries/` directory
- [x] 2.7 Configure `tauri.conf.json` externalBin reference for sidecar
- [x] 2.8 Implement sidecar spawning in Rust main process on app startup
- [x] 2.9 Add sidecar port configuration (default 3010, env override SIDECAR_PORT)
- [x] 2.10 Implement health check polling every 5 seconds via `/health` endpoint
- [x] 2.11 Add automatic restart logic with 3-attempt limit within 60 seconds
- [x] 2.12 Implement crash recovery notification to user
- [x] 2.13 Add graceful shutdown with SIGTERM and 5-second timeout
- [x] 2.14 Implement force kill (SIGKILL) for unresponsive sidecar
- [x] 2.15 Configure CORS in Express for Tauri webview origin
- [ ] 2.16 Add sidecar logging to app data directory with rotation (10MB limit)
- [x] 2.17 Implement configurable log levels (LOG_LEVEL env variable)
- [ ] 2.18 Set correct executable permissions for sidecar binaries

## 3. Cross-Platform Path Resolution

- [x] 3.1 Add platform detection using `process.platform` in workspaceScanner.js
- [x] 3.2 Implement macOS path resolution (`~/Library/Application Support/Code/User/workspaceStorage`)
- [x] 3.3 Implement Windows path resolution (`%APPDATA%/Code/User/workspaceStorage`)
- [x] 3.4 Implement Linux path resolution (`~/.config/Code/User/workspaceStorage`)
- [x] 3.5 Add XDG Base Directory compliance for Linux (XDG_CONFIG_HOME support)
- [x] 3.6 Implement WORKSPACES_PATH environment variable override
- [x] 3.7 Add path validation and fallback logic when override path doesn't exist
- [x] 3.8 Implement path normalization for mixed separators
- [x] 3.9 Add relative path resolution to absolute paths
- [x] 3.10 Implement unsupported platform handling with clear error messages
- [x] 3.11 Add FreeBSD/Unix variant support with Linux path logic and warning
- [ ] 3.12 Test path resolution on macOS
- [ ] 3.13 Test path resolution on Windows
- [ ] 3.14 Test path resolution on Linux

## 4. Desktop Build Pipeline

- [x] 4.1 Create `.github/workflows/release.yml` GitHub Actions workflow
- [x] 4.2 Configure workflow trigger on version tags (`v*`)
- [x] 4.3 Set up multi-platform build matrix (macos-latest, ubuntu-latest, windows-latest)
- [x] 4.4 Configure Tauri Action for automated building
- [x] 4.5 Set up Rust dependency caching in workflow
- [x] 4.6 Set up Node.js dependency caching in workflow
- [x] 4.7 Configure macOS code signing secrets (APPLE_CERTIFICATE, APPLE_CERTIFICATE_PASSWORD, etc.)
- [x] 4.8 Configure Windows code signing secrets (WINDOWS_CERTIFICATE, etc.)
- [x] 4.9 Implement conditional signing (skip when secrets unavailable)
- [x] 4.10 Configure auto-updater in `tauri.conf.json` with GitHub Releases endpoint
- [ ] 4.11 Create update manifest format documentation
- [ ] 4.12 Implement automatic update check on startup
- [x] 4.13 Add manual "Check for Updates" menu item
- [x] 4.14 Configure draft release creation with artifact upload
- [x] 4.15 Set up release notes generation from changelog
- [x] 4.16 Implement pre-release build support for beta tags (`v*-beta.*`)
- [ ] 4.17 Test complete build on macOS (x64, arm64)
- [ ] 4.18 Test complete build on Linux (AppImage, deb)
- [ ] 4.19 Test complete build on Windows (msi, exe)
- [ ] 4.20 Verify artifact size is under 10MB target

## 5. Frontend Integration & API Client

- [x] 5.1 Create `src/api/client.js` with Tauri environment detection
- [x] 5.2 Implement Tauri HTTP plugin integration (`@tauri-apps/plugin-http`)
- [x] 5.3 Add fallback to native fetch for browser development mode
- [x] 5.4 Update Dashboard component to use new API client
- [x] 5.5 Add connection error handling with retry logic
- [x] 5.6 Implement loading states during API requests
- [x] 5.7 Add error boundaries for API failures

## 6. Integration & Testing

- [ ] 6.1 Perform end-to-end testing on macOS (full workflow)
- [ ] 6.2 Perform end-to-end testing on Windows (full workflow)
- [ ] 6.3 Perform end-to-end testing on Linux (full workflow)
- [ ] 6.4 Test sidecar crash and recovery scenario
- [ ] 6.5 Test offline/startup failure error handling
- [ ] 6.6 Test window state persistence across restarts
- [ ] 6.7 Test auto-updater functionality
- [ ] 6.8 Verify all existing features work (workspace scanning, quick-open, tooltips)
- [x] 6.9 Update README.md with desktop app installation instructions
- [x] 6.10 Create BUILD.md with developer build instructions
- [x] 6.11 Add troubleshooting section to documentation
- [x] 6.12 Create release checklist document
