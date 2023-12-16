import { test, expect } from './playwright-test-fixtures';

test('should decorate', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'a.spec.ts': `
      import { test, expect } from '@playwright/test';
      test('passes', () => {
        new POM().greet();
      });

      function loggedMethod(originalMethod: any, _context: any) {
        function replacementMethod(this: any, ...args: any[]) {
          console.log('%% Entering method.');
          const result = originalMethod.call(this, ...args);
          console.log('%% Exiting method.');
          return result;
        }
        return replacementMethod;
      }

      class POM {
        @loggedMethod
        greet() {
          console.log('%% Hello, world!');
        }
      }
    `
  });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(1);
  expect(result.outputLines).toEqual([
    'Entering method.',
    'Hello, world!',
    'Exiting method.',
  ]);
});
