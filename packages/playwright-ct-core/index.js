const { test: baseTest, expect, devices, defineConfig: originalDefineConfig } = require('playwright/test');
const { fixtures } = require('./lib/mount');

const defineConfig = config => originalDefineConfig({
  ...config,
  build: {
    ...config.build,
    babelPlugins: [
      [require.resolve('./lib/tsxTransform')]
    ],
  }
});

const test = baseTest.extend(fixtures);

module.exports = { test, expect, devices, defineConfig };
