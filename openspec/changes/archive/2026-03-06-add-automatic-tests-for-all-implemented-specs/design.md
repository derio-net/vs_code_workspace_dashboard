## Context

The VS Code Workspace Dashboard currently lacks automated test coverage. The application consists of:
- **Frontend**: React-based UI with components (Dashboard, WorkspaceTable)
- **Backend**: Express API server providing workspace discovery and VS Code URI generation
- **15+ implemented specs**: Basic view, dark theme, CORS, workspace attributes, resizable columns, etc.

Current state: No test infrastructure exists. Manual testing is performed ad-hoc.

## Goals / Non-Goals

**Goals:**
- Add Jest and React Testing Library for frontend unit/component tests
- Add supertest for backend API endpoint testing  
- Add Playwright for E2E user workflow testing
- Achieve meaningful test coverage for all implemented features
- Integrate tests into CI/CD pipeline
- Provide developers with test scripts (test, test:watch, test:e2e)

**Non-Goals:**
- 100% code coverage (not cost-effective)
- Performance/load testing
- Visual regression testing (future enhancement)
- Testing deprecated features

## Decisions

### 1. Test Framework Selection: Jest
- **Decision**: Use Jest as the primary test runner for both frontend and backend
- **Rationale**: Mature ecosystem, built-in coverage, excellent React integration via Testing Library
- **Alternative considered**: Vitest - similar features but less mature ecosystem for this project

### 2. Frontend Testing: React Testing Library
- **Decision**: Use @testing-library/react for component testing
- **Rationale**: Encourages testing behavior rather than implementation, better accessibility debugging
- **Scope**: Test component rendering, user interactions, state changes

### 3. API Testing: supertest
- **Decision**: Use supertest with Jest for API endpoint testing
- **Rationale**: Direct HTTP testing without requiring a running server, fast feedback
- **Scope**: Test /api/workspaces endpoint, CORS headers, error responses

### 4. E2E Testing: Playwright
- **Decision**: Use Playwright for end-to-end testing
- **Rationale**: Better cross-browser support than Cypress, reliable test execution, good debugging
- **Scope**: Critical user paths - loading dashboard, opening workspaces

### 5. Test Organization Structure
```
src/
  __tests__/
    components/
      Dashboard.test.jsx
      WorkspaceTable.test.jsx
    hooks/
server/
  __tests__/
    api.test.js
e2e/
  dashboard.spec.js
  workspace-opening.spec.js
```

### 6. Test Dependencies (package.json additions)
- jest, @types/jest
- @testing-library/react, @testing-library/jest-dom
- jest-environment-jsdom
- supertest
- @playwright/test

## Risks / Trade-offs

- **[Risk] Initial setup overhead** → Mitigation: Create comprehensive setup files and documentation
- **[Risk] Flaky E2E tests** → Mitigation: Use Playwright's retry mechanisms, wait for specific elements
- **[Risk] Test maintenance burden** → Mitigation: Keep tests focused on behavior, update with feature changes
- **[Trade-off] Test execution time** → E2E tests will slow CI; Mitigation: Run unit tests first, E2E in parallel

## Migration Plan

1. Install test dependencies
2. Configure Jest (jest.config.js, setupTests.js)
3. Create test directory structure
4. Write initial component tests for Dashboard
5. Write API endpoint tests
6. Write E2E tests for critical paths
7. Add npm scripts for running tests
8. Configure CI to run tests on PRs
9. Archive completed change

## Open Questions

- Should we use snapshot testing for component renders?
- What coverage threshold should trigger CI failure (e.g., 70%)?
- Should E2E tests run on every commit or only on PRs?
