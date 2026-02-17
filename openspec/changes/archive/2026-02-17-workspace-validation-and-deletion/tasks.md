## 1. Backend - Path Validation API

- [x] 1.1 Add `fs-extra` dependency to server package.json (if not present)
- [x] 1.2 Create `validatePath()` utility function in `server/workspaceScanner.js`
- [x] 1.3 Create POST `/api/validate-path` endpoint in `server/index.js`
- [x] 1.4 Create POST `/api/validate-paths` endpoint for batch validation
- [ ] 1.5 Test path validation endpoints with curl/postman

## 2. Backend - Workspace Deletion API

- [x] 2.1 Create `removeWorkspacesFromPath()` function in `server/workspaceScanner.js`
- [x] 2.2 Create POST `/api/workspaces/delete` endpoint in `server/index.js`
- [x] 2.3 Add validation to ensure workspaces exist in Path before deletion
- [x] 2.4 Return appropriate success/error responses

## 3. Frontend - Path Validation UI

- [x] 3.1 Add `isValid` state to workspace data structure in `Dashboard.js`
- [x] 3.2 Call validation API when workspaces are loaded
- [x] 3.3 Add CSS class for invalid row styling in `WorkspaceTable.css`
- [x] 3.4 Apply red background styling to invalid workspace rows
- [x] 3.5 Skip validation for remote workspace URLs (http/https/vscode://)

## 4. Frontend - Workspace Selection

- [x] 4.1 Add `selectedWorkspaces` state to `Dashboard.js`
- [x] 4.2 Add checkbox column to `WorkspaceTable.js` with header checkbox
- [x] 4.3 Implement single workspace selection/deselection
- [x] 4.4 Implement "Select All" / "Deselect All" functionality
- [x] 4.5 Style checkboxes to fit existing table design

## 5. Frontend - Delete Button and Confirmation

- [x] 5.1 Add Delete button to `Dashboard.js` toolbar area
- [x] 5.2 Show selected workspace count on delete button
- [x] 5.3 Disable delete button when no workspaces selected
- [x] 5.4 Implement confirmation dialog with workspace names list
- [x] 5.5 Handle confirm/cancel actions in dialog

## 6. Frontend - Deletion API Integration

- [x] 6.1 Add `deleteWorkspaces()` API call in `src/api/client.js`
- [x] 6.2 Call deletion API on confirmation
- [x] 6.3 Remove deleted workspaces from local state
- [x] 6.4 Display success message after deletion
- [x] 6.5 Display error message if deletion fails

## 7. Testing and Polish

- [ ] 7.1 Test path validation with valid and invalid paths
- [ ] 7.2 Test selection with single and multiple workspaces
- [ ] 7.3 Test deletion flow including confirmation dialog
- [ ] 7.4 Verify red background styling on invalid paths
- [ ] 7.5 Test edge cases (empty selection, network errors)
