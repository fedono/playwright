const pw = require.resolve('playwright');
const oop = require.resolve('playwright-core/lib/outofprocess', { paths: [pw] });
const { start } = require(oop);

(async () => {
  const { playwright, stop } = await start();
  console.log(`driver PID=${playwright.driverProcess.pid}`);
  for (const browserType of ['chromium', 'firefox', 'webkit']) {
    try {
      const browser = await playwright[browserType].launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.evaluate(() => navigator.userAgent);
      await browser.close();
      console.log(`${browserType} SUCCESS`);
    } catch (e) {
      console.error(`Should be able to launch ${browserType} from ${process.cwd()}`);
      console.error(e);
      process.exit(1);
    }
  }
  await stop();
  console.log(`driver SUCCESS`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
