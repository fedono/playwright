import { defineConfig, devices } from '@playwright/experimental-ct-vue';
import { resolve } from 'path';

export default defineConfig({
  testDir: 'tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'html' : 'line',
  use: {
    trace: 'on-first-retry',
    ctViteConfig: {
      resolve: {
        alias: {
          '@': resolve(__dirname, './src'),
        }
      }
    }
  },
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
});
