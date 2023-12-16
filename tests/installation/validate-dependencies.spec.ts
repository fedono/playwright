
import { test, expect } from './npmTest';

test('validate dependencies', async ({ exec }) => {
  await exec('npm i playwright');
  await exec('npx playwright install chromium');

  await test.step('default (on)', async () => {
    const result1 = await exec('node validate-dependencies.js');
    expect(result1).toContain(`PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS`);
  });

  await test.step('disabled (off)', async () => {
    const result2 = await exec('node validate-dependencies-skip-executable-path.js');
    expect(result2).not.toContain(`PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS`);
  });
});
