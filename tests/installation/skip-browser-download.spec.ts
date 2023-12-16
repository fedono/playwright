
import { test, expect } from './npmTest';

test.use({ isolateBrowsers: true });

test('should skip browser installs', async ({ exec, installedSoftwareOnDisk }) => {
  const result = await exec('npm i --foreground-scripts playwright @playwright/browser-firefox', { env: { PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' } });
  expect(result).toHaveLoggedSoftwareDownload([]);
  expect(await installedSoftwareOnDisk()).toEqual([]);
  expect(result).toContain(`Skipping browsers download because`);

  if (process.platform === 'linux') {
    const output = await exec('node inspector-custom-executable.js', { env: { PWDEBUG: '1' } });
    expect(output).toContain('SUCCESS');
  }
});
