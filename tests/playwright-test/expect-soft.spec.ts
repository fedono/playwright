import { test, expect } from './playwright-test-fixtures';

test('soft expects should compile', async ({ runTSC }) => {
  const result = await runTSC({
    'a.spec.ts': `
      import { test, expect } from '@playwright/test';
      test('should work', () => {
        test.expect.soft(1+1).toBe(3);
        test.expect.soft(1+1, 'custom error message').toBe(3);
        test.expect.soft(1+1, { message: 'custom error message' }).toBe(3);
      });
    `
  });
  expect(result.exitCode).toBe(0);
});

test('soft expects should work', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'a.spec.ts': `
      import { test, expect } from '@playwright/test';
      test('should work', () => {
        test.expect.soft(1+1).toBe(3);
        console.log('%% woof-woof');
      });
    `
  });
  expect(result.exitCode).toBe(1);
  expect(result.outputLines).toEqual(['woof-woof']);
});

test('should report a mixture of soft and non-soft errors', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'a.spec.ts': `
      import { test, expect } from '@playwright/test';
      test('should work', ({}) => {
        test.expect.soft(1+1, 'one plus one').toBe(3);
        test.expect.soft(2*2, 'two times two').toBe(5);
        test.expect(3/3, 'three div three').toBe(7);
        test.expect.soft(6-4, { message: 'six minus four' }).toBe(3);
      });
    `
  });
  expect(result.exitCode).toBe(1);
  expect(result.output).toContain('Error: one plus one');
  expect(result.output).toContain('Error: two times two');
  expect(result.output).toContain('Error: three div three');
  expect(result.output).not.toContain('Error: six minus four');
});

test('testInfo should contain all soft expect errors', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'a.spec.ts': `
      import { test, expect } from '@playwright/test';
      test('should work', ({}, testInfo) => {
        test.expect.soft(1+1, 'one plus one').toBe(3);
        test.expect.soft(2*2, 'two times two').toBe(5);
        test.expect(testInfo.errors.length, 'must be exactly two errors').toBe(2);
      });
    `
  });
  expect(result.exitCode).toBe(1);
  expect(result.output).toContain('Error: one plus one');
  expect(result.output).toContain('Error: two times two');
  expect(result.output).not.toContain('Error: must be exactly two errors');
});
