import type { SerializedConfig } from '../common/ipc';
import { ConfigLoader } from '../common/configLoader';
import { ProcessRunner } from '../common/process';
import type { FullConfigInternal } from '../common/config';
import { loadTestFile } from '../common/testLoader';
import type { TestError } from '../../types/testReporter';
import { serializeCompilationCache } from '../transform/compilationCache';
import { PoolBuilder } from '../common/poolBuilder';
import { incorporateCompilationCache } from '../common/esmLoaderHost';

export class LoaderMain extends ProcessRunner {
  private _serializedConfig: SerializedConfig;
  private _configPromise: Promise<FullConfigInternal> | undefined;
  private _poolBuilder = PoolBuilder.createForLoader();

  constructor(serializedConfig: SerializedConfig) {
    super();
    this._serializedConfig = serializedConfig;
  }

  private _config(): Promise<FullConfigInternal> {
    if (!this._configPromise)
      this._configPromise = ConfigLoader.deserialize(this._serializedConfig);
    return this._configPromise;
  }

  async loadTestFile(params: { file: string }) {
    const testErrors: TestError[] = [];
    const config = await this._config();
    const fileSuite = await loadTestFile(params.file, config.config.rootDir, testErrors);
    this._poolBuilder.buildPools(fileSuite);
    return { fileSuite: fileSuite._deepSerialize(), testErrors };
  }

  async getCompilationCacheFromLoader() {
    await incorporateCompilationCache();
    return serializeCompilationCache();
  }
}

export const create = (config: SerializedConfig) => new LoaderMain(config);
