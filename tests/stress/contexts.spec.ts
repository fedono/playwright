import { contextTest as test, expect } from '../config/browserTest';

for (let i = 0; i < 1000; ++i) {
  test('cycle contexts ' + i, async ({ page, server }) => {
    await page.goto(server.PREFIX + '/stress/index.html');
    await expect(page.locator('text=Learn React')).toBeVisible();
  });
}
