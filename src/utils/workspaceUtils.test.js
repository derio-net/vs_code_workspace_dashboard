import { extractSSHHost, extractWorkspacePath } from './workspaceUtils';

// Sample URIs matching real VS Code workspace storage formats
const REMOTE_ATTACHED_CONTAINER_URI =
  'vscode-remote://attached-container%2B7b22636f6e7461696e65724e616d65223a222f626f5f696e7374616c6c5f63757272656e74222c2273657474696e6773223a7b22686f7374223a22756e69783a2f2f2f72756e2f757365722f313030312f646f636b65722e736f636b227d7d@ssh-remote%2Bdev-server-01/opt/bo';

const LOCAL_ATTACHED_CONTAINER_URI =
  'vscode-remote://attached-container%2Babc123def/workspace/myproject';

const SSH_REMOTE_URI =
  'vscode-remote://ssh-remote%2Bmy-server/home/user/project';

const SSH_REMOTE_PLUS_URI =
  'vscode://vscode-remote/ssh-remote+my-server@/home/user/project';

const LOCAL_URI = 'file:///Users/dev/my%20project';

describe('extractSSHHost', () => {
  // Spec: Requirement "SSH host extraction from remotely-attached container URIs"

  it('extracts SSH host from attached container on remote SSH host', () => {
    const ws = { type: 'attached-container', path: REMOTE_ATTACHED_CONTAINER_URI };
    expect(extractSSHHost(ws)).toBe('dev-server-01');
  });

  it('returns empty string for attached container without SSH remote', () => {
    const ws = { type: 'attached-container', path: LOCAL_ATTACHED_CONTAINER_URI };
    expect(extractSSHHost(ws)).toBe('');
  });

  it('URL-decodes the SSH host name', () => {
    const ws = {
      type: 'attached-container',
      path: 'vscode-remote://attached-container%2Babc@ssh-remote%2Bhost%2Ewith%2Edots/path',
    };
    expect(extractSSHHost(ws)).toBe('host.with.dots');
  });

  // Regression: existing ssh-remote type still works
  it('extracts host from plain ssh-remote URI (%2B encoded)', () => {
    const ws = { type: 'ssh-remote', path: SSH_REMOTE_URI };
    expect(extractSSHHost(ws)).toBe('my-server');
  });

  it('extracts host from ssh-remote URI (+ literal)', () => {
    const ws = { type: 'ssh-remote', path: SSH_REMOTE_PLUS_URI };
    expect(extractSSHHost(ws)).toBe('my-server');
  });

  it('returns empty string for local workspaces', () => {
    const ws = { type: 'local', path: LOCAL_URI };
    expect(extractSSHHost(ws)).toBe('');
  });
});

describe('extractWorkspacePath', () => {
  // Spec: Requirement "Clean path extraction from remotely-attached container URIs"

  it('extracts path from attached container on remote SSH host', () => {
    const ws = { type: 'attached-container', path: REMOTE_ATTACHED_CONTAINER_URI };
    expect(extractWorkspacePath(ws)).toBe('/opt/bo');
  });

  it('extracts path from local attached container using +hex/path pattern', () => {
    const ws = { type: 'attached-container', path: LOCAL_ATTACHED_CONTAINER_URI };
    expect(extractWorkspacePath(ws)).toBe('/workspace/myproject');
  });

  // Regression: existing types still work
  it('extracts path from ssh-remote URI', () => {
    const ws = { type: 'ssh-remote', path: SSH_REMOTE_URI };
    expect(extractWorkspacePath(ws)).toBe('/home/user/project');
  });

  it('decodes local file:// URI', () => {
    const ws = { type: 'local', path: LOCAL_URI };
    expect(extractWorkspacePath(ws)).toBe('/Users/dev/my project');
  });
});

describe('sorting compatibility', () => {
  // Spec: Requirement "Sorting by SSH host includes remotely-attached containers"

  it('both ssh-remote and remote attached-container return non-empty host for sorting', () => {
    const attached = { type: 'attached-container', path: REMOTE_ATTACHED_CONTAINER_URI };
    const ssh = { type: 'ssh-remote', path: SSH_REMOTE_URI };

    const hostA = extractSSHHost(attached);
    const hostB = extractSSHHost(ssh);

    expect(hostA).toBeTruthy();
    expect(hostB).toBeTruthy();
    // String comparison works for sorting
    expect(typeof hostA).toBe('string');
    expect(typeof hostB).toBe('string');
  });
});
