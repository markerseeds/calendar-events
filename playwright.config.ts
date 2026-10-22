import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  // One browser at a time: on some Windows machines several headless Chromium
  // processes started together stall until they time out, and even serial runs
  // occasionally stall right after a fresh build. The suite is small, so running
  // it serially costs a few seconds; a retry absorbs the rare stall, and
  // Playwright still reports any test that needed one as "flaky".
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    // Same time zone as the Jest suite, so dates render identically everywhere.
    timezoneId: 'Pacific/Auckland',
    locale: 'en-NZ',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
