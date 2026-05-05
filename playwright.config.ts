import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 2 : '50%',
  reporter: [['html'], ['github']],
  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      // skip new specs that only need single-browser coverage
      testIgnore: ['**/a11y.spec.ts', '**/pdf-export.spec.ts', '**/mobile-viewport.spec.ts'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      // only run the mobile-specific viewport tests
      testMatch: ['**/mobile-viewport.spec.ts'],
    },
    // mobile-safari omitted: CI installs chromium+firefox only (no webkit)
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    timeout: 180_000,
    reuseExistingServer: !process.env['CI'],
  },
});
