import colors from 'colors/safe';
import { test, expect } from './playwright-test-fixtures';

for (const useIntermediateMergeReport of [false, true] as const) {
  test.describe(`${useIntermediateMergeReport ? 'merged' : 'created'}`, () => {
    test.use({ useIntermediateMergeReport });

    test('render expected', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'a.test.js': `
          import { test, expect } from '@playwright/test';
          test('one', async ({}) => {
            expect(1).toBe(1);
          });
        `,
      }, { reporter: 'dot' });
      expect(result.rawOutput).toContain(colors.green('·'));
      expect(result.exitCode).toBe(0);
    });

    test('render unexpected', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'a.test.js': `
          import { test, expect } from '@playwright/test';
          test('one', async ({}) => {
            expect(1).toBe(0);
          });
        `,
      }, { reporter: 'dot' });
      expect(result.rawOutput).toContain(colors.red('F'));
      expect(result.exitCode).toBe(1);
    });

    test('render unexpected after retry', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'a.test.js': `
          import { test, expect } from '@playwright/test';
          test('one', async ({}) => {
            expect(1).toBe(0);
          });
        `,
      }, { retries: 3, reporter: 'dot' });
      const text = result.output;
      expect(text).toContain('×××F');
      expect(result.rawOutput).toContain(colors.red('F'));
      expect(result.exitCode).toBe(1);
    });

    test('render flaky', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'a.test.js': `
          import { test, expect } from '@playwright/test';
          test('one', async ({}, testInfo) => {
            expect(testInfo.retry).toBe(3);
          });
        `,
      }, { retries: 3, reporter: 'dot' });
      const text = result.output;
      expect(text).toContain('×××±');
      expect(result.rawOutput).toContain(colors.yellow('±'));
      expect(text).toContain('1 flaky');
      expect(text).toContain('Retry #1');
      expect(result.exitCode).toBe(0);
    });

    test('should work from config', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'playwright.config.ts': `
          module.exports = { reporter: 'dot' };
        `,
        'a.test.js': `
          import { test, expect } from '@playwright/test';
          test('one', async ({}) => {
            expect(1).toBe(1);
          });
        `,
      }, { reporter: 'dot' });
      expect(result.rawOutput).toContain(colors.green('·'));
      expect(result.exitCode).toBe(0);
    });

    test('render 243 tests in rows by 80', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'a.test.js': `
          import { test, expect } from '@playwright/test';
          for (let i = 0; i < 243; i++) {
            test('test' + i, () => {});
          }
        `,
      }, { reporter: 'dot' });
      expect(result.exitCode).toBe(0);
      expect(result.rawOutput).toContain(
          colors.green('·').repeat(80) + '\n' +
          colors.green('·').repeat(80) + '\n' +
          colors.green('·').repeat(80) + '\n' +
          colors.green('·').repeat(3));
    });
  });
}
