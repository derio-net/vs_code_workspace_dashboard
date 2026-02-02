# Docker Image Build Specification

## ADDED Requirements

### Requirement: Docker image contains all application dependencies
The system SHALL package the Node.js application with all npm dependencies into a Docker image based on node:18-alpine.

#### Scenario: Image builds successfully with all dependencies
- **WHEN** `docker build -t vscode-dashboard .` is executed
- **THEN** the Docker image is created with all npm dependencies installed and the application ready to run

#### Scenario: Image includes React build artifacts
- **WHEN** the Docker image is built
- **THEN** the React application is built and static files are included in the `public/` directory within the image

#### Scenario: Image size is optimized
- **WHEN** the Docker image is built
- **THEN** the image uses Alpine Linux base to minimize size (target: < 300MB)

### Requirement: Dockerfile excludes unnecessary files
The system SHALL use a .dockerignore file to exclude development and build artifacts from the Docker image.

#### Scenario: Development files are excluded
- **WHEN** the Docker image is built
- **THEN** files listed in .dockerignore (node_modules, .git, .env, etc.) are not included in the image

#### Scenario: Build context is minimal
- **WHEN** the Docker image is built
- **THEN** only necessary files are copied, reducing build time and image size

### Requirement: Application starts correctly in container
The system SHALL ensure the application starts and listens on the configured port when the container runs.

#### Scenario: Container starts without errors
- **WHEN** `docker run vscode-dashboard` is executed
- **THEN** the application starts successfully and logs indicate the server is running

#### Scenario: Application is accessible on configured port
- **WHEN** the container is running with PORT=3000
- **THEN** the application is accessible at http://localhost:3000

### Requirement: Node.js production mode is used
The system SHALL set NODE_ENV=production in the Dockerfile to optimize performance.

#### Scenario: Production environment is configured
- **WHEN** the Docker image is built
- **THEN** NODE_ENV environment variable is set to "production"

#### Scenario: Dependencies are installed for production
- **WHEN** npm install is run in the Dockerfile
- **THEN** only production dependencies are installed (devDependencies excluded)
