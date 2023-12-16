

import { test, expect } from './npmTest';

test.use({ isolateBrowsers: true });

for (const browser of ['chromium', 'firefox', 'webkit']) {
  test(`playwright-${browser} should work`, async ({ exec, installedSoftwareOnDisk }) => {
    const pkg = `playwright-${browser}`;
    const result = await exec('npm i --foreground-scripts', pkg);
    const browserName = pkg.split('-')[1];
    const expectedSoftware = [browserName];
    if (browserName === 'chromium')
      expectedSoftware.push('ffmpeg');
    expect(result).toHaveLoggedSoftwareDownload(expectedSoftware as any);
    expect(await installedSoftwareOnDisk()).toEqual(expectedSoftware);
    expect(result).not.toContain(`To avoid unexpected behavior, please install your dependencies first`);
    await exec('node sanity.js', pkg, browser);
    await exec('node', `esm-${pkg}.mjs`);
  });
}

for (const browser of ['chromium', 'firefox', 'webkit']) {
  test(`@playwright/browser-${browser} should work`, async ({ exec, installedSoftwareOnDisk }) => {
    const pkg = `@playwright/browser-${browser}`;
    const expectedSoftware = [browser];
    if (browser === 'chromium')
      expectedSoftware.push('ffmpeg');

    const result1 = await exec('npm i --foreground-scripts', pkg);
    expect(result1).toHaveLoggedSoftwareDownload(expectedSoftware as any);
    expect(await installedSoftwareOnDisk()).toEqual(expectedSoftware);
    expect(result1).not.toContain(`To avoid unexpected behavior, please install your dependencies first`);

    const result2 = await exec('npm i --foreground-scripts playwright');
    expect(result2).toHaveLoggedSoftwareDownload([]);
    expect(await installedSoftwareOnDisk()).toEqual(expectedSoftware);

    await exec('node sanity.js playwright', browser);
    await exec('node browser-only.js', pkg);
  });
}

test(`playwright-core should work`, async ({ exec, installedSoftwareOnDisk }) => {
  const result1 = await exec('npm i --foreground-scripts playwright-core');
  expect(result1).toHaveLoggedSoftwareDownload([]);
  expect(await installedSoftwareOnDisk()).toEqual([]);
  const stdio = await exec('npx playwright-core', 'test', '-c', '.', { expectToExitWithError: true });
  expect(stdio).toContain(`Please install @playwright/test package`);
});

test(`playwright should work`, async ({ exec, installedSoftwareOnDisk }) => {
  const result1 = await exec('npm i --foreground-scripts playwright');
  expect(result1).toHaveLoggedSoftwareDownload([]);
  expect(await installedSoftwareOnDisk()).toEqual([]);

  const result2 = await exec('npx playwright install');
  expect(result2).toHaveLoggedSoftwareDownload(['chromium', 'ffmpeg', 'firefox', 'webkit']);
  expect(await installedSoftwareOnDisk()).toEqual(['chromium', 'ffmpeg', 'firefox', 'webkit']);

  await exec('node sanity.js playwright chromium firefox webkit');
  await exec('node esm-playwright.mjs');
});

test('@playwright/test should work', async ({ exec, installedSoftwareOnDisk }) => {
  const result1 = await exec('npm i --foreground-scripts @playwright/test');
  expect(result1).toHaveLoggedSoftwareDownload([]);
  expect(await installedSoftwareOnDisk()).toEqual([]);

  await exec('npx playwright test -c . sample.spec.js', { expectToExitWithError: true, message: 'should not be able to run tests without installing browsers' });

  const result2 = await exec('npx playwright install');
  expect(result2).toHaveLoggedSoftwareDownload(['chromium', 'ffmpeg', 'firefox', 'webkit']);
  expect(await installedSoftwareOnDisk()).toEqual(['chromium', 'ffmpeg', 'firefox', 'webkit']);

  await exec('node sanity.js @playwright/test chromium firefox webkit');
  await exec('node', 'esm-playwright-test.mjs');

  const result3 = await exec('npx playwright test -c . --browser=all --reporter=list sample.spec.js');
  expect(result3).toContain('3 passed');

  const result4 = await exec('npx playwright test -c . failing.spec.js', { expectToExitWithError: true, env: { DEBUG: 'pw:api' } });
  expect(result4).toContain('expect.toHaveText started');
  expect(result4).toContain('failing.spec.js:5:38');
});
