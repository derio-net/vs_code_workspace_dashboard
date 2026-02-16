## Context

The VS Code Workspace Dashboard currently runs as a Node.js web application requiring users to manually start a server and open a browser. This creates friction for non-technical users and limits adoption. The current architecture consists of:

- **Frontend**: React SPA served by Express
- **Backend**: Express.js server with workspace scanning logic
- **Data Source**: VS Code's workspaceStorage directory (currently hardcoded to macOS path)

We need to migrate this to a desktop application using Tauri with a sidecar pattern to reuse the existing Node.js backend.

## Goals / Non-Goals

**Goals:**
- Create a Tauri-based desktop application (<10MB bundle size)
- Implement sidecar pattern to run existing Node.js backend as subprocess
- Add cross-platform support (macOS, Linux, Windows)
- Update workspaceScanner.js for platform-specific VS Code paths
- Maintain all existing functionality (workspace scanning, dashboard UI, quick-open)
- Provide single-click launch experience

**Non-Goals:**
- Rewriting the backend in Rust (keep Node.js sidecar)
- Modifying the React frontend's core functionality
- Supporting VS Code Insiders/variants (focus on standard VS Code)
- Mobile support (iOS/Android)
- Web version continuation (desktop-only going forward)

## Decisions

### 1. Tauri + Sidecar Pattern

**Decision**: Use Tauri's sidecar feature to bundle Node.js backend as an external binary.

**Rationale**:
- Reuses existing Express.js backend without rewrite
- Sidecars are the recommended pattern for Tauri apps needing non-Rust backends
- Allows independent updates to backend logic
- Simpler than porting workspace scanning to Rust

**Alternatives Considered**:
- *Rewrite backend in Rust*: Would eliminate Node.js dependency but requires significant effort to replicate workspace parsing logic
- *HTTP communication between Tauri and separate Node process*: More complex process management, harder to bundle

**Implementation**:
```
Tauri Main Process (Rust)
    ├── Webview (React Frontend)
    └── Sidecar: Node.js Backend (Express)
```

### 2. Inter-Process Communication

**Decision**: Use HTTP requests from frontend to sidecar via localhost.

**Rationale**:
- Minimal changes to existing React code (axios calls remain `/api/workspaces`)
- Tauri can proxy requests or frontend can use absolute URLs to localhost
- Simple and well-understood pattern

**Implementation**:
- Sidecar binds to `127.0.0.1:3010` (same as current)
- Frontend uses Tauri's `fetch` or native fetch to `http://localhost:3010`
- Tauri commands can also wrap sidecar API for tighter integration

### 3. Platform Path Detection

**Decision**: Use Node.js `process.platform` and `os.homedir()` for cross-platform paths.

**Rationale**:
- Native Node.js APIs, no external dependencies
- Covers all target platforms
- Can be overridden via environment variable for edge cases

**Implementation**:
```javascript
const getWorkspaceStoragePath = () => {
  if (process.env.WORKSPACES_PATH) return process.env.WORKSPACES_PATH;
  
  const platform = process.platform;
  const home = os.homedir();
  
  switch (platform) {
    case 'darwin':
      return path.join(home, 'Library/Application Support/Code/User/workspaceStorage');
    case 'win32':
      return path.join(home, 'AppData/Roaming/Code/User/workspaceStorage');
    case 'linux':
      return path.join(home, '.config/Code/User/workspaceStorage');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};
```

### 4. Sidecar Packaging Strategy

**Decision**: Bundle Node.js runtime + backend code as platform-specific binary.

**Rationale**:
- Users shouldn't need Node.js installed
- Single distributable artifact
- pkg/nexe can create standalone executables

**Implementation**:
- Use `pkg` to compile `server/index.js` into standalone executable
- Output: `sidecar-vscode-dashboard-{platform}-{arch}`
- Tauri bundles this in `src-tauri/binaries/`

### 5. Frontend API Client

**Decision**: Update API client to use Tauri's HTTP plugin with fallback to native fetch.

**Rationale**:
- Tauri's HTTP plugin handles CORS and security restrictions in webview
- Fallback allows development without Tauri (browser mode)

**Implementation**:
```javascript
// src/api/client.js
import { fetch } from '@tauri-apps/plugin-http';

const isTauri = typeof window !== 'undefined' && window.__TAURI__;

export const apiClient = {
  get: async (url) => {
    if (isTauri) {
      return fetch(`http://localhost:3010${url}`);
    }
    return fetch(url); // Browser mode
  }
};
```

### 6. Security Model

**Decision**: Use Tauri's default CSP with custom configuration for local API access.

**Rationale**:
- Tauri provides strong defaults
- Localhost communication is inherently limited
- No external network access needed

**Implementation**:
```json
{
  "security": {
    "csp": "default-src 'self'; connect-src 'self' http://localhost:3010;"
  }
}
```

### 7. Build & Distribution

**Decision**: Use GitHub Actions for cross-platform builds with Tauri CLI.

**Rationale**:
- Tauri has excellent GitHub Actions support
- Free for open source projects
- Automatic code signing setup for macOS/Windows

**Targets**:
- macOS: `.dmg` (x64, arm64), `.app` bundle
- Linux: `.AppImage`, `.deb`
- Windows: `.msi`, `.exe` installer

### 8. Auto-Updater

**Decision**: Use Tauri's built-in updater with static JSON update manifest.

**Rationale**:
- Native integration with Tauri
- Supports all target platforms
- Can be hosted on GitHub Releases

**Implementation**:
- Configure `tauri.conf.json` with updater endpoint
- GitHub Releases hosts update manifest
- Automatic background checks

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Tauri Desktop Application                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Webview Window                          │   │
│  │              (React Frontend - Built)                     │   │
│  │                                                          │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────┐   │   │
│  │  │  Dashboard   │───▶│  API Client  │───▶│  Fetch   │   │   │
│  │  │  Component   │    │  (Tauri/HTTP)│    │          │   │   │
│  │  └──────────────┘    └──────────────┘    └────┬─────┘   │   │
│  └────────────────────────────────────────────────┼─────────┘   │
│                                                   │              │
│  ┌────────────────────────────────────────────────┼─────────┐   │
│  │           Tauri Main Process (Rust)            │         │   │
│  │                                                │         │   │
│  │  ┌─────────────────────────────────────────────┘         │   │
│  │  │         Sidecar Management (Command API)              │   │
│  │  │  - Spawn sidecar on app start                         │   │
│  │  │  - Monitor health                                     │   │
│  │  │  - Restart on crash                                   │   │
│  │  │  - Kill on app exit                                   │   │
│  │  └──────────────────────────────────────────────────────┘   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────┼──────────────────────────────┐   │
│  │                           ▼                              │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │           Sidecar: Node.js Backend                  │  │   │
│  │  │  ┌──────────────┐    ┌──────────────────────────┐  │  │   │
│  │  │  │  Express.js  │───▶│  workspaceScanner.js     │  │  │   │
│  │  │  │  Server      │    │  (Platform-aware paths)  │  │  │   │
│  │  │  └──────────────┘    └──────────────────────────┘  │  │   │
│  │  │           │                                        │  │   │
│  │  └───────────┼────────────────────────────────────────┘  │   │
│  │              │                                           │   │
│  └──────────────┼───────────────────────────────────────────┘   │
│                 │                                               │
└─────────────────┼───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              VS Code Workspace Storage                           │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │   macOS      │   Windows    │    Linux     │                 │
│  │  ~/Library/  │ %APPDATA%/   │ ~/.config/   │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Tauri Configuration (`tauri.conf.json`)

Key configuration areas:
- **Build**: Frontend dist directory, dev server URL
- **Bundle**: App metadata, icons, sidecar binary inclusion
- **Security**: CSP, allowed commands
- **Updater**: Update endpoint configuration

### 2. Rust Main Process Structure

```rust
// src-tauri/src/main.rs
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            // Spawn sidecar on startup
            spawn_sidecar(app)?;
            Ok(())
        })
        .on_window_event(|app, event| {
            // Cleanup sidecar on exit
            if let WindowEvent::Destroyed = event {
                kill_sidecar(app);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Commands to implement:
- `spawn_sidecar`: Start Node.js backend
- `get_sidecar_status`: Health check
- `restart_sidecar`: Recovery mechanism

### 3. Sidecar Packaging

Build process:
1. Build React frontend: `npm run build`
2. Package Node.js backend with `pkg`:
   ```bash
   pkg server/index.js --targets node18-macos-x64,node18-linux-x64,node18-win-x64
   ```
3. Copy binaries to `src-tauri/binaries/`
4. Reference in `tauri.conf.json`:
   ```json
   {
     "bundle": {
       "externalBin": ["binaries/sidecar-vscode-dashboard"]
     }
   }
   ```

### 4. Frontend API Client Updates

Create `src/api/client.js`:
- Detect Tauri environment
- Use `@tauri-apps/plugin-http` when available
- Fallback to native fetch for browser development
- Handle connection errors with retry logic

### 5. Workspace Scanner Updates

Modify `server/workspaceScanner.js`:
- Replace hardcoded macOS path with platform detection
- Add support for Windows and Linux paths
- Maintain environment variable override

## Data Flow

### Workspace Scanning Request Flow

```
1. User opens app
   │
   ▼
2. Tauri spawns sidecar (Node.js backend)
   │
   ▼
3. Sidecar initializes workspace scanner
   │
   ▼
4. Scanner detects platform, reads VS Code storage
   │
   ▼
5. Frontend loads, makes API request to localhost:3010
   │
   ▼
6. Express returns cached workspace data
   │
   ▼
7. Frontend renders dashboard
```

### Error Handling Between Processes

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| Sidecar fails to start | Show error dialog, offer retry/exit |
| Sidecar crashes | Auto-restart (max 3 attempts), then error |
| API timeout | Show loading state, retry with backoff |
| Workspace scan fails | Return empty list, log error, show notification |
| Platform not supported | Show compatibility error on startup |

### Process Lifecycle Management

```
App Launch
    │
    ├──▶ Spawn Sidecar
    │       │
    │       ├──▶ Success ──▶ Continue
    │       │
    │       └──▶ Failure ──▶ Retry (3x) ──▶ Error Dialog
    │
    └──▶ Monitor Health (every 5s)
            │
            ├──▶ Healthy ──▶ Continue
            │
            └──▶ Unhealthy ──▶ Restart Sidecar

App Exit
    │
    └──▶ Kill Sidecar Process
            │
            ├──▶ Success ──▶ Exit
            │
            └──▶ Failure ──▶ Force Kill ──▶ Exit
```

## Security Considerations

### CSP Configuration

```json
{
  "security": {
    "csp": {
      "default-src": "'self'",
      "connect-src": "'self' http://localhost:3010",
      "script-src": "'self'",
      "style-src": "'self' 'unsafe-inline'"
    }
  }
}
```

### Sidecar Isolation

- Sidecar binds only to `127.0.0.1` (localhost)
- No external network access required
- Filesystem access limited to VS Code workspace storage directory
- Process runs with same permissions as parent Tauri app

### Filesystem Permissions

| Path | Access | Reason |
|------|--------|--------|
| VS Code workspaceStorage | Read-only | Scanning workspaces |
| User's workspace folders | Read-only | Opening in VS Code |
| App config directory | Read/Write | Settings, cache |

### Security Best Practices

1. **No eval() or dynamic code execution** in frontend
2. **Validate all paths** before filesystem access
3. **Sanitize workspace names** before display
4. **Use HTTPS for updater** endpoint (even though local API uses HTTP)

## Build & Distribution

### Cross-Platform Build Targets

| Platform | Format | Architecture |
|----------|--------|--------------|
| macOS | `.dmg` | x64, arm64 (universal) |
| macOS | `.app` | x64, arm64 |
| Linux | `.AppImage` | x64 |
| Linux | `.deb` | x64 |
| Windows | `.msi` | x64 |
| Windows | `.exe` | x64 |

### Code Signing Approach

| Platform | Method | Notes |
|----------|--------|-------|
| macOS | Apple Developer ID | Required for notarization |
| Windows | Azure Trusted Signing or self-signed | Azure recommended for CI |
| Linux | GPG signatures | Optional but recommended |

### GitHub Actions Workflow

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
          APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
          APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

### Auto-Updater Integration

1. **Update Server**: Static JSON on GitHub Releases
2. **Manifest Format**:
   ```json
   {
     "version": "1.1.0",
     "notes": "Bug fixes and improvements",
     "pub_date": "2024-01-15T00:00:00Z",
     "platforms": {
       "darwin-x86_64": {
         "signature": "...",
         "url": "https://github.com/.../app-x86_64.app.tar.gz"
       },
       "darwin-aarch64": { ... },
       "linux-x86_64": { ... },
       "windows-x86_64": { ... }
     }
   }
   ```
3. **Check Frequency**: On startup + every 24 hours
4. **User Control**: "Check for Updates" menu item + auto-check toggle

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sidecar process management complexity | Medium | Implement health checks, auto-restart, graceful shutdown |
| Increased bundle size with Node.js runtime | Medium | Use `pkg` with Node 18, target <10MB (vs 180MB Electron) |
| Platform-specific bugs in path detection | Medium | Test on all platforms, provide override env var |
| Code signing complexity/cost | Low | Start with self-signed, upgrade to official certs later |
| User confusion between web and desktop versions | Low | Deprecate web version, redirect to desktop downloads |
| VS Code path changes in future versions | Low | Monitor VS Code updates, maintain path mapping |

## Migration Plan

### Phase 1: Foundation
1. Initialize Tauri project structure
2. Set up sidecar packaging with `pkg`
3. Implement basic process management

### Phase 2: Integration
1. Update workspaceScanner.js for cross-platform paths
2. Create Tauri API client for frontend
3. Test on all target platforms

### Phase 3: Polish
1. Add error handling and recovery
2. Implement auto-updater
3. Code signing setup

### Phase 4: Release
1. Create GitHub Actions workflow
2. Draft release notes
3. Publish v1.0.0

### Rollback Strategy
- Keep web version functional during transition
- Desktop app can fall back to browser mode if sidecar fails
- Version pinning available via GitHub Releases

## Open Questions

1. **Should we support VS Code Insiders?** Different storage paths, may add complexity.
2. **What about WSL workspaces on Windows?** May require special handling.
3. **Should we bundle Node.js or require it installed?** Bundling preferred for zero-dependency install.
4. **How to handle sidecar logs?** Log to file, expose in UI, or both?
5. **Do we need a settings UI for custom workspace paths?** Environment variable may be sufficient for v1.
