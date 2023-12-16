import path from 'path';
import { fileDependenciesForTest } from './transform/compilationCache';

export function fileDependencies() {
  return Object.fromEntries([...fileDependenciesForTest().entries()].map(entry => (
    [path.basename(entry[0]), [...entry[1]].map(f => path.basename(f)).sort()]
  )));
}
