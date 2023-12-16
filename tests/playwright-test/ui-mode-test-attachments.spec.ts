import { test, expect, retries } from './ui-mode-fixtures';

test.describe.configure({ mode: 'parallel', retries });

test('should contain text attachment', async ({ runUITest }) => {
  const { page } = await runUITest({
    'a.test.ts': `
      import { test } from '@playwright/test';
      test('attach test', async () => {
        await test.info().attach('note', { path: __filename });
      });
    `,
  });
  await page.getByText('attach test').click();
  await page.getByTitle('Run all').click();
  await expect(page.getByTestId('status-line')).toHaveText('1/1 passed (100%)');
  await page.getByText('Attachments').click();
  await page.getByText('attach "note"', { exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'note' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('note');
  expect((await readAllFromStream(await download.createReadStream())).toString()).toContain('attach test');
});

test('should contain binary attachment', async ({ runUITest }) => {
  const { page } = await runUITest({
    'a.test.ts': `
      import { test } from '@playwright/test';
      test('attach test', async () => {
        await test.info().attach('data', { body: Buffer.from([1, 2, 3]), contentType: 'application/octet-stream' });
      });
    `,
  });
  await page.getByText('attach test').click();
  await page.getByTitle('Run all').click();
  await expect(page.getByTestId('status-line')).toHaveText('1/1 passed (100%)');
  await page.getByText('Attachments').click();
  await page.getByText('attach "data"', { exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'data' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('data');
  expect(await readAllFromStream(await download.createReadStream())).toEqual(Buffer.from([1, 2, 3]));
});

test('should contain string attachment', async ({ runUITest }) => {
  const { page } = await runUITest({
    'a.test.ts': `
      import { test } from '@playwright/test';
      test('attach test', async () => {
        await test.info().attach('note', { body: 'text42' });
      });
    `,
  });
  await page.getByText('attach test').click();
  await page.getByTitle('Run all').click();
  await expect(page.getByTestId('status-line')).toHaveText('1/1 passed (100%)');
  await page.getByText('Attachments').click();
  await page.getByText('attach "note"', { exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'note' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('note');
  expect((await readAllFromStream(await download.createReadStream())).toString()).toEqual('text42');
});

function readAllFromStream(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise(resolve => {
    const chunks: Buffer[] = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
