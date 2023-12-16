
import { test, expect } from './npmTest';
import path from 'path';

test('npm: @playwright/test should work', async ({ exec, tmpWorkspace }) => {
  await exec('npm i @playwright/test');
  await exec('npx playwright install');
  await exec('npx playwright test -c . --browser=all --reporter=list,json sample.spec.js', { env: {  PLAYWRIGHT_JSON_OUTPUT_NAME: 'report.json' } });
  await exec('node read-json-report.js', path.join(tmpWorkspace, 'report.json'));
  await exec('node sanity.js @playwright/test chromium firefox webkit');
  await exec('node', 'esm-playwright-test.mjs');
});

test('npm: playwright + @playwright/test should work', async ({ exec, tmpWorkspace }) => {
  await exec('npm i playwright');
  await exec('npm i @playwright/test');
  await exec('npx playwright install');
  await exec('npx playwright test -c . --browser=all --reporter=list,json sample.spec.js', { env: {  PLAYWRIGHT_JSON_OUTPUT_NAME: 'report.json' } });
  await exec('node read-json-report.js', path.join(tmpWorkspace, 'report.json'));
  await exec('node sanity.js @playwright/test chromium firefox webkit');
  await exec('node', 'esm-playwright-test.mjs');
});

test('npm: @playwright/test + playwright-core should work', async ({ exec, tmpWorkspace }) => {
  await exec('npm i @playwright/test');
  await exec('npm i playwright-core');
  await exec('npx playwright install');
  await exec('npx playwright test -c . --browser=all --reporter=list,json sample.spec.js', { env: {  PLAYWRIGHT_JSON_OUTPUT_NAME: 'report.json' } });
  await exec('node read-json-report.js', path.join(tmpWorkspace, 'report.json'));
  await exec('node sanity.js @playwright/test chromium firefox webkit');
  await exec('node', 'esm-playwright-test.mjs');
});

test('npm: @playwright/test should install playwright-core bin', async ({ exec, tmpWorkspace }) => {
  await exec('npm i @playwright/test');
  const result = await exec('npx playwright-core --version');
  expect(result).toContain('Version 1.');
});

test('npm: uninstalling ct removes playwright bin', async ({ exec, tmpWorkspace }) => {
  await exec('npm i @playwright/test');
  await exec('npm i @playwright/experimental-ct-react');
  await exec('npm uninstall @playwright/experimental-ct-react');
  await exec('npx playwright test', { expectToExitWithError: true, message: 'command not found' });
});

test('yarn: @playwright/test should work', async ({ exec, tmpWorkspace }) => {
  await exec('yarn add @playwright/test');
  await exec('yarn playwright install');
  await exec('yarn playwright test -c . --browser=all --reporter=list,json sample.spec.js', { env: {  PLAYWRIGHT_JSON_OUTPUT_NAME: 'report.json' } });
  await exec('node read-json-report.js', path.join(tmpWorkspace, 'report.json'));
  await exec('node sanity.js @playwright/test chromium firefox webkit');
  await exec('node', 'esm-playwright-test.mjs');
});

test('pnpm: @playwright/test should work', async ({ exec, tmpWorkspace }) => {
  await exec('pnpm add @playwright/test');
  await exec('pnpm exec playwright install');
  await exec('pnpm exec playwright test -c . --browser=all --reporter=list,json sample.spec.js', { env: {  PLAYWRIGHT_JSON_OUTPUT_NAME: 'report.json' } });
  await exec('node read-json-report.js', path.join(tmpWorkspace, 'report.json'));
  await exec('node sanity.js @playwright/test chromium firefox webkit');
  await exec('node', 'esm-playwright-test.mjs');
});
