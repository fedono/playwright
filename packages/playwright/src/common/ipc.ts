import util from 'util';
import { serializeCompilationCache } from '../transform/compilationCache';
import type { FullConfigInternal } from './config';
import type { ReporterDescription, TestInfoError, TestStatus } from '../../types/test';

export type ConfigCLIOverrides = {
  forbidOnly?: boolean;
  fullyParallel?: boolean;
  globalTimeout?: number;
  maxFailures?: number;
  outputDir?: string;
  quiet?: boolean;
  repeatEach?: number;
  retries?: number;
  reporter?: ReporterDescription[];
  shard?: { current: number, total: number };
  timeout?: number;
  ignoreSnapshots?: boolean;
  updateSnapshots?: 'all'|'none'|'missing';
  workers?: number | string;
  projects?: { name: string, use?: any }[],
  use?: any;
};

export type SerializedConfig = {
  configFile: string | undefined;
  configDir: string;
  configCLIOverrides: ConfigCLIOverrides;
  compilationCache: any;
};

export type TtyParams = {
  rows: number | undefined;
  columns: number | undefined;
  colorDepth: number;
};

export type ProcessInitParams = {
  stdoutParams: TtyParams;
  stderrParams: TtyParams;
  processName: string;
};

export type WorkerInitParams = {
  workerIndex: number;
  parallelIndex: number;
  repeatEachIndex: number;
  projectId: string;
  config: SerializedConfig;
  artifactsDir: string;
};

export type TestBeginPayload = {
  testId: string;
  startWallTime: number;  // milliseconds since unix epoch
};

export type AttachmentPayload = {
  testId: string;
  name: string;
  path?: string;
  body?: string;
  contentType: string;
};

export type TestEndPayload = {
  testId: string;
  duration: number;
  status: TestStatus;
  errors: TestInfoError[];
  expectedStatus: TestStatus;
  annotations: { type: string, description?: string }[];
  timeout: number;
};

export type StepBeginPayload = {
  testId: string;
  stepId: string;
  parentStepId: string | undefined;
  title: string;
  category: string;
  wallTime: number;  // milliseconds since unix epoch
  location?: { file: string, line: number, column: number };
};

export type StepEndPayload = {
  testId: string;
  stepId: string;
  wallTime: number;  // milliseconds since unix epoch
  error?: TestInfoError;
};

export type TestEntry = {
  testId: string;
  retry: number;
};

export type RunPayload = {
  file: string;
  entries: TestEntry[];
};

export type DonePayload = {
  fatalErrors: TestInfoError[];
  skipTestsDueToSetupFailure: string[];  // test ids
  fatalUnknownTestIds?: string[];
};

export type TestOutputPayload = {
  text?: string;
  buffer?: string;
};

export type TeardownErrorsPayload = {
  fatalErrors: TestInfoError[];
};

export type EnvProducedPayload = [string, string | null][];

export function serializeConfig(config: FullConfigInternal): SerializedConfig {
  const result: SerializedConfig = {
    configFile: config.config.configFile,
    configDir: config.configDir,
    configCLIOverrides: config.configCLIOverrides,
    compilationCache: serializeCompilationCache(),
  };
  return result;
}

export function stdioChunkToParams(chunk: Uint8Array | string): TestOutputPayload {
  if (chunk instanceof Uint8Array)
    return { buffer: Buffer.from(chunk).toString('base64') };
  if (typeof chunk !== 'string')
    return { text: util.inspect(chunk) };
  return { text: chunk };
}
