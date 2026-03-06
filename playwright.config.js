const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  expect: {
    /* Maximum time expect() should wait for the condition to be met */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3020',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'node server/index.js',
      url: 'http://localhost:3010/health',
      reuseExistingServer: true,
      timeout: 15000,
      env: {
        DASHBOARD_PORT: '3010',
        LOG_LEVEL: 'warn',
      },
    },
    {
      command: 'PORT=3020 BROWSER=none react-scripts start',
      url: 'http://localhost:3020',
      reuseExistingServer: true,
      timeout: 60000,
      env: {
        DASHBOARD_DEV_PORT: '3020',
        BROWSER: 'none',
        PORT: '3020',
      },
    },
  ],
});
