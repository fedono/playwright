
import { test, expect } from './npmTest';

test('driver should work', async ({ exec }) => {
  await exec('npm i playwright');
  await exec('npx playwright install');
  await exec('node driver-client.js');
});

test('driver should ignore SIGINT', async ({ exec }) => {
  test.skip(process.platform === 'win32', 'Only relevant for POSIX');
  test.info().annotations.push({ type: 'issue', description: 'https://github.com/microsoft/playwright-python/issues/1843' });
  await exec('npm i playwright');
  await exec('npx playwright install chromium');
  const output = await exec('node driver-client-sigint.js');
  const lines = output.split('\n').filter(l => l.trim());
  expect(lines).toEqual([
    'launching driver',
    'launched driver',
    'closing gracefully',
    'closed page',
    'closed context',
    'closed browser',
    'stopped driver',
    'SUCCESS',
  ]);
});
