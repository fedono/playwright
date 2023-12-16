import { test, expect, retries, dumpTestTree } from './ui-mode-fixtures';

test.describe.configure({ mode: 'parallel', retries });

const basicTestTree = {
  'a.test.ts': `
    import { test, expect } from '@playwright/test';
    test('passes', () => {});
    test('fails', () => {});
    test.describe('suite', () => {
      test('inner passes', () => {});
      test('inner fails', () => {});
    });
  `,
  'b.test.ts': `
    import { test, expect } from '@playwright/test';
    test('passes', () => {});
    test('fails', () => {});
  `,
};

test('should list tests', async ({ runUITest }) => {
  const { page } = await runUITest(basicTestTree);
  await expect.poll(dumpTestTree(page)).toBe(`
    ▼ ◯ a.test.ts
        ◯ passes
        ◯ fails
      ► ◯ suite
    ▼ ◯ b.test.ts
        ◯ passes
        ◯ fails
  `);
});

test('should traverse up/down', async ({ runUITest }) => {
  const { page } = await runUITest(basicTestTree);
  await page.getByText('a.test.ts').click();
  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ a.test.ts <=
        ◯ passes
        ◯ fails
      ► ◯ suite
  `);

  await page.keyboard.press('ArrowDown');
  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ a.test.ts
        ◯ passes <=
        ◯ fails
      ► ◯ suite
  `);
  await page.keyboard.press('ArrowDown');
  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ a.test.ts
        ◯ passes
        ◯ fails <=
      ► ◯ suite
  `);

  await page.keyboard.press('ArrowUp');
  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ a.test.ts
        ◯ passes <=
        ◯ fails
      ► ◯ suite
  `);
});

test('should expand / collapse groups', async ({ runUITest }) => {
  const { page } = await runUITest(basicTestTree);

  await page.getByTestId('test-tree').getByText('suite').click();
  await page.keyboard.press('ArrowRight');
  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ a.test.ts
        ◯ passes
        ◯ fails
      ▼ ◯ suite <=
          ◯ inner passes
          ◯ inner fails
  `);

  await page.keyboard.press('ArrowLeft');
  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ a.test.ts
        ◯ passes
        ◯ fails
      ► ◯ suite <=
  `);

  await page.getByTestId('test-tree').getByText('passes').first().click();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ a.test.ts <=
        ◯ passes
        ◯ fails
  `);

  await page.keyboard.press('ArrowLeft');
  await expect.poll(dumpTestTree(page)).toContain(`
    ► ◯ a.test.ts <=
  `);
});

test('should merge folder trees', async ({ runUITest }) => {
  const { page } = await runUITest({
    'a/b/c/inC.test.ts': `
      import { test, expect } from '@playwright/test';
      test('passes', () => {});
    `,
    'a/b/in-b.test.ts': `
      import { test, expect } from '@playwright/test';
      test('passes', () => {});
    `,
    'a/in-a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('passes', () => {});
    `,
  });

  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ b
      ► ◯ c
      ► ◯ in-b.test.ts
    ▼ ◯ in-a.test.ts
        ◯ passes
  `);
});

test('should list parametrized tests', async ({ runUITest }) => {
  const { page } = await runUITest({
    'a.test.ts': `
      import { test } from '@playwright/test';
      test.describe('cookies', () => {
        for (const country of ['FR', 'DE', 'LT']) {
          test.describe(() => {
            test('test ' + country, async ({}) => {});
          });
        }
      })
    `
  });

  await page.getByText('cookies').click();
  await page.keyboard.press('ArrowRight');
  await page.getByText('<anonymous>').click();
  await page.keyboard.press('ArrowRight');

  await expect.poll(dumpTestTree(page)).toBe(`
    ▼ ◯ a.test.ts
      ▼ ◯ cookies
        ▼ ◯ <anonymous> <=
            ◯ test FR
            ◯ test DE
            ◯ test LT
  `);
});

test('should update parametrized tests', async ({ runUITest, writeFiles }) => {
  const { page } = await runUITest({
    'a.test.ts': `
      import { test } from '@playwright/test';
      test.describe('cookies', () => {
        for (const country of ['FR', 'DE', 'LT']) {
          test.describe(() => {
            test('test ' + country, async ({}) => {});
          });
        }
      })
    `
  });

  await page.getByText('cookies').click();
  await page.keyboard.press('ArrowRight');
  await page.getByText('<anonymous>').click();
  await page.keyboard.press('ArrowRight');

  await expect.poll(dumpTestTree(page)).toBe(`
    ▼ ◯ a.test.ts
      ▼ ◯ cookies
        ▼ ◯ <anonymous> <=
            ◯ test FR
            ◯ test DE
            ◯ test LT
  `);

  await writeFiles({
    'a.test.ts': `
      import { test } from '@playwright/test';
      test.describe('cookies', () => {
        for (const country of ['FR', 'LT']) {
          test.describe(() => {
            test('test ' + country, async ({}) => {});
          });
        }
      })
    `
  });


  await expect.poll(dumpTestTree(page)).toBe(`
    ▼ ◯ a.test.ts
      ▼ ◯ cookies
        ▼ ◯ <anonymous> <=
            ◯ test FR
            ◯ test LT
  `);
});

test('should collapse all', async ({ runUITest }) => {
  const { page } = await runUITest(basicTestTree);

  await page.getByTestId('test-tree').getByText('suite').click();
  await page.keyboard.press('ArrowRight');
  await expect.poll(dumpTestTree(page)).toContain(`
    ▼ ◯ a.test.ts
        ◯ passes
        ◯ fails
      ▼ ◯ suite <=
          ◯ inner passes
          ◯ inner fails
  `);

  await page.getByTitle('Collapse all').click();
  await expect.poll(dumpTestTree(page)).toContain(`
    ► ◯ a.test.ts
  `);
});
