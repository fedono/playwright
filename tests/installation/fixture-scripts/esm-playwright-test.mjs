import { chromium, firefox, webkit, selectors, devices, errors, request, test, expect } from '@playwright/test';
import * as playwright from '@playwright/test';
import defaultExport from '@playwright/test';
import testESM from './esm.mjs';

if (defaultExport !== test) {
  console.error('default export is not test.');
  process.exit(1);
}

if (typeof test !== 'function') {
  console.error('test is not a function');
  process.exit(1);
}

if (typeof expect !== 'function') {
  console.error('expect is not a function');
  process.exit(1);
}
expect(1).toBe(1);

testESM({ chromium, firefox, webkit, selectors, devices, errors, request, playwright }, [chromium, firefox, webkit]);
