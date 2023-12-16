import { test, expect } from './playwright-test-fixtures';

const reporter = `
class Reporter {
  async onEnd() {
    return { status: 'passed' };
  }
}
module.exports = Reporter;
`;

test('should override exit code', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'reporter.ts': reporter,
    'playwright.config.ts': `module.exports = { reporter: './reporter' };`,
    'a.test.js': `
      import { test, expect } from '@playwright/test';
      test('fail', async ({}) => {
        expect(1 + 1).toBe(3);
      });
    `
  });
  expect(result.exitCode).toBe(0);
});
