import { test, expect } from './playwright-test-fixtures';

test('should respect .gitignore', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    '.gitignore': `a.spec.js`,
    'a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `,
    'b.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `
  });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(1);
});

test('should respect nested .gitignore', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'a/.gitignore': `a.spec.js`,
    'a/a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `,
    'a/b.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `
  });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(1);
});

test('should respect enclosing .gitignore', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    '.gitignore': `a/a.spec.js`,
    'a/a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `,
    'a/b.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `
  });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(1);
});

test('should respect negations and comments in .gitignore', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    '.gitignore': `
      # A comment
      dir1/
      /dir2
      #a.spec.js
      !dir1/foo/a.spec.js
    `,
    'a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => console.log('\\n%%a.spec.js'));
    `,
    'dir1/a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => console.log('\\n%%dir1/a.spec.js'));
    `,
    'dir1/foo/a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => console.log('\\n%%dir1/foo/a.spec.js'));
    `,
    'dir2/a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => console.log('\\n%%dir2/a.spec.js'));
    `,
    'dir3/.gitignore': `
      b.*.js
    `,
    'dir3/a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => console.log('\\n%%dir3/a.spec.js'));
    `,
    'dir3/b.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => console.log('\\n%%dir3/b.spec.js'));
    `,
  }, { workers: 1 });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(3);
  expect(result.outputLines).toEqual([
    'a.spec.js',
    'dir1/foo/a.spec.js',
    'dir3/a.spec.js',
  ]);
});

test('should ignore .gitignore inside globally configured testDir', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'tests/.gitignore': `
      *.js
    `,
    'playwright.config.js': `
      module.exports = {
        testDir: './tests',
      };
    `,
    'tests/a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `,
    'tests/foo/b.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `
  });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(2);
});


test('should ignore .gitignore inside project testDir', async ({ runInlineTest }) => {
  const result = await runInlineTest({
    'tests/.gitignore': `
      *.js
    `,
    'playwright.config.js': `
      module.exports = { projects: [
        { testDir: './tests' },
      ] };
    `,
    'tests/a.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `,
    'tests/foo/b.spec.js': `
      import { test, expect } from '@playwright/test';
      test('pass', ({}) => {});
    `
  });
  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(2);
});

