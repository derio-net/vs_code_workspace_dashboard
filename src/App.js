import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { getWorkspaces, waitForApi, checkHealth } from './api/client';
import './App.css';

function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch workspaces from API
  const fetchWorkspaces = async () => {
    if (isFetching) {
      console.log('Already fetching workspaces, skipping...');
      return;
    }
    
    console.log('Starting fetchWorkspaces...');
    try {
      setIsFetching(true);
      const data = await getWorkspaces();
      console.log('Workspaces fetched:', data.length);
      setWorkspaces(data);
      // Only show error if the API actually failed, not for empty results
      setError(null);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError(`Failed to load workspaces: ${err.message || 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
      setIsFetching(false);
      console.log('fetchWorkspaces complete');
    }
  };

  // Memoize fetchWorkspaces to avoid infinite loop in Dashboard useEffect
  const handleRefresh = React.useCallback(() => {
    fetchWorkspaces();
  }, []);

  // Fetch workspaces on initial load
  useEffect(() => {
    fetchWorkspaces();
  }, []);



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
      <Dashboard workspaces={workspaces} onRefresh={handleRefresh} />
    </div>
  );
}

export default App;
