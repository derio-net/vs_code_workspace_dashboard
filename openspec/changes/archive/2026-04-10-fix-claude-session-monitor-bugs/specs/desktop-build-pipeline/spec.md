## ADDED Requirements

### Requirement: Clean frontend template in public/index.html
The system SHALL maintain a clean CRA template in `public/index.html` that contains no build-injected script or CSS tags.

#### Scenario: Template contains no script or link tags for built assets
- **WHEN** the source `public/index.html` is inspected
- **THEN** it SHALL NOT contain any `<script>` tags referencing `/static/js/`
- **AND** it SHALL NOT contain any `<link>` tags referencing `/static/css/`

#### Scenario: Build produces exactly one script and one CSS tag
- **WHEN** `npm run build` completes
- **THEN** the output `public/index.html` SHALL contain exactly one `<script defer>` tag
- **AND** exactly one `<link rel="stylesheet">` tag
- **AND** subsequent builds SHALL NOT accumulate additional tags

#### Scenario: Stale build artifacts are removed
- **WHEN** `npm run build` runs
- **THEN** previous JS bundles in `public/static/js/` SHALL be removed before the new build output is copied
- **AND** previous CSS bundles in `public/static/css/` SHALL be removed
