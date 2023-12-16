let install;

try {
  if (!require('playwright-core/lib/utils').isLikelyNpxGlobal())
    install = require('playwright-core/lib/server').installBrowsersForNpmInstall;
} catch (e) {
  // Dev build, don't install browsers by default.
}

if (install)
  install(['firefox']);
