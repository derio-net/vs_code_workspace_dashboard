# Development Process Improvements - Tasks

## Overview

This document outlines the detailed tasks required to implement the development process improvements for the VS Code Workspace Dashboard. The tasks are organized by category and follow the design specifications outlined in `design.md`.

## Prerequisites

- Node.js and npm installed
- Tauri CLI installed
- Docker installed (for containerization testing)

## Phase 1: Package.json Script Improvements

### Task 1.1: Install concurrently dependency ✅

**Description**: Install `concurrently` package to enable parallel script execution

```bash
npm install --save-dev concurrently
```

**Expected Outcome**: `concurrently` added to devDependencies

### Task 1.2: Update package.json scripts ✅

**Description**: Replace existing scripts with the consolidated structure

**File**: `package.json`

**Changes**:
- Add `dev` script that runs both server and React in parallel
- Define `dev:server` and `dev:react` as standalone scripts
- Streamline build scripts
- Improve Tauri integration

### Task 1.3: Test new scripts ✅

**Description**: Verify all new scripts function correctly

**Commands to Test**:
```bash
npm run dev:react  # Should start React dev server on 3020
npm run dev:server  # Should start Express server on 3010
npm run dev         # Should start both servers concurrently
npm run build       # Should build both frontend and backend
```

## Phase 2: Port Configuration Updates

### Task 2.1: Update server/index.js port configuration ✅

**Description**: Standardize server port configuration

**File**: `server/index.js`

**Changes**:
- Replace `const PORT = process.env.DASHBOARD_PORT || process.env.PORT || 3010;`
- With `const PORT = process.env.DASHBOARD_PORT || 3010;`
- Remove legacy PORT variable fallback

### Task 2.2: Update src/api/client.js port configuration ✅

**Description**: Update API client to use standard port

**File**: `src/api/client.js`

**Changes**:
- Replace `const API_PORT = process.env.DASHBOARD_PORT || process.env.PORT || 3010;`
- With `const API_PORT = process.env.DASHBOARD_PORT || 3010;`

### Task 2.3: Update Docker configuration files ✅

**Description**: Align Docker port configuration with standard port

**Files**: `docker-compose.yml`, `Dockerfile`

**Changes**:
- `docker-compose.yml`: Update port mapping from 3000 to 3010
- `Dockerfile`: Update EXPOSE port from 3000 to 3010

### Task 2.4: Update Tauri configuration ✅

**Description**: Ensure Tauri dev URL and CSP match standard ports

**File**: `src-tauri/tauri.conf.json`

**Changes**:
- Verify `devUrl` is `http://localhost:3020`
- Update CSP connect-src to include both 3020 and 3010

### Task 2.5: Test Docker deployment ✅

**Description**: Verify Docker container builds and runs correctly

**Commands**:
```bash
docker-compose build
docker-compose up
# Verify access at http://localhost:3010
```

## Phase 3: Environment Variable Simplification

### Task 3.1: Update .env.example ✅

**Description**: Remove legacy PORT variable

**File**: `.env.example`

**Changes**:
- Remove `PORT=3010` line
- Keep `DASHBOARD_PORT=3010` and `DASHBOARD_DEV_PORT=3020`

### Task 3.2: Update server CORS configuration ✅

**Description**: Fix CORS configuration to include React dev server port

**File**: `server/index.js`

**Changes**:
- Update CORS origins to include both API port and React dev server port
- Make CORS configuration dynamic based on environment variables

### Task 3.3: Verify environment variable loading ✅

**Description**: Test that environment variables are correctly loaded

**Steps**:
1. Create `.env` file from `.env.example`
2. Set custom port values
3. Test that server responds on configured port

## Phase 4: CORS Configuration Fix

### Task 4.1: Update server CORS origins ✅

**Description**: Fix CORS configuration to include React dev server port

**File**: `server/index.js`

**Changes**:
- Replace static origin array with dynamic configuration
- Include both API port and React dev server port (3020)

### Task 4.2: Test CORS behavior ✅

**Description**: Verify that API calls from React dev server work correctly

**Steps**:
1. Start both servers: `npm run dev`
2. Open browser at `http://localhost:3020`
3. Verify that API calls succeed without CORS errors

## Phase 5: Verification and Testing

### Task 5.1: Test Tauri development mode ✅

**Description**: Verify Tauri integration works correctly

**Command**:
```bash
npm run tauri:dev
```

**Expected Outcome**: Tauri app should open, React dev server should start, and API calls should work

### Task 5.2: Test Tauri production build ✅

**Description**: Verify Tauri production build process

**Command**:
```bash
npm run tauri:build
```

**Expected Outcome**: Build should complete successfully, and the app should run

### Task 5.3: Test all development scenarios ✅

**Description**: Verify all development workflows function correctly

**Scenarios to Test**:
1. Traditional web development (npm run dev)
2. Tauri desktop development (npm run tauri:dev)
3. Docker container deployment (docker-compose)
4. Production build process (npm run build)

### Task 5.4: Verify all functionality ✅

**Description**: Ensure all dashboard features still work

**Features to Test**:
1. Workspace scanning
2. Table sorting and filtering
3. Opening workspaces in VS Code
4. Search functionality
5. Delete workspace functionality
6. Import/export functionality

## Phase 6: Documentation Updates

### Task 6.1: Update README.md ✅

**Description**: Update documentation with new port and script information

**Changes**:
- Update port references from 3000 to 3010
- Document new scripts and functionality

### Task 6.2: Update BUILD.md ✅

**Description**: Update build documentation to reflect changes

**Changes**:
- Update build process instructions
- Document new port configuration

## Task Priority Matrix

| Task | Priority | Category |
|------|----------|----------|
| 1.1 - Install concurrently | High | Script Improvements |
| 1.2 - Update package.json scripts | High | Script Improvements |
| 1.3 - Test new scripts | Medium | Script Improvements |
| 2.1 - Update server port config | High | Port Configuration |
| 2.2 - Update API client port | High | Port Configuration |
| 2.3 - Update Docker config | Medium | Port Configuration |
| 2.4 - Update Tauri config | Medium | Port Configuration |
| 2.5 - Test Docker deployment | Medium | Port Configuration |
| 3.1 - Update .env.example | High | Environment Variables |
| 3.2 - Update server CORS | High | CORS Fix |
| 3.3 - Verify variable loading | Medium | Environment Variables |
| 4.1 - Update CORS origins | High | CORS Fix |
| 4.2 - Test CORS behavior | Medium | CORS Fix |
| 5.1 - Test Tauri dev | High | Verification |
| 5.2 - Test Tauri build | Medium | Verification |
| 5.3 - Test all scenarios | High | Verification |
| 5.4 - Verify all functionality | High | Verification |
| 6.1 - Update README | Medium | Documentation |
| 6.2 - Update BUILD.md | Medium | Documentation |

## Completion Criteria

All tasks should be completed successfully, and all functionality should be verified. The following must be true:

1. All scripts in package.json function correctly
2. Docker deployment works on port 3010
3. Tauri development and build processes work
4. React app and API communicate without CORS errors
5. All existing functionality remains intact
6. Documentation is updated with new information

## Risk Mitigation

- **CORS issues**: If CORS errors occur, check server CORS configuration and verify React dev server port
- **Docker issues**: If container fails to start, check port mapping and environment variables
- **Tauri issues**: If Tauri app fails, check sidecar port configuration in src-tauri/src/lib.rs
- **Script issues**: If scripts fail, check dependency installation and node version compatibility
