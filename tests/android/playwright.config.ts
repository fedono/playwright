
import { config as loadEnv } from 'dotenv';
loadEnv({ path: path.join(__dirname, '..', '..', '.env') });

import type { Config, PlaywrightTestOptions, PlaywrightWorkerOptions } from '@playwright/test';
import * as path from 'path';
import type { ServerWorkerOptions } from '../config/serverFixtures';

process.env.PWPAGE_IMPL = 'android';

const outputDir = path.join(__dirname, '..', '..', 'test-results');
const testDir = path.join(__dirname, '..');
const config: Config<ServerWorkerOptions & PlaywrightWorkerOptions & PlaywrightTestOptions> = {
  testDir,
  outputDir,
  timeout: 120000,
  globalTimeout: 7200000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [
    ['dot'],
    ['json', { outputFile: path.join(outputDir, 'report.json') }],
  ] : 'line',
  projects: [],
};

const metadata = {
  platform: 'Android',
  headful: false,
  browserName: 'chromium',
  channel: 'chrome',
  mode: 'default',
  video: false,
};

config.projects!.push({
  name: 'android',
  use: {
    loopback: '10.0.2.2',
    browserName: 'chromium',
  },
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
  testDir: path.join(testDir, 'android'),
  metadata,
});

config.projects!.push({
  name: 'android',
  use: {
    loopback: '10.0.2.2',
    browserName: 'chromium',
  },
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
  testDir: path.join(testDir, 'page'),
  metadata,
});

export default config;
