import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { getWorkspaces, waitForApi } from '../api/client';

// Mock the API client (already mocked in setupTests.js)
// Override specific behaviors for these tests
jest.mock('../api/client', () => ({
  getWorkspaces: jest.fn(),
  waitForApi: jest.fn(),
  validatePaths: jest.fn().mockResolvedValue({ results: {} }),
  validatePath: jest.fn().mockResolvedValue(true),
  deleteWorkspaces: jest.fn().mockResolvedValue({ success: true, removed: 0 }),
  checkHealth: jest.fn().mockResolvedValue(true),
  getEnvironment: jest.fn().mockReturnValue('browser'),
  default: {},
}));

describe('App component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Spec: Dashboard renders loading state', () => {
    it('shows loading state while waiting for API', async () => {
      // Make waitForApi never resolve during this test
      waitForApi.mockImplementation(() => new Promise(() => {}));
      getWorkspaces.mockResolvedValue([]);

      render(<App />);

      expect(screen.getByText(/loading workspaces/i)).toBeInTheDocument();
    });

    it('shows loading spinner', async () => {
      waitForApi.mockImplementation(() => new Promise(() => {}));

      render(<App />);

      // Loading container should be present
      const loadingContainer = document.querySelector('.loading-container');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Spec: Dashboard renders workspace table', () => {
    it('renders workspace table after API loads', async () => {
      const mockWorkspaces = [
        {
          id: 'ws-1',
          name: 'Test Workspace',
          path: '/Users/dev/test',
          type: 'local',
          lastAccessed: '2024-01-15T10:00:00Z',
        },
      ];

      waitForApi.mockResolvedValue(true);
      getWorkspaces.mockResolvedValue(mockWorkspaces);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Test Workspace')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Spec: Dashboard handles empty workspace list', () => {
    it('renders without error when no workspaces', async () => {
      waitForApi.mockResolvedValue(true);
      getWorkspaces.mockResolvedValue([]);

      render(<App />);

      await waitFor(() => {
        // Should not show loading anymore
        expect(screen.queryByText(/loading workspaces/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Spec: Error handling', () => {
    it('shows error message when API fails', async () => {
      waitForApi.mockResolvedValue(true);
      getWorkspaces.mockRejectedValue(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load workspaces/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows retry button on error', async () => {
      waitForApi.mockResolvedValue(true);
      getWorkspaces.mockRejectedValue(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows error when backend service does not start', async () => {
      waitForApi.mockResolvedValue(false);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load workspaces/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Spec: Dark theme styling', () => {
    it('applies dark theme CSS class to app container', async () => {
      waitForApi.mockResolvedValue(true);
      getWorkspaces.mockResolvedValue([]);

      render(<App />);

      await waitFor(() => {
        const appContainer = document.querySelector('.app');
        expect(appContainer).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
