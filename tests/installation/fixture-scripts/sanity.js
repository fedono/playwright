const requireName = process.argv[2];
const success = process.argv.slice(3);
const playwright = require(requireName);

const packageJSON = require(requireName + '/package.json');
if (!packageJSON || !packageJSON.version) {
  console.error('Should be able to require the package.json and get the version.')
  process.exit(1);
}

(async () => {
  for (const browserType of success) {
    try {
      const browser = await playwright[browserType].launch();
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.evaluate(() => navigator.userAgent);
      await browser.close();
    } catch (e) {
      console.error(`Should be able to launch ${browserType} from ${requireName}`);
      console.error(e);
      process.exit(1);
    }
  }
  const fail = ['chromium', 'webkit', 'firefox'].filter(x => !success.includes(x));
  for (const browserType of fail) {
    try {
      await playwright[browserType].launch();
      console.error(`Should not be able to launch ${browserType} from ${requireName}`);
      process.exit(1);
    } catch (e) {
      // All good.
      console.log(`Expected error while launching ${browserType}: ${e}`);
    }
  }
  console.log(`require SUCCESS`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
