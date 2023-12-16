import fs from 'fs';
import { playwrightTest as test, expect } from '../config/browserTest';

test('browserType.executablePath should work', async ({ browserType, channel, mode }) => {
  test.skip(!!channel, 'We skip browser download when testing a channel');
  test.skip(mode.startsWith('service'));
  test.skip(!!(browserType as any)._defaultLaunchOptions.executablePath, 'Skip with custom executable path');

  const executablePath = browserType.executablePath();
  expect(fs.existsSync(executablePath)).toBe(true);
});

test('browserType.name should work', async ({ browserType, browserName }) => {
  expect(browserType.name()).toBe(browserName);
});

test('should throw when trying to connect with not-chromium', async ({ browserType, browserName }) => {
  test.skip(browserName === 'chromium');

  const error = await browserType.connectOverCDP({ endpointURL: 'ws://foo' }).catch(e => e);
  expect(error.message).toBe('Connecting over CDP is only supported in Chromium.');
});
