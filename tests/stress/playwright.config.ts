import { defineConfig } from '@playwright/test';

export default defineConfig({
  forbidOnly: !!process.env.CI,
  reporter: 'html',
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium'
      },
    },

    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        channel: process.platform !== 'win32' ? 'firefox-asan' : undefined,
      },
    },

    {
      name: 'webkit',
      use: {
        browserName: 'webkit'
      },
    },
  ]
});
