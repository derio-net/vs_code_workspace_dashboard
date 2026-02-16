import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { getWorkspaces, waitForApi, checkHealth } from './api/client';
import './App.css';

function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiReady, setApiReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch workspaces from API
  const fetchWorkspaces = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError('Failed to load workspaces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check API health and wait for it to be ready
  useEffect(() => {
    const checkApiAndFetch = async () => {
      setLoading(true);
      
      // First, check if API is already available
      const isHealthy = await checkHealth();
      
      if (isHealthy) {
        setApiReady(true);
        await fetchWorkspaces();
      } else {
        // Wait for API to become available (up to 30 seconds)
        const becameReady = await waitForApi(30000, 1000);
        
        if (becameReady) {
          setApiReady(true);
          await fetchWorkspaces();
        } else {
          setError('Unable to connect to backend service. Please restart the application.');
          setLoading(false);
        }
      }
    };

    checkApiAndFetch();
  }, [retryCount]);

  // Polling for updates (every 30 seconds)
  useEffect(() => {
    if (!apiReady) return;

    const interval = setInterval(() => {
      fetchWorkspaces();
    }, 30000);

    return () => clearInterval(interval);
  }, [apiReady]);

  // Handle retry button click
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading workspaces...</div>
          <div className="loading-subtext">Connecting to backend service</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button className="retry-button" onClick={handleRetry}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Dashboard workspaces={workspaces} onRefresh={fetchWorkspaces} />
    </div>
  );
}

export default App;
