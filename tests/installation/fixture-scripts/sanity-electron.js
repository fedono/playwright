const playwright = require('playwright');
const path = require('path');

(async () => {
  const application = await playwright._electron.launch({
    args: [path.join(__dirname, 'electron-app.js')],
  });
  const appPath = await application.evaluate(async ({ app }) => app.getAppPath());
  await application.close();
  if (appPath !== __dirname)
    throw new Error(`Malformed app path: got "${appPath}", expected "${__dirname}"`);
  console.log(`playwright._electron SUCCESS`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
