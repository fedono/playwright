import { test, expect } from '@playwright/test';
import type { Reporter, TestCase } from '@playwright/test/reporter';

test.use({ locale: 'en-US' });

test.describe('block', () => {
  test.beforeAll(async ({ browser }) => {
  });
  test.afterAll(async ({ browser }) => {
  });
  test.beforeEach(async ({ page }) => {
  });
  test.afterEach(async ({ page }) => {
  });
  test('should work', async ({ page, browserName }, testInfo) => {
    test.skip(browserName === 'chromium');
    await page.click(testInfo.title);
    testInfo.annotations.push({ type: 'foo' });
    await page.fill(testInfo.outputPath('foo', 'bar'), testInfo.outputDir);
  });
});

const test2 = test.extend<{ foo: string, bar: number }>({
  foo: '123',
  bar: async ({ foo }, use) => {
    await use(parseInt(foo, 10));
  },
});

test2('should work 2', async ({ foo, bar }) => {
  bar += parseInt(foo, 10);
  expect(bar).toBe(123 * 2);
});

export class MyReporter implements Reporter {
  onTestBegin(test: TestCase) {
    test.titlePath().slice();
    if (test.results[0].status === test.expectedStatus)
      console.log(`Nice test ${test.title} at ${test.location.file}`);
  }
}
