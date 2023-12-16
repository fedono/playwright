#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

// Note: we ignore stdout for smaller output.
try {
  execSync('npm run test -- --list --forbid-only', {
    stdio: ['ignore', 'ignore', 'inherit'],
    cwd: path.join(__dirname, '..'),
  });
  execSync('npm run ttest -- --list --forbid-only', {
    stdio: ['ignore', 'ignore', 'inherit'],
    cwd: path.join(__dirname, '..'),
  });
} catch (e) {
  process.exit(1);
}
