import { baseTest as test } from '../config/baseTest';
import { expect } from '@playwright/test';

for (let i = 0; i < 100; ++i) {
  test('cycle browsers ' + i, async ({ playwright, browserName, server }) => {
    const browser = await playwright[browserName].launch();
    try {
      const page = await browser.newPage();
      await page.goto(server.PREFIX + '/stress/index.html');
      await expect(page.locator('text=Learn React')).toBeVisible();
    } finally {
      await browser.close();
    }
  });
}
