/**
 * Jest configuration for server-side tests
 * Frontend tests use react-scripts' built-in Jest configuration
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/server/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js' // Exclude entry point from coverage
  ],
  coverageDirectory: 'coverage/server',
  coverageReporters: ['text', 'lcov', 'html']
};
