## MODIFIED Requirements

### Requirement: Display dashboard UI
CHANGED: The "Last Modified" column is renamed to "Last Accessed" and displays the workspace's last-accessed time instead of last-modified time.

#### Scenario: Dashboard displays workspace information with correct columns
- **WHEN** the dashboard is loaded
- **THEN** each workspace is displayed with columns: Name, Last Accessed, Type, Connection, and Path in a sortable, resizable table

### Requirement: Sort workspace list
CHANGED: The date sort column is "Last Accessed" instead of "Last Modified". Default sort is by last-accessed descending.

#### Scenario: Default sort is by last accessed date descending
- **WHEN** the dashboard loads with no user-specified sort
- **THEN** the workspace list SHALL be sorted by last-accessed date, newest first

#### Scenario: User sorts by last accessed date
- **WHEN** a user clicks the "Last Accessed" column header
- **THEN** the workspace list is sorted by last-accessed date (newest first or oldest first on toggle)

### Requirement: Expose workspace data via REST API
CHANGED: API response field renamed from `lastModified` to `lastAccessed`.

#### Scenario: API response includes required fields
- **WHEN** a GET request is made to `/api/workspaces`
- **THEN** each workspace object includes: name, path, type, and lastAccessed (ISO 8601 timestamp of storage directory access time)
