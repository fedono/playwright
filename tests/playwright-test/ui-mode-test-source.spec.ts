import { test, expect, retries, dumpTestTree } from './ui-mode-fixtures';

test.describe.configure({ mode: 'parallel', retries });

const basicTestTree = {
  'a.test.ts': `
    import { test } from '@playwright/test';
    test('first', () => {});
    test('second', () => {});
  `,
  'b.test.ts': `
    import { test } from '@playwright/test';
    test('third', () => {});
  `,
};

test('should show selected test in sources', async ({ runUITest }) => {
  const { page } = await runUITest(basicTestTree);
  await expect.poll(dumpTestTree(page)).toBe(`
    ▼ ◯ a.test.ts
        ◯ first
        ◯ second
    ▼ ◯ b.test.ts
        ◯ third
  `);

  await page.getByTestId('test-tree').getByText('first').click();
  await expect(
      page.getByTestId('source-code').locator('.source-tab-file-name')
  ).toHaveText('a.test.ts');
  await expect(
      page.locator('.CodeMirror .source-line-running'),
  ).toHaveText(`3    test('first', () => {});`);

  await page.getByTestId('test-tree').getByText('second').click();
  await expect(
      page.getByTestId('source-code').locator('.source-tab-file-name')
  ).toHaveText('a.test.ts');
  await expect(
      page.locator('.CodeMirror .source-line-running'),
  ).toHaveText(`4    test('second', () => {});`);

  await page.getByTestId('test-tree').getByText('third').click();
  await expect(
      page.getByTestId('source-code').locator('.source-tab-file-name')
  ).toHaveText('b.test.ts');
  await expect(
      page.locator('.CodeMirror .source-line-running'),
  ).toHaveText(`3    test('third', () => {});`);
});

test('should show top-level errors in file', async ({ runUITest }) => {
  const { page } = await runUITest({
    'a.test.ts': `
      import { test } from '@playwright/test';
      const a = 1;
      a = 2;
      test('first', () => {});
      test('second', () => {});
    `,
    'b.test.ts': `
      import { test } from '@playwright/test';
      test('third', () => {});
    `,
  });
  await expect.poll(dumpTestTree(page)).toBe(`
      ◯ a.test.ts
    ▼ ◯ b.test.ts
        ◯ third
  `);

  await page.getByTestId('test-tree').getByText('a.test.ts').click();
  await expect(
      page.getByTestId('source-code').locator('.source-tab-file-name')
  ).toHaveText('a.test.ts');
  await expect(
      page.locator('.CodeMirror .source-line-running'),
  ).toHaveText(`4      a = 2;`);

  await expect(
      page.locator('.CodeMirror-linewidget')
  ).toHaveText([
    '            ',
    'Assignment to constant variable.'
  ]);
});

test('should show syntax errors in file', async ({ runUITest }) => {
  const { page } = await runUITest({
    'a.test.ts': `
      import { test } from '@playwright/test'&
      test('first', () => {});
      test('second', () => {});
    `,
  });
  await expect.poll(dumpTestTree(page)).toBe(`
      ◯ a.test.ts
  `);

  await page.getByTestId('test-tree').getByText('a.test.ts').click();
  await expect(
      page.getByTestId('source-code').locator('.source-tab-file-name')
  ).toHaveText('a.test.ts');
  await expect(
      page.locator('.CodeMirror .source-line-running'),
  ).toHaveText(`2      import { test } from '@playwright/test'&`);

  await expect(
      page.locator('.CodeMirror-linewidget')
  ).toHaveText([
    '                                              ',
    /Missing semicolon./
  ]);
});
