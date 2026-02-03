## Why

VS Code remote workspaces (SSH, dev containers, etc.) are currently generated with the URI format `vscode-remote://ssh-remote...`, which VS Code does not recognize as a valid protocol handler. The correct format is `vscode://vscode-remote/ssh-remote...`, which allows VS Code to properly intercept and open the remote workspace.

## What Changes

- Update the URL format conversion logic to transform `vscode-remote://` URIs to `vscode://vscode-remote/` format
- Ensure SSH remote, dev container, and attached container workspaces use the correct URI scheme
- Maintain backward compatibility with local file workspaces

## Capabilities

### New Capabilities
- `vscode-remote-uri-conversion`: Transform vscode-remote:// URIs to the correct vscode://vscode-remote/ format that VS Code recognizes

### Modified Capabilities
- `basic-view-dashboard`: Update workspace link generation to use corrected remote URI format

## Impact

- **Frontend**: [`WorkspaceTable.js`](src/components/WorkspaceTable.js) - URI conversion logic
- **Backend**: [`workspaceScanner.js`](server/workspaceScanner.js) - Workspace type detection
- **User Experience**: Remote workspaces will now open correctly in VS Code when clicked
