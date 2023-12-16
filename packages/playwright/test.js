const pwt = require('./lib/index');
const playwright = require('./index');
const combinedExports = {
  ...playwright,
  ...pwt,
};

Object.defineProperty(combinedExports, '__esModule', { value: true });

module.exports = combinedExports;
