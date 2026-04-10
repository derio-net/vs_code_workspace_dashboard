## MODIFIED Requirements

### Requirement: Claude integration gated on hook configuration
The system SHALL hide all Claude session UI elements when hooks are not configured, and SHALL show them when hook configuration is detected asynchronously.

#### Scenario: Hooks not configured
- **WHEN** the API returns `hookConfigured: false`
- **THEN** the Claude column, summary panel, and all Claude indicators SHALL be hidden

#### Scenario: Hooks are configured
- **WHEN** the API returns `hookConfigured: true`
- **THEN** the Claude column and summary panel SHALL be visible

#### Scenario: Hook configuration detected after initial render
- **WHEN** the component mounts before the API has responded
- **AND** the API subsequently returns `hookConfigured: true`
- **THEN** the Claude column SHALL become visible without requiring a page reload
- **AND** this SHALL NOT override a user's manual column visibility toggle
