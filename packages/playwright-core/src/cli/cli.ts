#!/usr/bin/env node

/* eslint-disable no-console */

import { getPackageManager, gracefullyProcessExitDoNotHang } from '../utils';
import program from './program';

function printPlaywrightTestError(command: string) {
  const packages: string[] = [];
  for (const pkg of ['playwright', 'playwright-chromium', 'playwright-firefox', 'playwright-webkit']) {
    try {
      require.resolve(pkg);
      packages.push(pkg);
    } catch (e) {
    }
  }
  if (!packages.length)
    packages.push('playwright');
  const packageManager = getPackageManager();
  if (packageManager === 'yarn') {
    console.error(`Please install @playwright/test package before running "yarn playwright ${command}"`);
    console.error(`  yarn remove ${packages.join(' ')}`);
    console.error('  yarn add -D @playwright/test');
  } else if (packageManager === 'pnpm') {
    console.error(`Please install @playwright/test package before running "pnpm exec playwright ${command}"`);
    console.error(`  pnpm remove ${packages.join(' ')}`);
    console.error('  pnpm add -D @playwright/test');
  } else {
    console.error(`Please install @playwright/test package before running "npx playwright ${command}"`);
    console.error(`  npm uninstall ${packages.join(' ')}`);
    console.error('  npm install -D @playwright/test');
  }
}

const kExternalPlaywrightTestCommands = [
  ['test', 'Run tests with Playwright Test.'],
  ['show-report', 'Show Playwright Test HTML report.'],
  ['merge-reports', 'Merge Playwright Test Blob reports'],
];
for (const [command, description] of kExternalPlaywrightTestCommands) {
  const playwrightTest = program.command(command).allowUnknownOption(true);
  playwrightTest.description(`${description} Available in @playwright/test package.`);
  playwrightTest.action(async () => {
    printPlaywrightTestError(command);
    gracefullyProcessExitDoNotHang(1);
  });
}

program.parse(process.argv);
