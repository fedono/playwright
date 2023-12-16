import { test as baseTest, expect as expectBase } from '@playwright/test';
import type { Page } from '@playwright/test';

export const test = baseTest.extend<{ plugin: string }>({
  plugin: async ({}, use) => {
    await use('hello from plugin');
  },
});

export const expect = expectBase.extend({
  async toContainText(page: Page, expected: string) {
    const locator = page.getByText(expected);

    let pass: boolean;
    let matcherResult: any;
    try {
      await expectBase(locator).toBeVisible();
      pass = true;
    } catch (e: any) {
      matcherResult = e.matcherResult;
      pass = false;
    }

    return {
      name: 'toContainText',
      expected,
      message: () => matcherResult.message,
      pass,
      actual: matcherResult?.actual,
      log: matcherResult?.log,
    };
  }
});
