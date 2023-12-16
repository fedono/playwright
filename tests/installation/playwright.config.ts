import path from 'path';
import { defineConfig } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: path.join(__dirname, '..', '..', '.env') });

const reporters = () => {
  const result: ReporterDescription[] = process.env.CI ? [
    ['dot'],
    ['json', { outputFile: path.join(outputDir, 'report.json') }],
    ['blob'],
  ] : [
    ['list'],
    ['html', { open: 'on-failure' }]
  ];
  return result;
};

const outputDir = path.join(__dirname, '..', '..', 'test-results');
export default defineConfig({
  globalSetup: path.join(__dirname, 'globalSetup'),
  outputDir,
  testIgnore: '**\/fixture-scripts/**',
  timeout: 5 * 60 * 1000,
  retries: 0,
  reporter: reporters(),
  forbidOnly: !!process.env.CI,
  workers: 1,
  projects: [
    {
      name: 'installation tests',
      metadata: {
        nodejsVersion: process.version,
      },
    },
  ],
});
