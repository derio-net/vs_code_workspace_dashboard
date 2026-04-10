## MODIFIED Requirements

### Requirement: Gate feature on hook configuration
The system SHALL check that Claude Code hooks are configured before enabling the feature.

#### Scenario: Hooks are configured
- **WHEN** `~/.claude/settings.json` contains the hook script in all three hook types: Notification, UserPromptSubmit, and Stop
- **THEN** `hookConfigured` SHALL be `true` in the API response

#### Scenario: Only partial hooks configured
- **WHEN** `~/.claude/settings.json` contains the hook script in some but not all three required hook types
- **THEN** `hookConfigured` SHALL be `false` in the API response
- **AND** the sessions array SHALL be empty

#### Scenario: Hooks are not configured
- **WHEN** the required hooks are missing from `~/.claude/settings.json`
- **THEN** `hookConfigured` SHALL be `false` in the API response
- **AND** the sessions array SHALL be empty
