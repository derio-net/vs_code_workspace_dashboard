// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
//   expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Tauri APIs since they're not available in test environment
jest.mock('@tauri-apps/plugin-dialog', () => ({
  ask: jest.fn().mockResolvedValue(true),
  confirm: jest.fn().mockResolvedValue(true),
  message: jest.fn().mockResolvedValue(undefined),
  open: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue(null),
}));

jest.mock('@tauri-apps/plugin-shell', () => ({
  open: jest.fn().mockResolvedValue(undefined),
  Command: {
    create: jest.fn(),
  },
}));

jest.mock('@tauri-apps/api', () => ({
  invoke: jest.fn().mockResolvedValue(null),
  event: {
    listen: jest.fn().mockResolvedValue(() => {}),
    emit: jest.fn().mockResolvedValue(undefined),
  },
}));

// Suppress expected console.error messages in tests
// These are expected errors from async state updates and intentional error scenarios
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Suppress React act() warnings - these are cosmetic in test environments
    if (typeof args[0] === 'string' && args[0].includes('Warning: An update to')) {
      return;
    }
    // Suppress expected validatePaths errors from async component effects
    if (typeof args[0] === 'string' && args[0].includes('Failed to validate workspace paths')) {
      return;
    }
    // Suppress expected error-scenario test output
    if (typeof args[0] === 'string' && args[0].includes('Error fetching workspaces')) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
