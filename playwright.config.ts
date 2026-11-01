import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the production build served by `vite preview`.
//   npm run test:e2e            (builds, starts the preview server, runs tests)
// Re-uses an already running server on :3001 (e.g. `npm run preview -- --port 3001`).
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run preview -- --port 3001 --strictPort',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
