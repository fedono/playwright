import { test } from '@playwright/test';
import type { TestModeName } from './testMode';
import { DefaultTestMode, DriverTestMode } from './testMode';
import * as playwrightLibrary from 'playwright-core';

export type TestModeWorkerOptions = {
  mode: TestModeName;
};

export type TestModeTestFixtures = {
  toImpl: (rpcObject?: any) => any;
};

export type TestModeWorkerFixtures = {
  toImplInWorkerScope: (rpcObject?: any) => any;
  playwright: typeof import('@playwright/test');
};

export const testModeTest = test.extend<TestModeTestFixtures, TestModeWorkerOptions & TestModeWorkerFixtures>({
  mode: ['default', { scope: 'worker', option: true }],
  playwright: [async ({ mode }, run) => {
    const testMode = {
      'default': new DefaultTestMode(),
      'service': new DefaultTestMode(),
      'service2': new DefaultTestMode(),
      'service-grid': new DefaultTestMode(),
      'driver': new DriverTestMode(),
    }[mode];
    require('playwright-core/lib/utils').setUnderTest();
    const playwright = await testMode.setup();
    playwright._setSelectors(playwrightLibrary.selectors);
    await run(playwright);
    await testMode.teardown();
  }, { scope: 'worker' }],

  toImplInWorkerScope: [async ({ playwright }, use) => {
    await use((playwright as any)._toImpl);
  }, { scope: 'worker' }],

  toImpl: async ({ toImplInWorkerScope: toImplWorker, mode }, use, testInfo) => {
    if (mode !== 'default' || process.env.PW_TEST_REUSE_CONTEXT)
      testInfo.skip();
    await use(toImplWorker);
  },
});
