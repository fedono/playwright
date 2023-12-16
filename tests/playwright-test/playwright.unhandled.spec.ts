import { test, expect } from './playwright-test-fixtures';

test('should produce uncaughtException when page.route raises', async ({ runInlineTest, server }) => {
  const result = await runInlineTest({
    'a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('fail', async ({ page }) => {
        await page.route('**/empty.html', route => {
          throw new Error('foobar');
        });
        await page.goto('${server.EMPTY_PAGE}');
      });
    `,
  }, { workers: 1 });
  expect(result.failed).toBe(1);
  expect(result.output).toContain('foobar');
});

test('should produce unhandledRejection when page.route raises', async ({ runInlineTest, server }) => {
  const result = await runInlineTest({
    'a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('fail', async ({ page }) => {
        await page.route('**/empty.html', async route => {
          throw new Error('foobar');
        });
        await page.goto('${server.EMPTY_PAGE}');
      });
    `,
  }, { workers: 1 });
  expect(result.failed).toBe(1);
  expect(result.output).toContain('foobar');
});

test('should produce uncaughtException when context.route raises', async ({ runInlineTest, server }) => {
  const result = await runInlineTest({
    'a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('fail', async ({ context, page }) => {
        await context.route('**/empty.html', route => {
          throw new Error('foobar');
        });
        await page.goto('${server.EMPTY_PAGE}');
      });
    `,
  }, { workers: 1 });
  expect(result.failed).toBe(1);
  expect(result.output).toContain('foobar');
});

test('should produce unhandledRejection when context.route raises', async ({ runInlineTest, server }) => {
  const result = await runInlineTest({
    'a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('fail', async ({ context, page }) => {
        await context.route('**/empty.html', async route => {
          throw new Error('foobar');
        });
        await page.goto('${server.EMPTY_PAGE}');
      });
    `,
  }, { workers: 1 });
  expect(result.failed).toBe(1);
  expect(result.output).toContain('foobar');
});
