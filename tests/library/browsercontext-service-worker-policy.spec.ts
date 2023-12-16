
import { browserTest as it, expect } from '../config/browserTest';

it('should allow service workers by default', async ({ page, server }) => {
  await page.goto(server.PREFIX + '/serviceworkers/empty/sw.html');
  await expect(page.evaluate(() => window['registrationPromise'])).resolves.toBeTruthy();
});

it.describe('block', () => {
  it.use({ serviceWorkers: 'block' });

  it('blocks service worker registration', async ({ page, server }) => {
    await Promise.all([
      page.waitForEvent('console', evt => evt.text() === 'Service Worker registration blocked by Playwright'),
      page.goto(server.PREFIX + '/serviceworkers/empty/sw.html'),
    ]);
  });
});
