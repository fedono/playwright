import fs from 'fs';
import path from 'path';
import { httpRequest } from '../../utils/network';
import { ManualPromise } from '../../utils/manualPromise';
import { extract } from '../../zipBundle';

export type DownloadParams = {
  title: string;
  browserDirectory: string;
  url: string;
  zipPath: string;
  executablePath: string | undefined;
  connectionTimeout: number;
  userAgent: string;
};

function log(message: string) {
  process.send?.({ method: 'log', params: { message } });
}

function progress(done: number, total: number) {
  process.send?.({ method: 'progress', params: { done, total } });
}

function browserDirectoryToMarkerFilePath(browserDirectory: string): string {
  return path.join(browserDirectory, 'INSTALLATION_COMPLETE');
}

function downloadFile(options: DownloadParams): Promise<void> {
  let downloadedBytes = 0;
  let totalBytes = 0;

  const promise = new ManualPromise<void>();

  httpRequest({
    url: options.url,
    headers: {
      'User-Agent': options.userAgent,
    },
    timeout: options.connectionTimeout,
  }, response => {
    log(`-- response status code: ${response.statusCode}`);
    if (response.statusCode !== 200) {
      let content = '';
      const handleError = () => {
        const error = new Error(`Download failed: server returned code ${response.statusCode} body '${content}'. URL: ${options.url}`);
        // consume response data to free up memory
        response.resume();
        promise.reject(error);
      };
      response
          .on('data', chunk => content += chunk)
          .on('end', handleError)
          .on('error', handleError);
      return;
    }
    totalBytes = parseInt(response.headers['content-length'] || '0', 10);
    log(`-- total bytes: ${totalBytes}`);
    const file = fs.createWriteStream(options.zipPath);
    file.on('finish', () => {
      if (downloadedBytes !== totalBytes) {
        log(`-- download failed, size mismatch: ${downloadedBytes} != ${totalBytes}`);
        promise.reject(new Error(`Download failed: size mismatch, file size: ${downloadedBytes}, expected size: ${totalBytes} URL: ${options.url}`));
      } else {
        log(`-- download complete, size: ${downloadedBytes}`);
        promise.resolve();
      }
    });
    file.on('error', error => promise.reject(error));
    response.pipe(file);
    response.on('data', onData);
  }, (error: any) => promise.reject(error));
  return promise;

  function onData(chunk: string) {
    downloadedBytes += chunk.length;
    progress(downloadedBytes, totalBytes);
  }
}

async function main(options: DownloadParams) {
  await downloadFile(options);
  log(`SUCCESS downloading ${options.title}`);
  log(`extracting archive`);
  await extract(options.zipPath, { dir: options.browserDirectory });
  if (options.executablePath) {
    log(`fixing permissions at ${options.executablePath}`);
    await fs.promises.chmod(options.executablePath, 0o755);
  }
  await fs.promises.writeFile(browserDirectoryToMarkerFilePath(options.browserDirectory), '');
}

process.on('message', async message => {
  const { method, params } = message as any;
  if (method === 'download') {
    try {
      await main(params);
      // eslint-disable-next-line no-restricted-properties
      process.exit(0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // eslint-disable-next-line no-restricted-properties
      process.exit(1);
    }
  }
});

// eslint-disable-next-line no-restricted-properties
process.on('disconnect', () => { process.exit(0); });
