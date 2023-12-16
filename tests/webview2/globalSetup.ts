
import path from 'path';
import childProcess from 'child_process';
import playwright from 'playwright';

export default async () => {
  const cdpPort = 9876;
  const spawnedProcess = childProcess.spawn(path.join(__dirname, 'webview2-app/bin/Debug/net6.0-windows/webview2.exe'), {
    shell: true,
    env: {
      ...process.env,
      WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${cdpPort}`,
    }
  });
  await new Promise<void>(resolve => spawnedProcess.stdout.on('data', (data: Buffer): void => {
    if (data.toString().includes('WebView2 initialized'))
      resolve();
  }));
  const browser = await playwright.chromium.connectOverCDP(`http://127.0.0.1:${cdpPort}`);
  const page = browser.contexts()[0].pages()[0];
  await page.goto('data:text/html,');
  const chromeVersion = await page.evaluate(() => navigator.userAgent.match(/Chrome\/(.*?) /)[1]);
  process.env.PWTEST_WEBVIEW2_CHROMIUM_VERSION = chromeVersion;
  await browser.close();
  childProcess.spawnSync(`taskkill /pid ${spawnedProcess.pid} /T /F`, { shell: true });
};
