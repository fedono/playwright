import { browserTest as it, expect } from '../config/browserTest';

it('should not fail page.textContent in non-strict mode', async ({ page }) => {
  await page.setContent(`<span>span1</span><div><span>target</span></div>`);
  expect(await page.textContent('span', { strict: false })).toBe('span1');
});

it.describe('strict context mode', () => {
  it.use({
    contextOptions: async ({ contextOptions }, use) => {
      const options = { ...contextOptions, strictSelectors: true };
      await use(options);
    }
  });

  it('should fail page.textContent in strict mode', async ({ page }) => {
    await page.setContent(`<span>span1</span><div><span>target</span></div>`);
    const error = await page.textContent('span').catch(e => e);
    expect(error.message).toContain('strict mode violation');
  });

  it('should fail page.click in strict mode', async ({ page }) => {
    await page.setContent(`<button>button1</button><button>target</button>`);
    const error = await page.click('button').catch(e => e);
    expect(error.message).toContain('strict mode violation');
  });

  it('should opt out of strict mode', async ({ page }) => {
    await page.setContent(`<span>span1</span><div><span>target</span></div>`);
    expect(await page.textContent('span', { strict: false })).toBe('span1');
  });
});
