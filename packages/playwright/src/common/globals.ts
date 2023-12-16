import type { TestInfoImpl } from '../worker/testInfo';
import type { Suite } from './test';
import type { FullConfigInternal } from './config';

let currentTestInfoValue: TestInfoImpl | null = null;
export function setCurrentTestInfo(testInfo: TestInfoImpl | null) {
  currentTestInfoValue = testInfo;
}
export function currentTestInfo(): TestInfoImpl | null {
  return currentTestInfoValue;
}

let currentFileSuite: Suite | undefined;
export function setCurrentlyLoadingFileSuite(suite: Suite | undefined) {
  currentFileSuite = suite;
}
export function currentlyLoadingFileSuite() {
  return currentFileSuite;
}

let currentExpectConfigureTimeout: number | undefined;

export function setCurrentExpectConfigureTimeout(timeout: number | undefined) {
  currentExpectConfigureTimeout = timeout;
}

export function currentExpectTimeout(options: { timeout?: number }) {
  const testInfo = currentTestInfo();
  if (options.timeout !== undefined)
    return options.timeout;
  if (currentExpectConfigureTimeout !== undefined)
    return currentExpectConfigureTimeout;
  let defaultExpectTimeout = testInfo?._projectInternal?.expect?.timeout;
  if (typeof defaultExpectTimeout === 'undefined')
    defaultExpectTimeout = 5000;
  return defaultExpectTimeout;
}

let _isWorkerProcess = false;

export function setIsWorkerProcess() {
  _isWorkerProcess = true;
}

export function isWorkerProcess() {
  return _isWorkerProcess;
}

let currentConfigValue: FullConfigInternal | null = null;
export function setCurrentConfig(config: FullConfigInternal | null) {
  currentConfigValue = config;
}
export function currentConfig(): FullConfigInternal | null {
  return currentConfigValue;
}
