import { test as it, expect } from './pageTest';
import type { Locator } from 'playwright-core';

type BoundingBox = Awaited<ReturnType<Locator['boundingBox']>>;

it.skip(({ mode }) => mode !== 'default', 'Highlight element has a closed shadow-root on != default');

it('should highlight locator', async ({ page }) => {
  await page.setContent(`<input type='text' />`);
  await page.locator('input').highlight();
  await expect(page.locator('x-pw-tooltip')).toHaveText('locator(\'input\')');
  await expect(page.locator('x-pw-highlight')).toBeVisible();
  const box1 = roundBox(await page.locator('input').boundingBox());
  const box2 = roundBox(await page.locator('x-pw-highlight').boundingBox());
  expect(box1).toEqual(box2);
});

function roundBox(box: BoundingBox): BoundingBox {
  return {
    x: Math.round(box.x),
    y: Math.round(box.y),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}
