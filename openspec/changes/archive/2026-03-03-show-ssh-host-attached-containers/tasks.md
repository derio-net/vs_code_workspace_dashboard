## 1. SSH Host Extraction

- [x] 1.1 Update `extractSSHHost` in `src/components/Dashboard.js` to match `@ssh-remote%2B([^/]+)` from attached-container URIs and return the decoded host
- [x] 1.2 Update `extractSSHHost` in `src/components/WorkspaceTable.js` with the same logic

## 2. Clean Path Extraction

- [x] 2.1 Update `extractWorkspacePath` in `src/components/Dashboard.js` to extract the path after `@ssh-remote%2B<host>` for attached-container URIs
- [x] 2.2 Update `extractWorkspacePath` in `src/components/WorkspaceTable.js` with the same logic

## 3. Verification

- [x] 3.1 Manually verify with a sample URI that SSH Host and Path columns display correctly for a remotely-attached container workspace
