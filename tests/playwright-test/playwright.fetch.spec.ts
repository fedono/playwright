import { test, expect } from './playwright-test-fixtures';

test('should expose request fixture', async ({ runInlineTest, server }) => {
  const result = await runInlineTest({
    'a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('pass', async ({ request }) => {
        const response = await request.get('${server.PREFIX}/simple.json');
        const json = await response.json();
        expect(json).toEqual({ foo: 'bar' });
      });
    `,
  }, { workers: 1 });

  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(1);
});

test('should use baseURL in request fixture', async ({ runInlineTest, server }) => {
  const result = await runInlineTest({
    'playwright.config.ts': `
      module.exports = { use: { baseURL: '${server.PREFIX}' } };
    `,
    'a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('pass', async ({ request }) => {
        const response = await request.get('/simple.json');
        const json = await response.json();
        expect(json).toEqual({ foo: 'bar' });
      });
    `,
  }, { workers: 1 });

  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(1);
});

test('should stop tracing on requestContext.dispose()', async ({ runInlineTest, server }) => {
  server.setRoute('/slow', (req, resp) => {
    resp.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Length': '3',
    });
  });
  const result = await runInlineTest({
    'playwright.config.ts': `
      module.exports = {
        reporter: [['html', { open: 'never' }]],
        use: {
          trace:'retain-on-failure'
        }
      };
    `,
    'a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('hanging request', async ({ page, request }) => {
        const response = await page.goto('${server.EMPTY_PAGE}');
        expect(response.status()).toBe(200);
        await request.get('${server.PREFIX}/slow');
      });
    `,
  }, { workers: 1, timeout: 2000 });
  expect(result.output).not.toContain('ENOENT');
  expect(result.exitCode).toBe(1);
  expect(result.failed).toBe(1);
});
