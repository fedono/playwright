
import { test } from './npmTest';
import fs from 'fs';
import path from 'path';

test('playwright should work with relative home path', async ({ exec, tmpWorkspace }) => {
  await fs.promises.mkdir(path.join(tmpWorkspace, 'foo'));
  // Make sure that browsers path is resolved relative to the `npm install` call location.
  await exec('npm i playwright', { cwd: path.join(tmpWorkspace, 'foo'), env: { PLAYWRIGHT_BROWSERS_PATH: path.join('..', 'relative') } });
  await exec('npx playwright install', { cwd: path.join(tmpWorkspace, 'foo'), env: { PLAYWRIGHT_BROWSERS_PATH: path.join('..', 'relative') } });
  await exec('node sanity.js playwright chromium firefox webkit', { env: { PLAYWRIGHT_BROWSERS_PATH: path.join('.', 'relative') } });
});
