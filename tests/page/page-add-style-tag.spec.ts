import { test as it, expect } from './pageTest';
import path from 'path';

it('should throw an error if no options are provided', async ({ page, server }) => {
  let error = null;
  try {
    // @ts-ignore
    await page.addStyleTag('/injectedstyle.css');
  } catch (e) {
    error = e;
  }
  expect(error.message).toContain('Provide an object with a `url`, `path` or `content` property');
});

it('should work with a url @smoke', async ({ page, server }) => {
  await page.goto(server.EMPTY_PAGE);
  const styleHandle = await page.addStyleTag({ url: '/injectedstyle.css' });
  expect(styleHandle.asElement()).not.toBeNull();
  expect(await page.evaluate(`window.getComputedStyle(document.querySelector('body')).getPropertyValue('background-color')`)).toBe('rgb(255, 0, 0)');
});

it('should throw an error if loading from url fail', async ({ page, server }) => {
  await page.goto(server.EMPTY_PAGE);
  let error = null;
  try {
    await page.addStyleTag({ url: '/nonexistfile.js' });
  } catch (e) {
    error = e;
  }
  expect(error).not.toBe(null);
});

it('should work with a path', async ({ page, server, asset }) => {
  await page.goto(server.EMPTY_PAGE);
  const styleHandle = await page.addStyleTag({ path: asset('injectedstyle.css') });
  expect(styleHandle.asElement()).not.toBeNull();
  expect(await page.evaluate(`window.getComputedStyle(document.querySelector('body')).getPropertyValue('background-color')`)).toBe('rgb(255, 0, 0)');
});

it('should include sourceURL when path is provided', async ({ page, server, asset }) => {
  await page.goto(server.EMPTY_PAGE);
  await page.addStyleTag({ path: asset('injectedstyle.css') });
  const styleHandle = await page.$('style');
  const styleContent = await page.evaluate(style => style.innerHTML, styleHandle);
  expect(styleContent).toContain(path.join('assets', 'injectedstyle.css'));
});

it('should work with content', async ({ page, server }) => {
  await page.goto(server.EMPTY_PAGE);
  const styleHandle = await page.addStyleTag({ content: 'body { background-color: green; }' });
  expect(styleHandle.asElement()).not.toBeNull();
  expect(await page.evaluate(`window.getComputedStyle(document.querySelector('body')).getPropertyValue('background-color')`)).toBe('rgb(0, 128, 0)');
});

it('should throw when added with content to the CSP page', async ({ page, server }) => {
  await page.goto(server.PREFIX + '/csp.html');
  let error = null;
  await page.addStyleTag({ content: 'body { background-color: green; }' }).catch(e => error = e);
  expect(error).toBeTruthy();
});

it('should throw when added with URL to the CSP page', async ({ page, server, isAndroid }) => {
  it.skip(isAndroid, 'No cross-process on Android');

  await page.goto(server.PREFIX + '/csp.html');
  let error = null;
  await page.addStyleTag({ url: server.CROSS_PROCESS_PREFIX + '/injectedstyle.css' }).catch(e => error = e);
  expect(error).toBeTruthy();
});
