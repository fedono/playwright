
import os from 'os';
import path from 'path';
import { test } from './npmTest';

test('connect to selenium', async ({ exec, tmpWorkspace }, testInfo) => {
  test.skip(os.platform() !== 'linux');

  await exec('npm i playwright-core');
  await exec(`node download-chromedriver.js ${tmpWorkspace}`);
  const seleniumPath = path.join(tmpWorkspace, 'selenium');
  await exec(`node download-selenium.js ${seleniumPath}`);
  await exec(`npm run test -- --reporter=list selenium.spec --output=${testInfo.outputPath('tmp-test-results')}`, {
    cwd: path.join(__dirname, '..', '..'),
    env: {
      PWTEST_CHROMEDRIVER: path.join(tmpWorkspace, 'chromedriver'),
      PWTEST_SELENIUM: seleniumPath,
    },
  });
});
