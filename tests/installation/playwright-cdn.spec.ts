
import { test, expect } from './npmTest';
import http from 'http';
import type { AddressInfo } from 'net';

const CDNS = [
  'https://playwright.azureedge.net',
  'https://playwright-akamai.azureedge.net',
  'https://playwright-verizon.azureedge.net',
];

const DL_STAT_BLOCK = /^.*from url: (.*)$\n^.*to location: (.*)$\n^.*response status code: (.*)$\n^.*total bytes: (\d+)$\n^.*download complete, size: (\d+)$\n^.*SUCCESS downloading (\w+) .*$/gm;

const parsedDownloads = (rawLogs: string) => {
  const out: { url: string, status: number, name: string }[] = [];
  for (const match of rawLogs.matchAll(DL_STAT_BLOCK)) {
    const [, url, /* filepath */, status, /* size */, /* receivedBytes */, name] = match;
    out.push({ url, status: Number.parseInt(status, 10), name: name.toLocaleLowerCase() });
  }
  return out;
};

test.use({ isolateBrowsers: true });

for (const cdn of CDNS) {
  test(`playwright cdn failover should work (${cdn})`, async ({ exec, installedSoftwareOnDisk }) => {
    await exec('npm i playwright');
    const result = await exec('npx playwright install', { env: { PW_TEST_CDN_THAT_SHOULD_WORK: cdn, DEBUG: 'pw:install' } });
    expect(result).toHaveLoggedSoftwareDownload(['chromium', 'ffmpeg', 'firefox', 'webkit']);
    expect(await installedSoftwareOnDisk()).toEqual(['chromium', 'ffmpeg', 'firefox', 'webkit']);
    const dls = parsedDownloads(result);
    for (const software of ['chromium', 'ffmpeg', 'firefox', 'webkit'])
      expect(dls).toContainEqual({ status: 200, name: software, url: expect.stringContaining(cdn) });
    await exec('node sanity.js playwright chromium firefox webkit');
    await exec('node esm-playwright.mjs');
  });
}

test(`playwright cdn should race with a timeout`, async ({ exec }) => {
  const server = http.createServer(() => {});
  await new Promise<void>(resolve => server.listen(0, resolve));
  try {
    await exec('npm i playwright');
    const result = await exec('npx playwright install', {
      env: {
        PLAYWRIGHT_DOWNLOAD_HOST: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
        DEBUG: 'pw:install',
        PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT: '1000',
      },
      expectToExitWithError: true
    });
    expect(result).toContain(`timed out after 1000ms`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
