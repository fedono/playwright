#!/usr/bin/env node
// @ts-check

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const esbuild = require('esbuild');

const injectedScripts = [
  path.join(ROOT, 'packages', 'playwright-core', 'src', 'server', 'injected', 'utilityScript.ts'),
  path.join(ROOT, 'packages', 'playwright-core', 'src', 'server', 'injected', 'injectedScript.ts'),
  path.join(ROOT, 'packages', 'playwright-core', 'src', 'server', 'injected', 'consoleApi.ts'),
  path.join(ROOT, 'packages', 'playwright-core', 'src', 'server', 'injected', 'recorder.ts'),
];

const modulePrefix = `
var __export = (target, all) => {for (var name in all) target[name] = all[name];};
var __toCommonJS = mod => ({ ...mod, __esModule: true });
`;

async function replaceEsbuildHeader(content, outFileJs) {
  const sourcesStart = content.indexOf('// packages/playwright-core/src/server');
  if (sourcesStart === -1)
    throw new Error(`Did not find start of bundled code in ${outFileJs}`);

  const preamble = content.substring(0, sourcesStart);
  // Replace standard esbuild definition with our own which do not depend on builtins.
  // See https://github.com/microsoft/playwright/issues/17029
  if (preamble.indexOf('__toCommonJS') !== -1) {
    content = modulePrefix + content.substring(sourcesStart);
    await fs.promises.writeFile(outFileJs, content);
  }
  return content;
}

(async () => {
  const generatedFolder = path.join(ROOT, 'packages', 'playwright-core', 'src', 'generated');
  await fs.promises.mkdir(generatedFolder, { recursive: true });
  for (const injected of injectedScripts) {
    const outdir = path.join(ROOT, 'packages', 'playwright-core', 'lib', 'server', 'injected', 'packed');
    await esbuild.build({
      entryPoints: [injected],
      bundle: true,
      outdir,
      format: 'cjs',
      platform: 'browser',
      target: 'ES2019'
    });
    const baseName = path.basename(injected);
    const outFileJs = path.join(outdir, baseName.replace('.ts', '.js'));
    let content = await fs.promises.readFile(outFileJs, 'utf-8');
    content = await replaceEsbuildHeader(content, outFileJs);
    const newContent = `export const source = ${JSON.stringify(content)};`;
    await fs.promises.writeFile(path.join(generatedFolder, baseName.replace('.ts', 'Source.ts')), newContent);
  }
})();
