import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180000,
  fullyParallel: true,
  forbidOnly: !!process.env.NEX_PUBLIC_CI,
  retries: process.env.NEX_PUBLIC_CI ? 2 : 0,
  workers: process.env.NEX_PUBLIC_CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.NEX_PUBLIC_CI,
  },
});