import { browserTest as it, expect } from '../config/browserTest';

it('should fetch lodpi assets @smoke', async ({ contextFactory, server }) => {
  const context = await contextFactory({
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  const [request] = await Promise.all([
    page.waitForRequest('**/image*'),
    page.goto(server.PREFIX + '/highdpi.html'),
  ]);
  expect(request.url()).toContain('image1x');
});

it('should fetch hidpi assets', async ({ contextFactory, server }) => {
  const context = await contextFactory({
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  const [request] = await Promise.all([
    page.waitForRequest('**/image*'),
    page.goto(server.PREFIX + '/highdpi.html'),
  ]);
  expect(request.url()).toContain('image2x');
});
