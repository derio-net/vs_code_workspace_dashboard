# Docker Containerization and Deployment - Proposal

## Why

The VS Code Workspace Dashboard is currently only accessible from localhost (127.0.0.1) and requires manual setup on each machine. Containerizing the application with Docker and providing a docker-compose deployment enables consistent, reproducible deployments across different environments, simplifies setup for new users, and allows the application to be deployed on any system with Docker installed. This also enables easier scaling and integration into existing containerized infrastructure.

## What Changes

- Create a Dockerfile to containerize the Node.js/React application
- Create a docker-compose.yml file for orchestrated deployment
- Parameterize the VS Code workspaces mount path to allow flexible configuration
- Update the server to accept connections from any interface (not just localhost) when running in Docker
- Add environment variable support for configuration (PORT, WORKSPACES_PATH, HOST)
- Document Docker setup and deployment procedures

## Capabilities

### New Capabilities
- `docker-image-build`: Build and package the application as a Docker image with all dependencies
- `docker-compose-deployment`: Deploy the application using docker-compose with parameterized workspace mounting
- `environment-configuration`: Support environment variables for PORT, HOST, and WORKSPACES_PATH configuration
- `workspace-volume-mounting`: Mount VS Code workspaces directory as a parameterized volume in Docker

### Modified Capabilities
- `basic-view-dashboard`: Update server to support network access (not just localhost) when running in containerized environment

## Impact

- **Code Changes**: 
  - `server/index.js`: Modify HOST binding to support Docker networking
  - `server/workspaceScanner.js`: Support configurable workspace path via environment variable
  - `package.json`: May need to add Docker-related scripts
  
- **New Files**:
  - `Dockerfile`: Container image definition
  - `docker-compose.yml`: Deployment orchestration
  - `.dockerignore`: Exclude unnecessary files from Docker build
  - `docker-entrypoint.sh`: Optional startup script for environment setup
  
- **Dependencies**: No new npm dependencies required; Docker and docker-compose are external tools
  
- **Configuration**: Application will now support environment variables: `PORT`, `HOST`, `WORKSPACES_PATH`
