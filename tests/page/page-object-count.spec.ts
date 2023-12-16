
import { test, expect } from './pageTest';

test('should count objects', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium');
  await page.setContent('<button>Submit</button>');
  await page.evaluate(() => document.querySelectorAll('button'));
  const proto = await page.evaluateHandle(() => HTMLButtonElement.prototype);
  expect(await (proto as any)._objectCount()).toBe(1);
});
