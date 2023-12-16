
import { test } from './npmTest';

test('electron should work', async ({ exec, tsc, writeFiles }) => {
  await exec('npm i playwright electron@19.0.11');
  await exec('node sanity-electron.js');
  await writeFiles({
    'test.ts':
      `import { Page, _electron, ElectronApplication, Electron } from 'playwright';`
  });
  await tsc('test.ts');
});
