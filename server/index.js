const express = require('express');
const path = require('path');
const workspaceScanner = require('./workspaceScanner');

const app = express();
const PORT = process.env.DASHBOARD_PORT || process.env.PORT || 3010;
const HOST = process.env.HOST || '127.0.0.1'; // Localhost by default, 0.0.0.0 in Docker
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Configure logging based on LOG_LEVEL
const log = {
  debug: (...args) => LOG_LEVEL === 'debug' && console.log('[DEBUG]', ...args),
  info: (...args) => ['debug', 'info'].includes(LOG_LEVEL) && console.log('[INFO]', ...args),
  warn: (...args) => ['debug', 'info', 'warn'].includes(LOG_LEVEL) && console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
};

// Middleware
app.use(express.json());

// CORS configuration for Tauri webview
app.use((req, res, next) => {
  // Allow requests from Tauri webview and localhost
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'tauri://localhost',
    'https://tauri.localhost'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Allow any localhost origin for development
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/workspaces', (req, res) => {
  try {
    const workspaces = workspaceScanner.getWorkspaces();
    res.json(workspaces);
  } catch (error) {
    log.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize workspace scanner and start server
workspaceScanner.initialize().then(() => {
  app.listen(PORT, HOST, () => {
    log.info(`VS Code Workspace Dashboard running at http://${HOST}:${PORT}`);
    log.info('Server is only accessible from localhost for security');
  });
}).catch(error => {
  log.error('Failed to initialize workspace scanner:', error);
  process.exit(1);
});
