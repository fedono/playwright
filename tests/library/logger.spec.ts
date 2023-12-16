import { playwrightTest as it, expect } from '../config/browserTest';

it('should log @smoke', async ({ browserType, mode }) => {
  it.skip(mode !== 'default', 'logger is not plumbed into the remote connection');

  const log = [];
  const browser = await browserType.launch({ logger: {
    log: (name, severity, message) => log.push({ name, severity, message }),
    isEnabled: (name, severity) => severity !== 'verbose'
  } });
  await browser.newContext();
  await browser.close();
  expect(log.find(item => item.severity === 'info')).toBeTruthy();
  expect(log.find(item => item.message.includes('browser.newContext started'))).toBeTruthy();
  expect(log.find(item => item.message.includes('browser.newContext succeeded'))).toBeTruthy();
});

it('should log context-level', async ({ browserType }) => {
  const log = [];
  const browser = await browserType.launch();
  const context = await browser.newContext({
    logger: {
      log: (name, severity, message) => log.push({ name, severity, message }),
      isEnabled: (name, severity) => severity !== 'verbose'
    }
  });
  const page = await context.newPage();
  await page.setContent('<button>Button</button>');
  await page.click('button');
  await browser.close();

  expect(log.length > 0).toBeTruthy();
  expect(log.filter(item => item.message.includes('page.setContent')).length > 0).toBeTruthy();
  expect(log.filter(item => item.message.includes('page.click')).length > 0).toBeTruthy();
});
