import { test, expect } from './playwright-test-fixtures';

const files = {
  'match-grep/b.test.ts': `
    import { test, expect } from '@playwright/test';
    test('test AA', () => {
      expect(1 + 1).toBe(2);
    });

    test('test BB', () => {
      expect(1 + 1).toBe(2);
    });

    test('test CC', () => {
      expect(1 + 1).toBe(2);
    });
  `,
  'match-grep/fdir/c.test.ts': `
    import { test, expect } from '@playwright/test';
    test('test AA', () => {
      expect(1 + 1).toBe(2);
    });

    test('test BB', () => {
      expect(1 + 1).toBe(2);
    });

    test('test CC', () => {
      expect(1 + 1).toBe(2);
    });
  `,
  'match-grep/adir/a.test.ts': `
    import { test, expect } from '@playwright/test';
    test('test AA', () => {
      expect(1 + 1).toBe(2);
    });

    test('test BB', () => {
      expect(1 + 1).toBe(2);
    });

    test('test CC', () => {
      expect(1 + 1).toBe(2);
    });
  `,
};

test('should grep test name', async ({ runInlineTest }) => {
  const result = await runInlineTest(files, { 'grep': 'test [A-B]' });
  expect(result.passed).toBe(6);
  expect(result.skipped).toBe(0);
  expect(result.exitCode).toBe(0);
});

test('should grep test name with regular expression', async ({ runInlineTest }) => {
  const result = await runInlineTest(files, { 'grep': '/B$/' });
  expect(result.passed).toBe(3);
  expect(result.skipped).toBe(0);
  expect(result.exitCode).toBe(0);
});

test('should grep test name with regular expression and a space', async ({ runInlineTest }) => {
  const result = await runInlineTest(files, { 'grep': '/TesT c/i' });
  expect(result.passed).toBe(3);
  expect(result.exitCode).toBe(0);
});

test('should grep invert test name', async ({ runInlineTest }) => {
  const result = await runInlineTest(files, { 'grep-invert': 'BB' });
  expect(result.passed).toBe(6);
  expect(result.skipped).toBe(0);
  expect(result.exitCode).toBe(0);
});

test('should be case insensitive by default', async ({ runInlineTest }) => {
  const result = await runInlineTest(files, { 'grep': 'TesT Cc' });
  expect(result.passed).toBe(3);
  expect(result.skipped).toBe(0);
  expect(result.exitCode).toBe(0);
});

test('should be case sensitive by default with a regex', async ({ runInlineTest }) => {
  const result = await runInlineTest(files, { 'grep': '/TesT Cc/' });
  expect(result.passed).toBe(0);
});
