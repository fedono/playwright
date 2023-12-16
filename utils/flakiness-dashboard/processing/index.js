const {blobServiceClient, gunzipAsync, deleteBlob} = require('./utils.js');
const {processDashboardRaw} = require('./dashboard_raw.js');
const {processDashboardCompressedV1} = require('./dashboard_compressed_v1.js');

module.exports = async function(context) {
  // First thing we do - delete the blob.
  await deleteBlob('uploads', context.bindingData.name);

  // Get report data.
  const data = await gunzipAsync(context.bindings.newBlob);
  const report = JSON.parse(data.toString('utf8'));

  // Process dashboards one-by-one to limit max heap utilization.
  const {reports, commitSHA} = await processDashboardRaw(context, report);
  await processDashboardCompressedV1(context, reports, commitSHA);
}
