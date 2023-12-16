import { test, expect } from './playwright-test-fixtures';

test('should consider dynamically set value', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'playwright.config.js': `
      module.exports = { timeout: 2000 };
    `,
    'a.test.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}, testInfo) => {
        expect(testInfo.timeout).toBe(2000);
      })
    `
  });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(1);
});

test('should allow different timeouts', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'playwright.config.js': `
      module.exports = { projects: [
        { timeout: 2000 },
        { timeout: 4000 },
      ] };
    `,
    'a.test.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}, testInfo) => {
        console.log('timeout:' + testInfo.timeout);
      });
    `
  });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(2);
  expect(result.output).toContain('timeout:2000');
  expect(result.output).toContain('timeout:4000');
});

test('should prioritize value set via command line', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'playwright.config.js': `
      module.exports = { timeout: 2000 };
    `,
    'a.test.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}, testInfo) => {
        expect(testInfo.timeout).toBe(1000);
      })
    `
  }, { timeout: 1000 });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(1);
});
