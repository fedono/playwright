
import { test } from './npmTest';

test('typescript types should work', async ({ exec, tsc, writeFiles }) => {
  const libraryPackages = [
    'playwright',
    'playwright-core',
    'playwright-firefox',
    'playwright-webkit',
    'playwright-chromium',
  ];
  await exec('npm i @playwright/test', ...libraryPackages, { env: { PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1' } });

  for (const libraryPackage of libraryPackages) {
    const filename = libraryPackage + '.ts';
    await writeFiles({
      [filename]: `import { Page } from '${libraryPackage}';`,
    });
    await tsc(filename);
    await tsc(`--module nodenext ${filename}`);
  }

  await tsc('playwright-test-types.ts');
  await tsc('--module nodenext playwright-test-types.ts');

  await writeFiles({
    'test.ts':
      `import { AndroidDevice, _android, AndroidWebView, Page } from 'playwright';`,
  });
  await tsc('test.ts');
});
