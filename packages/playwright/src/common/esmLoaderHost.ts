import { addToCompilationCache, serializeCompilationCache } from '../transform/compilationCache';
import { transformConfig } from '../transform/transform';
import { PortTransport } from '../transform/portTransport';

const port = (globalThis as any).__esmLoaderPort;

const loaderChannel = port ? new PortTransport(port, async (method, params) => {
  if (method === 'pushToCompilationCache')
    addToCompilationCache(params.cache);
}) : undefined;

export async function startCollectingFileDeps() {
  if (!loaderChannel)
    return;
  await loaderChannel.send('startCollectingFileDeps', {});
}

export async function stopCollectingFileDeps(file: string) {
  if (!loaderChannel)
    return;
  await loaderChannel.send('stopCollectingFileDeps', { file });
}

export async function incorporateCompilationCache() {
  if (!loaderChannel)
    return;
  const result = await loaderChannel.send('getCompilationCache', {});
  addToCompilationCache(result.cache);
}

export async function initializeEsmLoader() {
  if (!loaderChannel)
    return;
  await loaderChannel.send('setTransformConfig', { config: transformConfig() });
  await loaderChannel.send('addToCompilationCache', { cache: serializeCompilationCache() });
}
