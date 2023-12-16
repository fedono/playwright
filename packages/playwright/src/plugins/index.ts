import type { FullConfig, Suite } from '../../types/testReporter';
import type { ReporterV2 } from '../reporters/reporterV2';

export interface TestRunnerPlugin {
  name: string;
  setup?(config: FullConfig, configDir: string, reporter: ReporterV2): Promise<void>;
  begin?(suite: Suite): Promise<void>;
  end?(): Promise<void>;
  teardown?(): Promise<void>;
}

export type TestRunnerPluginRegistration = {
  factory: TestRunnerPlugin | (() => TestRunnerPlugin | Promise<TestRunnerPlugin>);
  instance?: TestRunnerPlugin;
};

export { webServer } from './webServerPlugin';
export { gitCommitInfo } from './gitCommitInfoPlugin';
