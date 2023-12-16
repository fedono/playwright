import { test, expect } from './playwright-test-fixtures';
import path from 'path';

function relativeFilePath(file: string): string {
  if (!path.isAbsolute(file))
    return file;
  return path.relative(process.cwd(), file);
}

for (const useIntermediateMergeReport of [false, true] as const) {
  test.describe(`${useIntermediateMergeReport ? 'merged' : 'created'}`, () => {
    test.use({ useIntermediateMergeReport });

    test('print GitHub annotations for success', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'a.test.js': `
          import { test, expect } from '@playwright/test';
          test('example1', async ({}) => {
            expect(1 + 1).toBe(2);
          });
        `
      }, { reporter: 'github' });
      const text = result.output;
      expect(text).not.toContain('::error');
      expect(text).toContain('::notice title=🎭 Playwright Run Summary::  1 passed');
      expect(result.exitCode).toBe(0);
    });

    test('print GitHub annotations for failed tests', async ({ runInlineTest }, testInfo) => {
      const result = await runInlineTest({
        'a.test.js': `
          const { test, expect } = require('@playwright/test');
          test('example', async ({}) => {
            expect(1 + 1).toBe(3);
          });
        `
      }, { retries: 3, reporter: 'github' }, { GITHUB_WORKSPACE: process.cwd() });
      const text = result.output;
      const testPath = relativeFilePath(testInfo.outputPath('a.test.js'));
      expect(text).toContain(`::error file=${testPath},title=a.test.js:3:11 › example,line=4,col=27::  1) a.test.js:3:11 › example ──────────────────────────────────────────────────────────────────────%0A%0A    Retry #1`);
      expect(text).toContain(`::error file=${testPath},title=a.test.js:3:11 › example,line=4,col=27::  1) a.test.js:3:11 › example ──────────────────────────────────────────────────────────────────────%0A%0A    Retry #2`);
      expect(text).toContain(`::error file=${testPath},title=a.test.js:3:11 › example,line=4,col=27::  1) a.test.js:3:11 › example ──────────────────────────────────────────────────────────────────────%0A%0A    Retry #3`);
      expect(result.exitCode).toBe(1);
    });

    test('print GitHub annotations for slow tests', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'playwright.config.ts': `
          module.exports = {
            reportSlowTests: { max: 0, threshold: 100 }
          };
        `,
        'a.test.js': `
          import { test, expect } from '@playwright/test';
          test('slow test', async ({}) => {
            await new Promise(f => setTimeout(f, 200));
          });
        `
      }, { retries: 3, reporter: 'github' }, { GITHUB_WORKSPACE: '' });
      const text = result.output;
      expect(text).toContain('::warning title=Slow Test,file=a.test.js::a.test.js took');
      expect(text).toContain('::notice title=🎭 Playwright Run Summary::  1 passed');
      expect(result.exitCode).toBe(0);
    });

    test('print GitHub annotations for global error', async ({ runInlineTest }) => {
      const result = await runInlineTest({
        'a.test.ts': `
          import { test as base, expect } from '@playwright/test';
          const test = base.extend({
            w: [async ({}, use) => {
              await use();
              throw new Error('Oh my!');
            }, { scope: 'worker' }],
          });
          test('passes but...', ({w}) => {
          });
        `,
      }, { reporter: 'github' });
      const text = result.output;
      expect(text).toContain('::error ::Error: Oh my!%0A%0A');
      expect(result.exitCode).toBe(1);
    });
  });
}
