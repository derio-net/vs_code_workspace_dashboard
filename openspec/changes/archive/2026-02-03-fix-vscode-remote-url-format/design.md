## Context

Currently, the dashboard generates VS Code remote workspace URIs in the format `vscode-remote://ssh-remote...`, which VS Code's protocol handler does not recognize. The correct format that VS Code accepts is `vscode://vscode-remote/ssh-remote...`. This affects all remote workspace types: SSH remote, dev containers, and attached containers.

The issue occurs in the frontend's [`WorkspaceTable.js`](src/components/WorkspaceTable.js) where the `convertToVSCodeURI()` function handles URI conversion. The backend's [`workspaceScanner.js`](server/workspaceScanner.js) correctly identifies workspace types but the frontend doesn't transform the URI format appropriately.

## Goals / Non-Goals

**Goals:**
- Transform `vscode-remote://` URIs to `vscode://vscode-remote/` format for all remote workspace types
- Ensure remote workspaces open correctly when clicked in the dashboard
- Maintain backward compatibility with local file workspaces
- Preserve all path information and encoding in the transformation

**Non-Goals:**
- Modify backend workspace scanning logic (type detection is already correct)
- Change how workspaces are stored or cached
- Add new workspace types or detection mechanisms

## Decisions

**Decision 1: URI transformation location**
- **Choice**: Implement transformation in frontend's `convertToVSCodeURI()` function
- **Rationale**: The frontend already handles URI conversion for local workspaces. Centralizing all URI logic here keeps the concern in one place and avoids duplicating logic across backend and frontend.
- **Alternative considered**: Transform in backend before sending to frontend. Rejected because the backend correctly identifies types but doesn't need to know about VS Code's specific URI scheme requirements.

**Decision 2: Transformation approach**
- **Choice**: Check if URI starts with `vscode-remote://` and replace with `vscode://vscode-remote/`
- **Rationale**: Simple string replacement that preserves all path components and encoding. Works for all remote types (ssh-remote, dev-container, attached-container).
- **Alternative considered**: Parse and reconstruct URI components. Rejected as unnecessary complexity for a straightforward format change.

**Decision 3: Handling of different remote types**
- **Choice**: Apply the same transformation to all remote types (ssh-remote, dev-container, attached-container)
- **Rationale**: VS Code uses the same URI scheme format for all remote types; only the path component differs
- **Alternative considered**: Type-specific transformations. Rejected as unnecessary since the format is consistent.

## Risks / Trade-offs

**Risk: URI encoding edge cases**
- **Mitigation**: The transformation preserves the original URI structure, so existing encoding is maintained. Test with paths containing special characters.

**Risk: VS Code version compatibility**
- **Mitigation**: The `vscode://vscode-remote/` format is the standard protocol handler in modern VS Code versions. If users have very old VS Code versions, they may need to upgrade.

**Trade-off: No validation of URI format**
- **Rationale**: The backend already validates workspace types. Frontend assumes backend provides valid URIs and transforms them accordingly.
