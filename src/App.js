import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch workspaces from API
  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get('/api/workspaces');
      setWorkspaces(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Polling for updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWorkspaces();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading workspaces...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
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
