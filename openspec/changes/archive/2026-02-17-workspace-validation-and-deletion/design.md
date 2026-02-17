## Context

The VS Code Workspace Dashboard currently displays workspaces in a table format without any indication of whether the underlying paths still exist. Users can accumulate stale workspace references over time, especially when projects are moved or deleted. Currently, removing these references requires manually editing the OS-specific Path environment variable, which is cumbersome and error-prone.

This change introduces two complementary features:
1. **Visual validation** - Immediate feedback when a workspace path is invalid
2. **Bulk deletion** - Easy cleanup of stale or unwanted workspace references

## Goals / Non-Goals

**Goals:**
- Validate local workspace paths and visually indicate invalid paths with red row backgrounds
- Allow users to select one or more workspaces for deletion
- Provide a delete button that removes selected workspaces from the OS Path
- Implement confirmation dialogs to prevent accidental deletions
- Maintain existing functionality for remote workspaces (no validation needed)

**Non-Goals:**
- Modifying actual filesystem directories (only removing Path references)
- Validating remote workspace URLs
- Auto-cleanup or scheduled maintenance
- Undo functionality after deletion

## Decisions

### Path Validation Strategy
**Decision**: Validate paths on the backend via API call, not on initial load.

**Rationale**: 
- Path validation requires filesystem access, which the frontend cannot do securely
- Validating all paths on load could be slow for large workspace lists
- Backend validation allows for consistent cross-platform path handling

**Alternative considered**: Frontend-only validation using Node.js APIs in a Tauri context - rejected because the app also runs in Docker/web mode where filesystem access is limited.

### Selection State Management
**Decision**: Use React state in Dashboard component for selection, not URL params.

**Rationale**:
- Selection is transient UI state, not application state
- No need to persist selection across page reloads
- Simpler implementation than URL-based selection

### Deletion Confirmation
**Decision**: Use browser native `confirm()` dialog for MVP.

**Rationale**:
- Simple, accessible, and familiar to users
- Blocks interaction until user makes a choice
- Can be upgraded to custom modal later if needed

**Alternative considered**: Custom React modal component - rejected to keep initial implementation simple, but noted as future enhancement.

### Visual Indicator for Invalid Paths
**Decision**: Red background on the entire row, not just a status icon.

**Rationale**:
- Highly visible even at a glance
- Consistent with common "error" visual patterns
- Doesn't require additional column space

**Alternative considered**: Status column with icons - rejected because it adds visual clutter and requires horizontal space.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Performance impact of validating many paths | Batch validation requests; consider caching results |
| User accidentally deleting wrong workspaces | Require explicit confirmation; show workspace names in confirmation dialog |
| Race condition: path valid during check but deleted before user acts | Acceptable - validation is point-in-time; paths can become invalid at any moment |
| Red background may be too subtle or too aggressive | Use standard error color; test with users |

## Migration Plan

No migration needed - this is a new feature that doesn't affect existing data. The change is purely additive:
1. Deploy backend changes (new API endpoints)
2. Deploy frontend changes (UI updates)
3. Existing workspaces will automatically show validation status on next load

## Open Questions

- Should we cache validation results to avoid repeated filesystem checks?
- Should invalid workspaces be sortable/filterable to the top?
- Do we need a "select all invalid" shortcut button?
