
import { baseTest } from '../config/baseTest';
import type { PageTestFixtures, PageWorkerFixtures } from '../page/pageTestApi';
import type { AndroidDevice, BrowserContext } from 'playwright-core';
export { expect } from '@playwright/test';

type AndroidWorkerFixtures = PageWorkerFixtures & {
  androidDevice: AndroidDevice;
  androidContext: BrowserContext;
};

export const androidTest = baseTest.extend<PageTestFixtures, AndroidWorkerFixtures>({
  androidDevice: [async ({ playwright }, run) => {
    const device = (await playwright._android.devices())[0];
    await device.shell('am force-stop org.chromium.webview_shell');
    await device.shell('am force-stop com.android.chrome');
    device.setDefaultTimeout(90000);
    await run(device);
    await device.close();
  }, { scope: 'worker' }],

  browserVersion: [async ({ androidDevice }, run) => {
    const browserVersion = (await androidDevice.shell('dumpsys package com.android.chrome'))
        .toString('utf8')
        .split('\n')
        .find(line => line.includes('versionName='))!
        .trim()
        .split('=')[1];
    await run(browserVersion);
  }, { scope: 'worker' }],

  browserMajorVersion: [async ({ browserVersion }, run) => {
    await run(Number(browserVersion.split('.')[0]));
  }, { scope: 'worker' }],

  isAndroid: [true, { scope: 'worker' }],
  isElectron: [false, { scope: 'worker' }],
  isWebView2: [false, { scope: 'worker' }],

  androidContext: [async ({ androidDevice }, run) => {
    const context = await androidDevice.launchBrowser();
    const [page] = context.pages();
    await page.goto('data:text/html,Default page');
    await run(context);
  }, { scope: 'worker' }],

  page: async ({ androidContext }, run) => {
    // Retain default page, otherwise Clank will re-create it.
    while (androidContext.pages().length > 1)
      await androidContext.pages()[1].close();
    const page = await androidContext.newPage();
    await run(page);
  },
});
