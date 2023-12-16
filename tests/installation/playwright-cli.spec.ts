
import { test, expect } from './npmTest';
import path from 'path';
import fs from 'fs';

test('cli should work', async ({ exec, tmpWorkspace }) => {
  await exec('npm i playwright');
  await exec('npx playwright install chromium');

  await test.step('codegen without arguments', async () => {
    const result = await exec('npx playwright codegen', {
      env: {
        PWTEST_CLI_IS_UNDER_TEST: '1',
        PWTEST_CLI_AUTO_EXIT_WHEN: '@playwright/test',
      }
    });
    expect(result).toContain(`{ page }`);
  });

  await test.step('codegen --target=javascript', async () => {
    const result = await exec('npx playwright codegen --target=javascript', {
      env: {
        PWTEST_CLI_IS_UNDER_TEST: '1',
        PWTEST_CLI_AUTO_EXIT_WHEN: 'context.close',
      }
    });
    expect(result).toContain(`playwright`);
  });

  await test.step('codegen --target=python', async () => {
    const result = await exec('npx playwright codegen --target=python', {
      env: {
        PWTEST_CLI_IS_UNDER_TEST: '1',
        PWTEST_CLI_AUTO_EXIT_WHEN: 'chromium.launch',
      },
    });
    expect(result).toContain(`browser.close`);
  });

  await test.step('screenshot', async () => {
    await exec(path.join('node_modules', '.bin', 'playwright'), 'screenshot about:blank one.png');
    await fs.promises.stat(path.join(tmpWorkspace, 'one.png'));

    await exec('npx playwright screenshot about:blank two.png');
    await fs.promises.stat(path.join(tmpWorkspace, 'two.png'));
  });
});
