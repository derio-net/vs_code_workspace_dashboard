# Development Process Improvements - Design

## Overview

This document outlines the detailed design for implementing the development process improvements for the VS Code Workspace Dashboard. The improvements are organized into four main categories: script consolidation, port standardization, environment variable simplification, and CORS configuration.

## 1. Script Consolidation

### Current Script Structure

```json
{
  "start": "node server/index.js",
  "dev": "node server/index.js",
  "dev:react": "PORT=3020 BROWSER=none react-scripts start",
  "build": "npm run build:react && cp -r build/* public/",
  "build:react": "react-scripts build",
  "build:sidecar": "npx pkg server/index.js --targets node18-macos-arm64 --output src-tauri/binaries/sidecar-vscode-dashboard-aarch64-apple-darwin",
  "tauri": "tauri",
  "tauri:dev": "tauri dev",
  "tauri:build": "tauri build"
}
```

### Proposed Script Structure

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:react\"",
    "dev:server": "node server/index.js",
    "dev:react": "PORT=${DASHBOARD_DEV_PORT:-3020} BROWSER=none react-scripts start",
    "build": "npm run build:react && npm run build:server",
    "build:react": "react-scripts build && cp -r build/* public/",
    "build:server": "node server/build.js",
    "build:sidecar": "npm run build:server && npx pkg server/index.js --targets node18-macos-arm64 --output src-tauri/binaries/sidecar-vscode-dashboard-aarch64-apple-darwin",
    "tauri:dev": "tauri dev",
    "tauri:build": "npm run build && tauri build",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Key Improvements

- **Concurrent development script**: `dev` runs both server and React in parallel using `concurrently`
- **Clear script separation**: `dev:server` and `dev:react` are standalone scripts
- **Simplified build process**: `build` combines both frontend and backend builds
- **Better Tauri integration**: `tauri:build` ensures dependencies are built first
- **Removed redundancy**: Eliminates overlapping scripts with similar purposes

## 2. Port Standardization

### Current Port Configuration

| Port | Usage | Location |
|------|-------|----------|
| 3000 | Docker container port | docker-compose.yml, Dockerfile, server/index.js (CORS) |
| 3010 | Default server/sidecar port | server/index.js, src/api/client.js, src-tauri/src/lib.rs |
| 3020 | React dev server port | package.json (dev:react), src-tauri/tauri.conf.json |

### Proposed Port Configuration

| Port | Usage | Location |
|------|-------|----------|
| 3010 | Default server/sidecar/Docker port | All configuration files |
| 3020 | React dev server port | package.json (dev:react), src-tauri/tauri.conf.json |

### Changes Required

1. **server/index.js**: Update default port and CORS origins
2. **src/api/client.js**: Update API port configuration
3. **src-tauri/tauri.conf.json**: Update dev URL and CSP
4. **docker-compose.yml**: Update container port mapping
5. **Dockerfile**: Update EXPOSE port
6. **.env.example**: Standardize port variables

## 3. Environment Variable Simplification

### Current Variables

```
DASHBOARD_PORT=3010
PORT=3010
DASHBOARD_DEV_PORT=3020
```

### Proposed Variables

```
DASHBOARD_PORT=3010
DASHBOARD_DEV_PORT=3020
```

### Changes Required

- Remove legacy `PORT` variable from all files
- Update references to use `DASHBOARD_PORT` instead
- Keep `DASHBOARD_DEV_PORT` for React dev server configuration

## 4. CORS Configuration Fix

### Current CORS Configuration (server/index.js)

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3010',
  ],
  credentials: true,
};
```

### Proposed CORS Configuration

```javascript
const corsOptions = {
  origin: [
    `http://localhost:${PORT}`,
    `http://localhost:${process.env.DASHBOARD_DEV_PORT || 3020}`,
  ],
  credentials: true,
};
```

### Benefits

- Dynamic port configuration based on environment variables
- Automatically includes React dev server port (3020 or configured value)
- Prevents CORS errors in development

## 5. File Modifications Summary

| File | Changes |
|------|---------|
| `package.json` | Update scripts, add concurrently |
| `server/index.js` | Update PORT, CORS, logging |
| `src/api/client.js` | Update API_PORT |
| `.env.example` | Remove PORT variable |
| `docker-compose.yml` | Update port mapping |
| `Dockerfile` | Update EXPOSE port |
| `src-tauri/tauri.conf.json` | Update devUrl and CSP |

## 6. Implementation Steps

### Phase 1: Package.json Scripts
1. Add `concurrently` dependency
2. Update scripts with proposed structure
3. Test script execution

### Phase 2: Port Configuration
1. Update all files with 3010 as default port
2. Remove legacy port references
3. Test Docker deployment

### Phase 3: Environment Variables
1. Simplify .env.example
2. Update all references to use new variables
3. Test configuration loading

### Phase 4: CORS Fix
1. Update server CORS configuration
2. Test API calls from React dev server
3. Verify CORS behavior

### Phase 5: Verification
1. Test Tauri development mode
2. Test traditional web development mode
3. Verify Docker deployment
4. Check for broken functionality

## 7. Testing Strategy

- Test `npm run dev` - should start both servers
- Test `npm run build` - should build both frontend and backend
- Test Tauri dev mode - should start React dev server and Rust app
- Test Docker build and run
- Verify API calls from React to server
- Check CORS error handling

## 8. Dependencies

- `concurrently` - for parallel script execution
- Existing dependencies remain intact

## 9. Risks and Mitigation

- **CORS issues**: Ensure all valid origins are included
- **Environment variable conflicts**: Remove all legacy variables
- **Docker compatibility**: Test container build and port mapping
- **Tauri integration**: Verify sidecar port configuration

This design ensures that the development process becomes more efficient, consistent, and maintainable while preserving all existing functionality.
