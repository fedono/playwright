const {SimpleBlob} = require('./utils.js');

async function processDashboardRaw(context, report) {
  const timestamp = Date.now();
  const dashboardBlob = await SimpleBlob.create('dashboards', `raw/${report.metadata.commitSHA}.json`);
  const dashboardData = (await dashboardBlob.download()) || [];
  dashboardData.push(report);
  await dashboardBlob.uploadGzipped(dashboardData);

  context.log(`
  ===== started dashboard raw =====
    SHA: ${report.metadata.commitSHA}
    URL: ${report.metadata.runURL}
    timestamp: ${report.metadata.commitTimestamp}
  ===== complete in ${Date.now() - timestamp}ms =====
  `);
  return {
    reports: dashboardData,
    commitSHA: report.metadata.commitSHA,
  };
}

module.exports = {processDashboardRaw};

