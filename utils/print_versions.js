#!/usr/bin/env node
const pw = require('playwright-core');

async function browserVersion(browserType) {
  const browser = await browserType.launch();
  const result = browser.version();
  await browser.close();
  return result;
}

(async () => {
  console.log('- Chromium ' + await browserVersion(pw.chromium));
  console.log('- Mozilla Firefox ' + await browserVersion(pw.firefox));
  console.log('- WebKit ' + await browserVersion(pw.webkit));
})();
