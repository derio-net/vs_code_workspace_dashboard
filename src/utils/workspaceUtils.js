/**
 * Decode a hex-encoded JSON host string from VS Code's newer SSH remote URIs.
 *
 * @param {string} hexString - Hex-encoded JSON (e.g., "7b22686f73744e616d65223a22...7d")
 * @returns {{ hostName: string, user?: string, port?: number }}
 * @throws {Error} If hex decoding or JSON parsing fails
 */
export function decodeHexHost(hexString) {
  let decoded = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const byte = parseInt(hexString.substring(i, i + 2), 16);
    if (isNaN(byte)) {
      throw new Error('Invalid hex character at position ' + i);
    }
    decoded += String.fromCharCode(byte);
  }
  const parsed = JSON.parse(decoded);
  if (!parsed.hostName || typeof parsed.hostName !== 'string') {
    throw new Error('Missing or invalid hostName in decoded JSON');
  }
  return {
    hostName: parsed.hostName,
    ...(parsed.user && { user: parsed.user }),
    ...(parsed.port !== undefined && { port: parsed.port }),
  };
}

/**
 * Format connection info into a human-readable string.
 *
 * @param {{ hostName: string, user?: string, port?: number }} info
 * @returns {string} Formatted as "user@host:port" with absent parts omitted
 */
export function formatConnectionInfo({ hostName, user, port }) {
  let result = '';
  if (user) {
    result += user + '@';
  }
  result += hostName;
  if (port !== undefined) {
    result += ':' + port;
  }
  return result;
}

/**
 * Extract connection info from a workspace URI.
 *
 * Returns an object with display string, optional error flag, and raw value.
 * Handles both plain hostnames and hex-encoded JSON host blobs.
 *
 * @param {object} workspace - Workspace object with path and type
 * @returns {{ display: string, error?: boolean, raw?: string }}
 */
export function extractConnectionInfo(workspace) {
  const rawHost = _extractRawHost(workspace);
  if (!rawHost) {
    return { display: '' };
  }

  // Detect hex-encoded JSON: always starts with 7b22 (hex for '{"')
  if (rawHost.startsWith('7b22')) {
    try {
      const info = decodeHexHost(rawHost);
      return { display: formatConnectionInfo(info), raw: rawHost };
    } catch {
      return { display: '\u26a0 decode error', error: true, raw: rawHost };
    }
  }

  return { display: rawHost };
}

/**
 * Extract raw host string from workspace URI (before hex decoding).
 * @private
 */
function _extractRawHost(workspace) {
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
 * @deprecated Use extractConnectionInfo() instead. This returns only the display string.
 */
export function extractSSHHost(workspace) {
  return extractConnectionInfo(workspace).display;
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
