// @ts-check
const path = require('path');
const esbuild = require('esbuild');
const fs = require('fs');

const outdir = path.join(__dirname, '../../lib/utilsBundleImpl');

if (!fs.existsSync(outdir))
  fs.mkdirSync(outdir);

{
  // 'open' package requires 'xdg-open' binary to be present, which does not get bundled by esbuild.
  fs.copyFileSync(path.join(__dirname, 'node_modules/open/xdg-open'), path.join(outdir, 'xdg-open'));
}

(async () => {
  const ctx = await esbuild.context({
    entryPoints: [path.join(__dirname, 'src/utilsBundleImpl.ts')],
    bundle: true,
    outfile: path.join(outdir, 'index.js'),
    format: 'cjs',
    platform: 'node',
    target: 'ES2019',
    sourcemap: process.argv.includes('--sourcemap'),
    minify: process.argv.includes('--minify'),
  });
  await ctx.rebuild();
  if (process.argv.includes('--watch'))
    await ctx.watch();
  await ctx.dispose();
})().catch(error => {
  console.error(error);
  process.exit(1);
});
