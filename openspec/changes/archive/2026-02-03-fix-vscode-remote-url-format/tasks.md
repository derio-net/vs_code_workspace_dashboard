# Implementation Tasks: fix-vscode-remote-url-format

## 1. Update URI Conversion Logic

- [x] 1.1 Modify `convertToVSCodeURI()` function in [`WorkspaceTable.js`](src/components/WorkspaceTable.js) to transform `vscode-remote://` URIs to `vscode://vscode-remote/` format
- [x] 1.2 Add transformation for SSH remote workspaces (vscode-remote://ssh-remote → vscode://vscode-remote/ssh-remote)
- [x] 1.3 Add transformation for dev container workspaces (vscode-remote://dev-container → vscode://vscode-remote/dev-container)
- [x] 1.4 Add transformation for attached container workspaces (vscode-remote://attached-container → vscode://vscode-remote/attached-container)
- [x] 1.5 Ensure URL encoding and path components are preserved during transformation

## 2. Update Link Handling

- [x] 2.1 Update `handleWorkspaceClick()` function to use the transformed URI format
- [x] 2.2 Verify that remote workspace links use the correct `vscode://vscode-remote/` protocol in href attributes
- [x] 2.3 Test that local workspace links continue to work unchanged

## 3. Testing and Verification

- [x] 3.1 Test SSH remote workspace link opens correctly in VS Code
- [x] 3.2 Test dev container workspace link opens correctly in VS Code
- [x] 3.3 Test attached container workspace link opens correctly in VS Code
- [x] 3.4 Test local workspace links still function properly
- [x] 3.5 Verify special characters and URL encoding are preserved in transformed URIs
- [x] 3.6 Test with multiple remote workspace types in the dashboard

## 4. Documentation and Cleanup

- [x] 4.1 Update code comments in [`WorkspaceTable.js`](src/components/WorkspaceTable.js) to explain the URI transformation
- [x] 4.2 Verify no console errors or warnings related to URI handling
