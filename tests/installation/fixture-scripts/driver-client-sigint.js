
// @ts-check

const pw = require.resolve('playwright');
const oop = require.resolve('playwright-core/lib/outofprocess', { paths: [pw] });
const { start } = require(oop);

(async () => {
  console.log('launching driver')
  const { playwright, stop } = await start();
  console.log('launched driver')
  try {
    const browser = await playwright.chromium.launch({ handleSIGINT: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    // let things settle down
    await page.waitForTimeout(100);
    // send SIGINT to driver
    process.kill(playwright.driverProcess.pid, 'SIGINT');
    // wait and see if driver exits
    await page.waitForTimeout(100);
    console.log(`closing gracefully`)
    await page.close();
    console.log('closed page');
    await context.close();
    console.log('closed context');
    await browser.close();
    console.log('closed browser');
    await stop();
    console.log('stopped driver');
  } catch (e) {
    console.error(`Should be able to launch from ${process.cwd()}`);
    console.error(e);
    process.exit(1);
  }
  console.log(`SUCCESS`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
