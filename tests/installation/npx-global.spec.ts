
import { test, expect } from './npmTest';

test.use({ isolateBrowsers: true, allowGlobalInstall: true });

test('npx playwright --help should not download browsers', async ({ exec, installedSoftwareOnDisk }) => {
  const result = await exec('npx playwright --help');
  expect(result).toHaveLoggedSoftwareDownload([]);
  expect(await installedSoftwareOnDisk()).toEqual([]);
  expect(result).not.toContain(`To avoid unexpected behavior, please install your dependencies first`);
});

test('npx playwright codegen', async ({ exec, installedSoftwareOnDisk }) => {
  const stdio = await exec('npx playwright codegen', { expectToExitWithError: true });
  expect(stdio).toHaveLoggedSoftwareDownload([]);
  expect(await installedSoftwareOnDisk()).toEqual([]);
  expect(stdio).toContain(`Please run the following command to download new browsers`);
});

test('npx playwright install global', async ({ exec, installedSoftwareOnDisk }) => {
  test.skip(process.platform === 'win32', 'isLikelyNpxGlobal() does not work in this setup on our bots');

  const result = await exec('npx playwright install');
  expect(result).toHaveLoggedSoftwareDownload(['chromium', 'ffmpeg', 'firefox', 'webkit']);
  expect(await installedSoftwareOnDisk()).toEqual(['chromium', 'ffmpeg', 'firefox', 'webkit']);
  expect(result).not.toContain(`Please run the following command to download new browsers`);
  expect(result).toContain(`To avoid unexpected behavior, please install your dependencies first`);
});
