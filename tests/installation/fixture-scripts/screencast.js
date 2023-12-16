const requireName = process.argv[2];
const success = process.argv.slice(3);

const playwright = require(requireName);
const fs = require('fs');

(async () => {
  for (const browserType of success) {
    try {
      const browser = await playwright[browserType].launch({});
      const context = await browser.newContext({
        recordVideo: { dir: __dirname, size: {width: 320, height: 240} },
      });
      await context.newPage();
      // Wait fo 1 second to actually record something.
      await new Promise(x => setTimeout(x, 1000));
      await context.close();
      await browser.close();
      const videoFile = fs.readdirSync(__dirname).find(name => name.endsWith('webm'));
      if (!videoFile) {
        console.error(`ERROR: Package "${requireName}", browser "${browserType}" should have created screencast!`);
        process.exit(1);
      }
    } catch (err) {
      console.error(`ERROR: Should be able to launch ${browserType} from ${requireName}`);
      console.error(err);
      process.exit(1);
    }
  }
})();
