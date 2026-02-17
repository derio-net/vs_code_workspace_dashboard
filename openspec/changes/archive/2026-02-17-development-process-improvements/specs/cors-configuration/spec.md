## CHANGED Requirements

### Requirement: Proper CORS configuration for development

The system SHALL correctly configure CORS to allow API calls from the React development server.

#### Scenario: React dev server allowed origin

- **WHEN** the server starts in development mode
- **THEN** CORS SHALL allow requests from `http://localhost:3020`
- **AND** API calls from the React app SHALL succeed without CORS errors

#### Scenario: Server origin included in CORS

- **WHEN** the server starts on port 3010
- **THEN** CORS SHALL allow requests from `http://localhost:3010`

#### Scenario: Custom ports in CORS

- **WHEN** DASHBOARD_PORT is set to a custom value
- **AND** DASHBOARD_DEV_PORT is set to a custom value
- **THEN** CORS SHALL allow requests from both custom port origins

### Requirement: Dynamic CORS origin configuration

The system SHALL dynamically determine allowed origins based on environment variables.

#### Scenario: React dev server port in CORS

- **WHEN** DASHBOARD_DEV_PORT is set to 3030
- **THEN** CORS SHALL include `http://localhost:3030` in allowed origins

#### Scenario: Server port in CORS

- **WHEN** DASHBOARD_PORT is set to 3040
- **THEN** CORS SHALL include `http://localhost:3040` in allowed origins

#### Scenario: CORS origins update with port changes

- **WHEN** environment variables are changed and the server restarts
- **THEN** the CORS allowed origins SHALL be updated with the new port values

### Requirement: CORS security configuration

The system SHALL maintain appropriate CORS security configuration.

#### Scenario: Credentials support

- **WHEN** the server responds to an API request
- **THEN** it SHALL include the `Access-Control-Allow-Credentials` header set to `true`

#### Scenario: CORS preflight requests handled

- **WHEN** an OPTIONS request is sent to an API endpoint
- **THEN** the server SHALL respond with appropriate CORS headers
- **AND** it SHALL return a 200 OK status

#### Scenario: Origin validation

- **WHEN** a request is made from an origin not in the allowed list
- **THEN** the server SHALL return a 403 Forbidden status
- **AND** it SHALL not include CORS headers
