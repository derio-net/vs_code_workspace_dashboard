## 1. Test Infrastructure Setup

- [x] 1.1 Install Jest and React Testing Library dependencies (jest, @testing-library/react, @testing-library/jest-dom, jest-environment-jsdom)
- [x] 1.2 Install supertest for API endpoint testing
- [x] 1.3 Install Playwright for E2E testing (@playwright/test)
- [x] 1.4 Create jest.config.js with frontend and backend test configurations
- [x] 1.5 Create src/setupTests.js for React Testing Library setup
- [x] 1.6 Create playwright.config.js with base configuration
- [x] 1.7 Add test scripts to package.json (test, test:watch, test:e2e, test:coverage)

## 2. Frontend Unit Tests

- [x] 2.1 Create src/__tests__/components/ directory structure
- [x] 2.2 Write Dashboard.test.jsx - loading state, workspace rendering, empty state
- [x] 2.3 Write WorkspaceTable.test.jsx - data rendering, column display
- [x] 2.4 Add tests for dark theme styling application
- [x] 2.5 Add tests for column visibility toggle
- [x] 2.6 Add tests for column resize functionality

## 3. API Endpoint Tests

- [x] 3.1 Create server/__tests__/ directory structure
- [x] 3.2 Write api.test.js - GET /api/workspaces success scenario
- [x] 3.3 Write tests for empty workspace list scenario
- [x] 3.4 Write tests for CORS headers (preflight OPTIONS, GET with CORS)
- [x] 3.5 Write tests for error handling (invalid path scenarios)

## 4. Integration Tests

- [x] 4.1 Create integration tests for workspace scanner
- [x] 4.2 Write tests for multiple workspace directory scanning
- [x] 4.3 Write tests for .code-workspace file detection
- [x] 4.4 Write tests for workspace path validation
- [x] 4.5 Write tests for VS Code Remote URI generation (local and SSH)
- [x] 4.6 Write tests for workspace attribute extraction

## 5. E2E Tests

- [x] 5.1 Create e2e/ directory structure
- [x] 5.2 Write dashboard.spec.js - page load, loading state, empty state
- [x] 5.3 Write workspace-opening.spec.js - click to open workspace
- [x] 5.4 Write column-visibility.spec.js - toggle columns
- [x] 5.5 Write dark-theme.spec.js - verify theme application
- [x] 5.6 Install Playwright browsers (npx playwright install)

## 6. CI Integration

- [x] 6.1 Configure GitHub Actions to run unit tests on PR
- [x] 6.2 Configure E2E tests to run on PR (or as optional check)
- [x] 6.3 Add coverage reporting to CI
- [x] 6.4 Verify all tests pass before merge

## 7. Documentation

- [x] 7.1 Add test documentation to README.md
- [x] 7.2 Document how to run tests locally
- [x] 7.3 Document test naming conventions
