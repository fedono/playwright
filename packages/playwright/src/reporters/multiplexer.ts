import type { FullConfig, TestCase, TestError, TestResult, FullResult, TestStep } from '../../types/testReporter';
import type { Suite } from '../common/test';
import type { ReporterV2 } from './reporterV2';

export class Multiplexer implements ReporterV2 {
  private _reporters: ReporterV2[];

  constructor(reporters: ReporterV2[]) {
    this._reporters = reporters;
  }

  version(): 'v2' {
    return 'v2';
  }

  onConfigure(config: FullConfig) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onConfigure(config));
  }

  onBegin(suite: Suite) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onBegin(suite));
  }

  onTestBegin(test: TestCase, result: TestResult) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onTestBegin(test, result));
  }

  onStdOut(chunk: string | Buffer, test?: TestCase, result?: TestResult) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onStdOut(chunk, test, result));
  }

  onStdErr(chunk: string | Buffer, test?: TestCase, result?: TestResult) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onStdErr(chunk, test, result));
  }

  onTestEnd(test: TestCase, result: TestResult) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onTestEnd(test, result));
  }

  async onEnd(result: FullResult) {
    for (const reporter of this._reporters) {
      const outResult = await wrapAsync(() => reporter.onEnd(result));
      if (outResult?.status)
        result.status = outResult.status;
    }
    return result;
  }

  async onExit() {
    for (const reporter of this._reporters)
      await wrapAsync(() => reporter.onExit());
  }

  onError(error: TestError) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onError(error));
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onStepBegin(test, result, step));
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
    for (const reporter of this._reporters)
      wrap(() => reporter.onStepEnd(test, result, step));
  }

  printsToStdio(): boolean {
    return this._reporters.some(r => {
      let prints = true;
      wrap(() => prints = r.printsToStdio());
      return prints;
    });
  }
}

async function wrapAsync<T>(callback: () => T | Promise<T>) {
  try {
    return await callback();
  } catch (e) {
    console.error('Error in reporter', e);
  }
}

function wrap(callback: () => void) {
  try {
    callback();
  } catch (e) {
    console.error('Error in reporter', e);
  }
}
