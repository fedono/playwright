import type { TestError } from '../../types/testReporter';
import { serializeConfig } from '../common/ipc';
import { ProcessHost } from './processHost';
import { Suite } from '../common/test';
import { loadTestFile } from '../common/testLoader';
import type { FullConfigInternal } from '../common/config';
import { PoolBuilder } from '../common/poolBuilder';
import { addToCompilationCache } from '../transform/compilationCache';
import { incorporateCompilationCache, initializeEsmLoader } from '../common/esmLoaderHost';

export class InProcessLoaderHost {
  private _config: FullConfigInternal;
  private _poolBuilder: PoolBuilder;

  constructor(config: FullConfigInternal) {
    this._config = config;
    this._poolBuilder = PoolBuilder.createForLoader();
  }

  async start(errors: TestError[]) {
    await initializeEsmLoader();
    return true;
  }

  async loadTestFile(file: string, testErrors: TestError[]): Promise<Suite> {
    const result = await loadTestFile(file, this._config.config.rootDir, testErrors);
    this._poolBuilder.buildPools(result, testErrors);
    return result;
  }

  async stop() {
    await incorporateCompilationCache();
  }
}

export class OutOfProcessLoaderHost {
  private _config: FullConfigInternal;
  private _processHost: ProcessHost;

  constructor(config: FullConfigInternal) {
    this._config = config;
    this._processHost = new ProcessHost(require.resolve('../loader/loaderMain.js'), 'loader', {});
  }

  async start(errors: TestError[]) {
    const startError = await this._processHost.startRunner(serializeConfig(this._config));
    if (startError) {
      errors.push({
        message: `Test loader process failed to start with code "${startError.code}" and signal "${startError.signal}"`,
      });
      return false;
    }
    return true;
  }

  async loadTestFile(file: string, testErrors: TestError[]): Promise<Suite> {
    const result = await this._processHost.sendMessage({ method: 'loadTestFile', params: { file } }) as any;
    testErrors.push(...result.testErrors);
    return Suite._deepParse(result.fileSuite);
  }

  async stop() {
    const result = await this._processHost.sendMessage({ method: 'getCompilationCacheFromLoader' }) as any;
    addToCompilationCache(result);
    await this._processHost.stop();
  }
}
