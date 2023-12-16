import { test as it, expect } from './pageTest';

it.skip(({ isWebView2 }) => isWebView2, 'Page.close() is not supported in WebView2');

it('should close page with active dialog', async ({ page }) => {
  await page.setContent(`<button onclick="setTimeout(() => alert(1))">alert</button>`);
  void page.click('button');
  await page.waitForEvent('dialog');
  await page.close();
});

it('should not accept dialog after close', async ({ page, mode }) => {
  it.fixme(mode.startsWith('service2'), 'Times out');
  const promise = page.waitForEvent('dialog');
  page.evaluate(() => alert()).catch(() => {});
  const dialog = await promise;
  await page.close();
  const e = await dialog.dismiss().catch(e => e);
  expect(e.message).toContain('Target page, context or browser has been closed');
});
