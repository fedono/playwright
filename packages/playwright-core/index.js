
const minimumMajorNodeVersion = 14;
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const [major] = [+semver[0]];

if (major < minimumMajorNodeVersion) {
  // eslint-disable-next-line no-console
  console.error(
      'You are running Node.js ' +
      currentNodeVersion +
      '.\n' +
      `Playwright requires Node.js ${minimumMajorNodeVersion} or higher. \n` +
      'Please update your version of Node.js.'
  );
  process.exit(1);
}

module.exports = require('./lib/inprocess');
