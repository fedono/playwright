#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { workspace } = require('../workspace.js');
const { execSync } = require('child_process');

const packageJSON = require('../../package.json');
const baseVersion = packageJSON.version.split('-')[0];

let prefix = '';
if (process.argv[2] === '--alpha') {
  prefix = 'alpha';
} else if (process.argv[2] === '--beta') {
  prefix = 'beta';
} else {
  throw new Error('only --alpha or --beta prefixes are allowed');
}

let newVersion;
if (process.argv[3] === '--today-date') {
  const date = new Date();
  const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  newVersion = `${baseVersion}-${prefix}-${month}-${day}-${year}`;
} else if (process.argv[3] === '--commit-timestamp') {
  const timestamp = execSync('git show -s --format=%ct HEAD', {
    stdio: ['ignore', 'pipe', 'ignore']
  }).toString('utf8').trim();
  newVersion = `${baseVersion}-${prefix}-${timestamp}000`;
} else {
  throw new Error('This script must be run with either --commit-timestamp or --today-date parameter');
}
console.log('Setting version to ' + newVersion);
workspace.setVersion(newVersion);
