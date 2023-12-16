import { config as loadEnv } from 'dotenv';
loadEnv({ path: path.join(__dirname, '..', '..', '.env') });

import type { Config, PlaywrightTestOptions, PlaywrightWorkerOptions } from '@playwright/test';
import * as path from 'path';
import type { CoverageWorkerOptions } from '../config/coverageFixtures';

process.env.PWPAGE_IMPL = 'webview2';

const outputDir = path.join(__dirname, '..', '..', 'test-results');
const testDir = path.join(__dirname, '..');
const config: Config<CoverageWorkerOptions & PlaywrightWorkerOptions & PlaywrightTestOptions> = {
  testDir,
  outputDir,
  timeout: 30000,
  globalTimeout: 5400000,
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0,
  reporter: process.env.CI ? [
    ['dot'],
    ['json', { outputFile: path.join(outputDir, 'report.json') }],
  ] : 'line',
  projects: [],
  globalSetup: './globalSetup.ts',
};

const metadata = {
  platform: process.platform,
  headful: true,
  browserName: 'webview2',
  channel: undefined,
  mode: 'default',
  video: false,
};

config.projects.push({
  name: 'webview2',
  // Share screenshots with chromium.
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}-chromium{ext}',
  use: {
    browserName: 'chromium',
    coverageName: 'webview2',
  },
  testDir: path.join(testDir, 'page'),
  metadata,
});

export default config;
