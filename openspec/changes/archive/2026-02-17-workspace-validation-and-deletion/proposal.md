## Why

Users need better visibility into workspace path validity and the ability to clean up stale workspace references. Currently, there's no visual indication when a workspace path becomes invalid, and users must manually edit the OS-specific Path to remove unwanted workspaces. This change improves the dashboard's usability by adding visual validation feedback and a streamlined deletion workflow.

## What Changes

- **Validation Mode**: For local workspaces only, validate that the path exists on the filesystem. If a path is not valid, color the background of the row red to provide immediate visual feedback to users.
- **Delete Workspace Reference**: Add the ability to select one or more workspaces and delete them from the dashboard via a new delete button. This removes the workspace folder reference from the OS-specific Path after user confirmation.
- **Validation Before Deletion**: Before actually deleting workspace references, validate the selection and require explicit user confirmation to prevent accidental data loss.

## Capabilities

### New Capabilities
- `workspace-path-validation`: Validate local workspace paths and provide visual feedback for invalid paths
- `workspace-deletion`: Select and delete workspace references from the dashboard with confirmation

### Modified Capabilities
<!-- No existing spec requirements are changing - these are new features on top of existing dashboard functionality -->

## Impact

- **Frontend**: [`WorkspaceTable.js`](src/components/WorkspaceTable.js) - Add path validation logic and visual styling for invalid rows
- **Frontend**: [`Dashboard.js`](src/components/Dashboard.js) - Add selection state management and delete button
- **Backend**: [`server/index.js`](server/index.js) - Add endpoint for path validation and workspace deletion
- **Backend**: [`server/workspaceScanner.js`](server/workspaceScanner.js) - Add path existence check utility
- **UI/UX**: New delete button, row selection checkboxes, confirmation dialog
