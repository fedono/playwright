const { test, expect, devices, defineConfig: originalDefineConfig } = require('@playwright/experimental-ct-core');
const path = require('path');

const plugin = () => {
  // Only fetch upon request to avoid resolution in workers.
  const { createPlugin } = require('@playwright/experimental-ct-core/lib/vitePlugin');
  return createPlugin(
    path.join(__dirname, 'registerSource.mjs'),
    () => import('@vitejs/plugin-react').then(plugin => plugin.default()));
};
const defineConfig = config => originalDefineConfig({ ...config, _plugins: [plugin] });

module.exports = { test, expect, devices, defineConfig };
