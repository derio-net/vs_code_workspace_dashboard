## ADDED Requirements

### Requirement: Select workspaces for deletion
The system SHALL allow users to select one or more workspaces for deletion.

#### Scenario: Select single workspace
- **WHEN** a user clicks the checkbox in a workspace row
- **THEN** the workspace SHALL be marked as selected
- **AND** the delete button SHALL become active

#### Scenario: Select multiple workspaces
- **WHEN** a user clicks checkboxes in multiple workspace rows
- **THEN** all selected workspaces SHALL be marked as selected
- **AND** the delete button SHALL display the count of selected workspaces

#### Scenario: Deselect workspace
- **WHEN** a user clicks a checked checkbox
- **THEN** the workspace SHALL be deselected
- **AND** if no workspaces remain selected, the delete button SHALL become inactive

#### Scenario: Select all workspaces
- **WHEN** a user clicks a "Select All" checkbox in the table header
- **THEN** all visible workspaces SHALL be selected

#### Scenario: Deselect all workspaces
- **WHEN** a user clicks the "Select All" checkbox while all workspaces are selected
- **THEN** all workspaces SHALL be deselected

### Requirement: Delete workspace references
The system SHALL provide functionality to delete selected workspace references from the OS-specific Path.

#### Scenario: Delete button visibility
- **WHEN** at least one workspace is selected
- **THEN** a delete button SHALL be visible and enabled
- **AND** the button SHALL display the number of selected workspaces

#### Scenario: Delete confirmation dialog
- **WHEN** a user clicks the delete button
- **THEN** a confirmation dialog SHALL appear
- **AND** the dialog SHALL display the names of workspaces to be deleted
- **AND** the dialog SHALL require explicit confirmation to proceed

#### Scenario: Cancel deletion
- **WHEN** a user clicks "Cancel" in the confirmation dialog
- **THEN** the dialog SHALL close
- **AND** the workspaces SHALL remain selected
- **AND** no deletion SHALL occur

#### Scenario: Confirm deletion
- **WHEN** a user clicks "Confirm" in the confirmation dialog
- **THEN** the system SHALL remove the selected workspace paths from the OS-specific Path
- **AND** the deleted workspaces SHALL be removed from the table
- **AND** a success message SHALL be displayed

### Requirement: Deletion validation
The system SHALL validate before deleting workspace references.

#### Scenario: Validate selected workspaces exist in Path
- **WHEN** deletion is confirmed
- **THEN** the system SHALL verify each selected workspace exists in the OS-specific Path
- **AND** if a workspace is not found, it SHALL be skipped with a warning

#### Scenario: Handle deletion errors
- **WHEN** an error occurs during deletion
- **THEN** the system SHALL display an error message
- **AND** successfully deleted workspaces SHALL be removed from the table
- **AND** failed deletions SHALL remain selected
