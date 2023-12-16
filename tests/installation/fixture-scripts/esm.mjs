export default async function testESM({ chromium, firefox, webkit, selectors, devices, errors, request, playwright }, browsers) {
  if (playwright.chromium !== chromium)
    process.exit(1);
  if (playwright.firefox !== firefox)
    process.exit(1);
  if (playwright.webkit !== webkit)
    process.exit(1);
  if (playwright.errors !== errors)
    process.exit(1);
  if (playwright.request !== request)
    process.exit(1);

  try {
    for (const browserType of browsers) {
      const browser = await browserType.launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.evaluate(() => navigator.userAgent);
      await browser.close();
    }
    console.log(`esm SUCCESS`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
