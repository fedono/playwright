import type { ReporterV2 } from './reporterV2';
import type { FullConfig, TestCase, TestError, TestResult, FullResult, TestStep, Suite } from '../../types/testReporter';

class EmptyReporter implements ReporterV2 {
  onConfigure(config: FullConfig) {
  }

  onBegin(suite: Suite) {
  }

  onTestBegin(test: TestCase, result: TestResult) {
  }

  onStdOut(chunk: string | Buffer, test?: TestCase, result?: TestResult) {
  }

  onStdErr(chunk: string | Buffer, test?: TestCase, result?: TestResult) {
  }

  onTestEnd(test: TestCase, result: TestResult) {
  }

  async onEnd(result: FullResult) {
  }

  async onExit() {
  }

  onError(error: TestError) {
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep) {
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
  }

  printsToStdio() {
    return false;
  }

  version(): 'v2' {
    return 'v2';
  }
}

export default EmptyReporter;
