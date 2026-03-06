# Contributing to VS Code Workspace Dashboard

Thanks for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/vs_code_workspace_dashboard.git
   cd vs_code_workspace_dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your change:
   ```bash
   git checkout -b my-feature
   ```

## Development

### Running Locally

```bash
# Start both frontend and backend in dev mode
npm run dev

# Or start them separately:
npm run dev:server   # Backend on http://localhost:3010
npm run dev:react    # Frontend on http://localhost:3020
```

### Running Tests

```bash
# All frontend tests
npm test

# Server tests
npm run test:server

# All tests
npm run test:all

# E2E tests (requires running dev server)
npm run test:e2e
```

Please ensure all tests pass before submitting a PR.

### Building

```bash
# Build React frontend
npm run build:react

# Build Tauri desktop app
npm run tauri:build
```

## Submitting Changes

1. Make your changes in a feature branch
2. Write or update tests as needed
3. Ensure all tests pass: `npm run test:all`
4. Commit with a clear message describing what and why:
   ```
   feat(component): add dark mode toggle

   Add a toggle in the header to switch between light and dark themes.
   Theme preference is persisted in localStorage.
   ```
5. Push to your fork and open a Pull Request

### Commit Message Convention

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `ci`: CI/CD changes

## Project Structure

```
server/              # Express backend
  index.js           # Server entry point
  workspaceScanner.js # Workspace discovery logic
src/                 # React frontend
  components/        # React components
  utils/             # Shared utilities
e2e/                 # Playwright E2E tests
src-tauri/           # Tauri desktop app
openspec/            # OpenSpec specifications
```

## Reporting Issues

- Use GitHub Issues to report bugs or request features
- Include steps to reproduce for bugs
- Include your OS, Node.js version, and browser if relevant

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
