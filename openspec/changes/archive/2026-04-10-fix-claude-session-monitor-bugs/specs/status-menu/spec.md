## ADDED Requirements

### Requirement: Claude session summary in tray menu
The system SHALL display an accurate summary of Claude session states in the tray context menu.

#### Scenario: Summary shows separate counts for each state
- **WHEN** Claude sessions are running with mixed states
- **THEN** the tray menu SHALL display a summary line with separate counts: working, waiting, and idle
- **AND** each count SHALL only include sessions in that specific state

#### Scenario: Summary with only working sessions
- **WHEN** only working sessions exist (no waiting or idle)
- **THEN** the summary line SHALL show only the working count (e.g., "Claude: 3 working")

#### Scenario: Summary with zombies
- **WHEN** zombie sessions exist alongside live sessions
- **THEN** the zombie count SHALL be shown separately (e.g., "Claude: 2 working, 1 zombie")

#### Scenario: No sessions
- **WHEN** no Claude sessions are running and no zombies exist
- **THEN** the Claude summary line SHALL NOT appear in the tray menu
