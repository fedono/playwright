import type { Suite } from './testReporter';

export interface SuitePrivate extends Suite {
  _fileId: string | undefined;
  _parallelMode: 'none' | 'default' | 'serial' | 'parallel';
}
