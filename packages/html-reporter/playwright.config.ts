import { devices, defineConfig } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: 'src',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  reporter: process.env.CI ? 'blob' : 'html',
  use: {
    ctPort: 3101,
    trace: 'on-first-retry',
  },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  }],
});
