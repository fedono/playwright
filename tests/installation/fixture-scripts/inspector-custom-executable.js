
const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({
    executablePath: '/opt/google/chrome/chrome'
  });
  const context = await browser.newContext();
  await context.newPage();
  await browser.close();
  console.log('SUCCESS');
})();
