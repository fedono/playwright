
import { test } from './npmTest';
import os from 'os';

test('playwright should work with relative home path', async ({ exec }) => {
  test.skip(os.platform().startsWith('win'));

  const env = { PLAYWRIGHT_BROWSERS_PATH: '0', HOME: '.' };
  await exec('npm i playwright @playwright/browser-chromium @playwright/browser-webkit', { env });
  // Firefox does not work with relative HOME.
  await exec('node sanity.js playwright chromium webkit', { env });
});
