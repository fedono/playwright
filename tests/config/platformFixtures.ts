import { test } from '@playwright/test';

export type PlatformWorkerFixtures = {
  platform: 'win32' | 'darwin' | 'linux';
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
};

function platform(): 'win32' | 'darwin' | 'linux' {
  if (process.env.PLAYWRIGHT_SERVICE_OS === 'linux')
    return 'linux';
  if (process.env.PLAYWRIGHT_SERVICE_OS === 'windows')
    return 'win32';
  if (process.env.PLAYWRIGHT_SERVICE_OS === 'macos')
    return 'darwin';
  return process.platform as 'win32' | 'darwin' | 'linux';
}

export const platformTest = test.extend<{}, PlatformWorkerFixtures>({
  platform: [platform(), { scope: 'worker' }],
  isWindows: [platform() === 'win32', { scope: 'worker' }],
  isMac: [platform() === 'darwin', { scope: 'worker' }],
  isLinux: [platform() === 'linux', { scope: 'worker' }],
});
