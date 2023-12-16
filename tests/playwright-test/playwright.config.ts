import { config as loadEnv } from 'dotenv';
loadEnv({ path: path.join(__dirname, '..', '..', '.env') });

import { defineConfig, type ReporterDescription } from './stable-test-runner';
import * as path from 'path';

const outputDir = path.join(__dirname, '..', '..', 'test-results');
const reporters = () => {
  const result: ReporterDescription[] = process.env.CI ? [
    ['dot'],
    ['json', { outputFile: path.join(outputDir, 'report.json') }],
    ['blob', { outputDir: path.join(__dirname, '..', '..', 'blob-report') }],
  ] : [
    ['list']
  ];
  return result;
};
export default defineConfig({
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : undefined,
  snapshotPathTemplate: '__screenshots__/{testFilePath}/{arg}{ext}',
  projects: [
    {
      name: 'playwright-test',
      testDir: __dirname,
      testIgnore: ['assets/**', 'stable-test-runner/**'],
    },
    {
      name: 'image_tools',
      testDir: path.join(__dirname, '../image_tools'),
      testIgnore: [path.join(__dirname, '../fixtures/**')],
    },
  ],
  reporter: reporters(),
});
