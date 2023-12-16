#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const {SimpleBlob} = require('./utils.js');
const {processDashboardCompressedV1} = require('./dashboard_compressed_v1.js');

(async () => {
  const sha = process.argv[2];
  console.log(sha);
  const dashboardBlob = await SimpleBlob.create('dashboards', `raw/${sha}.json`);
  const reports = await dashboardBlob.download();
  if (!reports) {
    console.error('ERROR: no data found for commit ' + sha);
    process.exit(1);
  }
  await processDashboardCompressedV1({log: console.log}, reports, sha);
})();
