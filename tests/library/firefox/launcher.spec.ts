import { playwrightTest as it, expect } from '../../config/browserTest';

it('should pass firefox user preferences', async ({ browserType, mode }) => {
  it.skip(mode.startsWith('service'));
  const browser = await browserType.launch({
    firefoxUserPrefs: {
      'network.proxy.type': 1,
      'network.proxy.http': '127.0.0.1',
      'network.proxy.http_port': 3333,
    }
  });
  const page = await browser.newPage();
  const error = await page.goto('http://example.com').catch(e => e);
  expect(error.message).toContain('NS_ERROR_PROXY_CONNECTION_REFUSED');
  await browser.close();
});

it('should pass firefox user preferences in persistent', async ({ mode, launchPersistent }) => {
  it.skip(mode.startsWith('service'));
  const { page } = await launchPersistent({
    firefoxUserPrefs: {
      'network.proxy.type': 1,
      'network.proxy.http': '127.0.0.1',
      'network.proxy.http_port': 3333,
    }
  });
  const error = await page.goto('http://example.com').catch(e => e);
  expect(error.message).toContain('NS_ERROR_PROXY_CONNECTION_REFUSED');
});
