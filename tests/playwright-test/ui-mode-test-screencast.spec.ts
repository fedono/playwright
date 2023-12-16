import { test, expect, retries } from './ui-mode-fixtures';

test.describe.configure({ mode: 'parallel', retries });

test('should show screenshots', async ({ runUITest }) => {
  const { page } = await runUITest({
    'a.test.ts': `
      import { test } from '@playwright/test';
      test('test 1', async ({ page }) => {
        await page.setContent('<div style="background: red; width: 100%; height: 100%"></div>');
        await page.waitForTimeout(1000);
      });
      test('test 2', async ({ page }) => {
        await page.setContent('<div style="background: blue; width: 100%; height: 100%"></div>');
        await page.waitForTimeout(1000);
      });
    `,
  });
  await page.getByTitle('Run all').click();
  await expect(page.getByTestId('status-line')).toHaveText('2/2 passed (100%)');

  await page.getByText('test 1', { exact: true }).click();
  await expect(
      page.locator('.CodeMirror .source-line-running'),
  ).toContainText(`test('test 1', async ({ page }) => {`);
  await expect(page.locator('.film-strip-frame').first()).toBeVisible();

  await page.getByText('test 2', { exact: true }).click();
  await expect(
      page.locator('.CodeMirror .source-line-running'),
  ).toContainText(`await page.waitForTimeout(1000);`);
  await expect(page.locator('.film-strip-frame').first()).toBeVisible();
});
