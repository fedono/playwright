
import { test } from './npmTest';

test('screencast works', async ({ exec }) => {
  await exec('npm i playwright');
  await exec('node screencast.js playwright chromium firefox webkit');
});
