import { devices, defineConfig } from '@playwright/experimental-ct-react';
import type { ReporterDescription } from '@playwright/test';

const reporters = () => {
  const result: ReporterDescription[] = process.env.CI ? [
    ['html'],
    ['blob'],
  ] : [
    ['html']
  ];
  return result;
};

export default defineConfig({
  testDir: 'src',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: reporters(),
  use: {
    ctPort: 3102,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
