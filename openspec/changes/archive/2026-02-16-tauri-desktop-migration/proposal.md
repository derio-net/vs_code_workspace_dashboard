## Why

The VS Code Workspace Dashboard currently runs as a web application requiring users to manually start a Node.js server. This creates friction for non-technical users and limits adoption. A desktop application would provide a seamless, one-click experience while dramatically reducing bundle size compared to Electron-based alternatives (target <10 MB vs 180+ MB).

## What Changes

- **Migrate from web app to desktop application** using Tauri framework
- **Implement sidecar pattern** to run existing Node.js/Express backend as a subprocess
- **Add cross-platform support** for macOS, Linux, and Windows
- **Update workspaceScanner.js** to detect and use platform-specific VS Code workspace storage paths:
  - Windows: `%APPDATA%\Code\User\workspaceStorage`
  - macOS: `~/Library/Application Support/Code/User/workspaceStorage`
  - Linux: `~/.config/Code/User/workspaceStorage`
- **Bundle size optimization** targeting <10 MB installer (vs current 180+ MB Electron apps)
- **Maintain all existing functionality** including workspace scanning, dashboard UI, and quick-open features

## Capabilities

### New Capabilities
- `tauri-desktop-app`: Tauri-based desktop application shell with native window management
- `sidecar-node-backend`: Sidecar pattern implementation to bundle and run Node.js backend
- `cross-platform-paths`: Platform-specific path detection for VS Code workspace storage
- `desktop-build-pipeline`: Build configuration for macOS, Linux, and Windows installers

### Modified Capabilities
- `basic-view-dashboard`: Update to work in Tauri webview context (no requirement changes, implementation only)

## Impact

- **New Dependencies**: Tauri CLI, Rust toolchain for builds
- **Build System**: New build scripts for cross-platform packaging
- **Backend Changes**: [`workspaceScanner.js`](server/workspaceScanner.js:1) needs platform path detection
- **Frontend Changes**: Minor adjustments for Tauri webview compatibility (if any)
- **Distribution**: New release artifacts (`.dmg`, `.appimage`, `.msi`, `.exe`)
- **User Experience**: Single-click launch vs manual server startup
