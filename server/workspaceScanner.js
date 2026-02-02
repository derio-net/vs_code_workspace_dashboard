const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// In-memory cache for workspaces
let workspacesCache = [];

// Workspace storage path
const WORKSPACE_STORAGE_PATH = path.join(
  os.homedir(),
  'Library/Application Support/Code/User/workspaceStorage'
);

// Refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000;

/**
 * Parse workspace type from URI
 */
function parseWorkspaceType(uri) {
  if (uri.startsWith('file://')) {
    return 'local';
  } else if (uri.includes('vscode-remote://dev-container')) {
    return 'dev-container';
  } else if (uri.includes('vscode-remote://attached-container')) {
    return 'attached-container';
  } else if (uri.includes('vscode-remote://ssh-remote')) {
    return 'ssh-remote';
  } else if (uri.startsWith('vscode-remote://')) {
    return 'remote';
  }
  return 'unknown';
}

/**
 * Extract workspace name from path
 */
function extractWorkspaceName(uri) {
  try {
    // Decode URI components
    const decoded = decodeURIComponent(uri);
    
    // Extract the last part of the path
    const parts = decoded.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Remove file extension if present
    return lastPart.replace(/\.(code-workspace|json)$/, '');
  } catch (error) {
    console.error('Error extracting workspace name:', error);
    return 'Unknown';
  }
}

/**
 * Parse workspace JSON file
 */
function parseWorkspaceData(workspaceJson, workspaceDir, stats) {
  try {
    const data = JSON.parse(workspaceJson);
    let uri = null;
    let type = 'unknown';
    let name = 'Unknown';
    
    // Check for workspace or folder property
    if (data.workspace) {
      uri = data.workspace;
      type = parseWorkspaceType(uri);
      name = extractWorkspaceName(uri);
    } else if (data.folder) {
      uri = data.folder;
      type = parseWorkspaceType(uri);
      name = extractWorkspaceName(uri);
    }
    
    return {
      id: path.basename(workspaceDir),
      name,
      path: uri || 'Unknown',
      type,
      lastModified: stats.mtime.toISOString(),
      storageDir: workspaceDir
    };
  } catch (error) {
    console.error(`Error parsing workspace data:`, error);
    return null;
  }
}

/**
 * Scan a single workspace directory
 */
async function scanWorkspaceDirectory(workspaceDir) {
  try {
    const workspaceJsonPath = path.join(workspaceDir, 'workspace.json');
    
    // Check if workspace.json exists
    try {
      await fs.access(workspaceJsonPath);
    } catch {
      // workspace.json doesn't exist, skip this directory
      return null;
    }
    
    // Read workspace.json
    const workspaceJson = await fs.readFile(workspaceJsonPath, 'utf8');
    const stats = await fs.stat(workspaceJsonPath);
    
    return parseWorkspaceData(workspaceJson, workspaceDir, stats);
  } catch (error) {
    console.error(`Error scanning workspace directory ${workspaceDir}:`, error.message);
    return null;
  }
}

/**
 * Scan all workspace directories
 */
async function scanWorkspaces() {
  try {
    // Check if workspace storage directory exists
    try {
      await fs.access(WORKSPACE_STORAGE_PATH);
    } catch {
      console.error(`Workspace storage directory not found: ${WORKSPACE_STORAGE_PATH}`);
      return [];
    }
    
    // Read all subdirectories
    const entries = await fs.readdir(WORKSPACE_STORAGE_PATH, { withFileTypes: true });
    const workspaceDirs = entries
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(WORKSPACE_STORAGE_PATH, entry.name));
    
    // Scan each workspace directory
    const workspacePromises = workspaceDirs.map(scanWorkspaceDirectory);
    const workspaces = await Promise.all(workspacePromises);
    
    // Filter out null results (failed scans)
    return workspaces.filter(ws => ws !== null);
  } catch (error) {
    console.error('Error scanning workspaces:', error);
    return [];
  }
}

/**
 * Refresh workspaces cache
 */
async function refreshWorkspaces() {
  console.log('Refreshing workspaces...');
  workspacesCache = await scanWorkspaces();
  console.log(`Found ${workspacesCache.length} workspaces`);
}

/**
 * Initialize workspace scanner
 */
async function initialize() {
  console.log('Initializing workspace scanner...');
  console.log(`Workspace storage path: ${WORKSPACE_STORAGE_PATH}`);
  
  // Initial scan
  await refreshWorkspaces();
  
  // Set up periodic refresh
  setInterval(refreshWorkspaces, REFRESH_INTERVAL);
  
  console.log(`Workspace scanner initialized. Refresh interval: ${REFRESH_INTERVAL}ms`);
}

/**
 * Get cached workspaces
 */
function getWorkspaces() {
  return workspacesCache;
}

module.exports = {
  initialize,
  getWorkspaces,
  refreshWorkspaces
};
