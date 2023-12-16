import { playwrightTest as it, expect } from '../config/browserTest';

it('should have an errors object', async ({ playwright }) => {
  expect(String(playwright.errors.TimeoutError)).toContain('TimeoutError');
});

it('should have a devices object', async ({ playwright }) => {
  expect(playwright.devices['iPhone 6']).toBeTruthy();
  expect(playwright.devices['iPhone 6'].defaultBrowserType).toBe('webkit');
});

it('should kill browser process on timeout after close', async ({ browserType, mode }) => {
  it.skip(mode !== 'default', 'Test passes server hooks via options');

  const launchOptions: any = {};
  let stalled = false;
  launchOptions.__testHookGracefullyClose = () => {
    stalled = true;
    return new Promise(() => {});
  };
  launchOptions.__testHookBrowserCloseTimeout = 1_000;
  const browser = await browserType.launch(launchOptions);
  await browser.close();
  expect(stalled).toBeTruthy();
});

it('should throw a friendly error if its headed and there is no xserver on linux running', async ({ mode, browserType, platform }) => {
  it.skip(platform !== 'linux');
  it.skip(mode.startsWith('service'));

  const error: Error = await browserType.launch({
    headless: false,
    env: {
      ...process.env,
      DISPLAY: undefined,
    },
  }).catch(e => e);
  expect(error).toBeInstanceOf(Error);
  expect(error.message).toMatch(/Looks like you launched a headed browser without having a XServer running./);
  expect(error.message).toMatch(/xvfb-run/);
});
