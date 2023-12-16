import type { TestResult } from '../../types/testReporter';
import type { FullConfigInternal } from '../common/config';
import type { Suite, TestCase } from '../common/test';

export class FailureTracker {
  private _failureCount = 0;
  private _hasWorkerErrors = false;
  private _rootSuite: Suite | undefined;

  constructor(private _config: FullConfigInternal) {
  }

  onRootSuite(rootSuite: Suite) {
    this._rootSuite = rootSuite;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== test.expectedStatus)
      ++this._failureCount;
  }

  onWorkerError() {
    this._hasWorkerErrors = true;
  }

  hasReachedMaxFailures() {
    const maxFailures = this._config.config.maxFailures;
    return maxFailures > 0 && this._failureCount >= maxFailures;
  }

  hasWorkerErrors() {
    return this._hasWorkerErrors;
  }

  result(): 'failed' | 'passed' {
    return this._hasWorkerErrors || this._rootSuite?.allTests().some(test => !test.ok()) ? 'failed' : 'passed';
  }
}
