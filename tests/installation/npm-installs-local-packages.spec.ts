
import path from 'path';
import { test, expect } from './npmTest';
import fs from 'fs';

test('installs local packages', async ({ registry, exec, tmpWorkspace }) => {
  const packages = ['playwright', 'playwright-core', 'playwright-chromium', 'playwright-firefox', 'playwright-webkit', '@playwright/test', '@playwright/browser-chromium', '@playwright/browser-firefox', '@playwright/browser-webkit'];
  await exec('npm i --foreground-scripts', ...packages, { env: { PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' } });

  const output = await exec('node', path.join(__dirname, '..', '..', 'utils', 'workspace.js'), '--get-version');
  const expectedPlaywrightVersion = output.trim();
  for (const pkg of packages) {
    await test.step(`check version and installation location of ${pkg}`, async () => {
      registry.assertLocalPackage(pkg);
      const result = await exec('node', '--eval', '"console.log(JSON.stringify(require.resolve(process.argv[1])))"', pkg);
      const pkgJsonPath = fs.realpathSync(path.join(path.dirname(JSON.parse(result)), 'package.json'));
      expect(pkgJsonPath.startsWith(fs.realpathSync(path.join(tmpWorkspace, 'node_modules')))).toBeTruthy();
      const installedVersion = JSON.parse(await fs.promises.readFile(pkgJsonPath, 'utf8')).version;
      expect(installedVersion).toBe(expectedPlaywrightVersion);
    });
  }
});
