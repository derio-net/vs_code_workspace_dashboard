/**
 * Extract SSH host from a workspace URI.
 *
 * Handles:
 * - ssh-remote workspaces: vscode-remote://ssh-remote%2B<host>/path
 * - attached containers on remote SSH hosts: ...@ssh-remote%2B<host>/path
 */
export function extractSSHHost(workspace) {
  const path = workspace.path;
  const type = workspace.type;

  // Handle any URI with @ssh-remote%2B (e.g., attached-container on remote host)
  const remoteMatch = path.match(/@ssh-remote%2B([^/]+)/);
  if (remoteMatch) {
    return decodeURIComponent(remoteMatch[1]);
  }

  if (type === 'ssh-remote' && path.includes('ssh-remote')) {
    // Handle URL-encoded format: vscode-remote://ssh-remote%2Bhost/path
    const encodedMatch = path.match(/ssh-remote%2B([^/]+)/);
    if (encodedMatch) {
      return decodeURIComponent(encodedMatch[1]);
    }
    // Handle vscode://vscode-remote/ssh-remote+host@/path format
    const match = path.match(/ssh-remote\+([^@/]+)/);
    if (match) {
      return match[1];
    }
  }
  return '';
}

/**
 * Extract a clean filesystem path from a workspace URI.
 *
 * Handles local file:// URIs, ssh-remote, dev-container, and
 * attached-container (including those tunneled through SSH).
 */
export function extractWorkspacePath(workspace) {
  const path = workspace.path;
  const type = workspace.type;

  if (type === 'local') {
    let cleanPath = path;
    if (cleanPath.startsWith('file://')) {
      cleanPath = cleanPath.substring(7);
    }
    try {
      return decodeURIComponent(cleanPath);
    } catch (e) {
      return cleanPath;
    }
  } else if (type === 'ssh-remote') {
    const encodedMatch = path.match(/ssh-remote%2B[^/]+(.+)$/);
    if (encodedMatch) {
      return encodedMatch[1];
    }
    const match = path.match(/ssh-remote\+[^@/]+@?(.+)$/);
    if (match) {
      return match[1];
    }
    return path;
  } else if (type === 'dev-container' || type === 'attached-container') {
    // For containers on remote SSH hosts: extract path after @ssh-remote%2B<host>
    const remoteMatch = path.match(/@ssh-remote%2B[^/]+(\/.*)/);
    if (remoteMatch) {
      return remoteMatch[1];
    }
    // For local containers, try to extract the path portion (+ may be literal or %2B-encoded)
    const match = path.match(/(?:\+|%2B)[^/]+(\/.*)$/i);
    if (match) {
      return match[1];
    }
    return path;
  }
  return path;
}
