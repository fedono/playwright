import { stripAnsi } from '../config/utils';
import { test, expect } from './pageTest';

test('should print timed out error message', async ({ page }) => {
  await page.setContent('<div id=node>Text content</div>');
  const error = await expect(page.locator('no-such-thing')).toHaveText('hey', { timeout: 1000 }).catch(e => e);
  expect(stripAnsi(error.message)).toContain(`Timed out 1000ms waiting for expect(locator).toHaveText(expected)`);
});

test('should print timed out error message when value does not match', async ({ page }) => {
  await page.setContent('<div id=node>Text content</div>');
  const error = await expect(page.locator('div')).toHaveText('hey', { timeout: 1000 }).catch(e => e);
  expect(stripAnsi(error.message)).toContain(`Timed out 1000ms waiting for expect(locator).toHaveText(expected)`);
});

test('should print timed out error message with impossible timeout', async ({ page }) => {
  await page.setContent('<div id=node>Text content</div>');
  const error = await expect(page.locator('no-such-thing')).toHaveText('hey', { timeout: 1 }).catch(e => e);
  expect(stripAnsi(error.message)).toContain(`Timed out 1ms waiting for expect(locator).toHaveText(expected)`);
});

test('should print timed out error message when value does not match with impossible timeout', async ({ page }) => {
  await page.setContent('<div id=node>Text content</div>');
  const error = await expect(page.locator('div')).toHaveText('hey', { timeout: 1 }).catch(e => e);
  expect(stripAnsi(error.message)).toContain(`Timed out 1ms waiting for expect(locator).toHaveText(expected)`);
});

test('should not print timed out error message when page closes', async ({ page }) => {
  await page.setContent('<div id=node>Text content</div>');
  const [error] = await Promise.all([
    expect(page.locator('div')).toHaveText('hey', { timeout: 100000 }).catch(e => e),
    page.close(),
  ]);
  expect(stripAnsi(error.message)).toContain('expect.toHaveText with timeout 100000ms');
  expect(stripAnsi(error.message)).not.toContain('Timed out');
});
