import { test, expect } from './playwright-test-fixtures';

test('should list files', async ({ runListFiles }) => {
  const result = await runListFiles({
    'playwright.config.ts': `
      module.exports = { projects: [{ name: 'foo' }, { name: 'bar' }] };
    `,
    'a.test.js': ``
  });
  expect(result.exitCode).toBe(0);

  const data = JSON.parse(result.output);
  expect(data).toEqual({
    projects: [
      {
        name: 'foo',
        testDir: expect.stringContaining('list-files-should-list-files-playwright-test'),
        use: {},
        files: [
          expect.stringContaining('a.test.js')
        ]
      },
      {
        name: 'bar',
        testDir: expect.stringContaining('list-files-should-list-files-playwright-test'),
        use: {},
        files: [
          expect.stringContaining('a.test.js')
        ]
      }
    ]
  });
});

test('should include testIdAttribute', async ({ runListFiles }) => {
  const result = await runListFiles({
    'playwright.config.ts': `
      module.exports = {
        use: { testIdAttribute: 'myid' }
      };
    `,
    'a.test.js': ``
  });
  expect(result.exitCode).toBe(0);

  const data = JSON.parse(result.output);
  expect(data).toEqual({
    projects: [
      {
        name: '',
        testDir: expect.stringContaining('list-files-should-include-testIdAttribute-playwright-test'),
        use: {
          testIdAttribute: 'myid'
        },
        files: [
          expect.stringContaining('a.test.js')
        ]
      },
    ]
  });
});

test('should report error', async ({ runListFiles }) => {
  const result = await runListFiles({
    'playwright.config.ts': `
      const a = 1;
      a = 2;
    `,
    'a.test.js': ``
  });
  expect(result.exitCode).toBe(0);

  const data = JSON.parse(result.output);
  expect(data).toEqual({
    error: {
      location: {
        file: expect.stringContaining('playwright.config.ts'),
        line: 3,
        column: 8,
      },
      message: 'Assignment to constant variable.',
      stack: expect.stringContaining('TypeError: Assignment to constant variable.'),
    }
  });
});
