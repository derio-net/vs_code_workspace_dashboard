# Docker Containerization and Deployment - Design

## Context

The VS Code Workspace Dashboard is a Node.js/React application that currently runs only on localhost (127.0.0.1) for security reasons. The application consists of:
- **Backend**: Express.js server (`server/index.js`) that scans for VS Code workspaces and serves an API
- **Frontend**: React application built and served as static files from the `public/` directory
- **Workspace Scanner**: Module that discovers VS Code workspaces on the host system

Current constraints:
- Hardcoded localhost binding prevents network access
- Workspace path is hardcoded in the scanner
- No standardized deployment mechanism
- Setup requires manual Node.js installation and configuration

## Goals / Non-Goals

**Goals:**
- Create a Docker image that packages the entire application with all dependencies
- Enable deployment via docker-compose with parameterized workspace mounting
- Support environment-based configuration (PORT, HOST, WORKSPACES_PATH)
- Maintain backward compatibility with existing local development workflow
- Enable the application to be accessible from any network interface when running in Docker
- Provide clear documentation for Docker-based deployment

**Non-Goals:**
- Kubernetes orchestration (docker-compose only)
- Multi-stage builds for optimization (single-stage is acceptable for this use case)
- Container registry/image publishing
- Health checks or advanced Docker features
- Changing the core application logic or API

## Decisions

### 1. **Single-Stage Dockerfile with Node.js Base Image**
**Decision**: Use `node:18-alpine` as the base image with a single-stage build.

**Rationale**: 
- Alpine Linux provides a minimal footprint (~150MB vs ~900MB for full Node.js image)
- Single-stage build is simpler to maintain and sufficient for this application
- Node 18 LTS provides good stability and performance

**Alternatives Considered**:
- Multi-stage build: Not necessary since the application is relatively small; added complexity without significant benefit
- Ubuntu base: Larger image size; Alpine is more appropriate for containerized applications

### 2. **Environment Variable Configuration**
**Decision**: Support `PORT`, `HOST`, and `WORKSPACES_PATH` via environment variables with sensible defaults.

**Rationale**:
- Allows flexible deployment without rebuilding the image
- Follows Docker best practices (12-factor app principles)
- Enables different configurations for development, staging, and production

**Defaults**:
- `PORT=3000`
- `HOST=0.0.0.0` (in Docker; localhost in development)
- `WORKSPACES_PATH=/workspaces` (mounted volume)

### 3. **Volume Mounting for Workspaces**
**Decision**: Mount the host's VS Code workspaces directory as a Docker volume at `/workspaces` inside the container.

**Rationale**:
- Allows the container to access host workspaces without copying them
- Parameterized via `WORKSPACES_PATH` environment variable
- Enables read-only or read-write access as needed

**Implementation**:
- docker-compose.yml defines the volume mount
- User specifies the host path via environment variable or .env file

### 4. **docker-compose for Orchestration**
**Decision**: Use docker-compose.yml for deployment configuration instead of raw Docker commands.

**Rationale**:
- Simplifies deployment for users unfamiliar with Docker
- Provides clear, declarative configuration
- Enables easy scaling and service management
- Supports environment variable substitution

### 5. **Conditional HOST Binding**
**Decision**: Modify `server/index.js` to bind to `0.0.0.0` when `HOST` environment variable is set, otherwise default to `127.0.0.1`.

**Rationale**:
- Maintains security for local development (localhost-only by default)
- Enables network access when running in Docker
- Backward compatible with existing code

### 6. **Workspace Scanner Configuration**
**Decision**: Update `workspaceScanner.js` to read workspace path from `WORKSPACES_PATH` environment variable.

**Rationale**:
- Allows flexible workspace location configuration
- Supports Docker volume mounting at different paths
- Maintains backward compatibility with default path

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Security**: Binding to 0.0.0.0 exposes the application to network access | Document that docker-compose should only be used in trusted networks; consider adding authentication in future |
| **Performance**: Alpine Linux may have fewer tools for debugging | Include basic debugging tools (curl, wget) in Dockerfile if needed; use multi-stage build if image size becomes critical |
| **Volume Permissions**: Container user may not have permission to read host workspaces | Run container with appropriate user ID; document permission requirements |
| **Port Conflicts**: Default port 3000 may already be in use | Use docker-compose port mapping; document how to change PORT environment variable |
| **Workspace Path Misconfiguration**: User provides incorrect path | Validate path exists in docker-entrypoint.sh; provide clear error messages |

## Migration Plan

### Deployment Steps:
1. Build Docker image: `docker build -t vscode-dashboard .`
2. Create `.env` file with `WORKSPACES_PATH=/path/to/workspaces`
3. Run docker-compose: `docker-compose up -d`
4. Access application at `http://localhost:3000`

### Rollback Strategy:
- Stop containers: `docker-compose down`
- Remove image: `docker rmi vscode-dashboard`
- Revert to local development: `npm install && npm start`

### Backward Compatibility:
- Local development workflow unchanged: `npm install && npm dev`
- Existing code continues to work without Docker
- Docker is optional, not required

## Open Questions

1. Should we add a docker-entrypoint.sh script for additional setup (e.g., permission validation)?
2. Do we need to support different workspace paths for different environments (dev, staging, prod)?
3. Should we add Docker health checks to docker-compose.yml?
4. Do we need to document security considerations for network-accessible deployments?
