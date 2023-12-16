import * as fs from 'fs';
import * as path from 'path';
import { installCoverageHooks } from './coverage';
import { test } from '@playwright/test';

export type CoverageWorkerOptions = {
  coverageName?: string;
};

export const coverageTest = test.extend<{}, { __collectCoverage: void } & CoverageWorkerOptions>({
  coverageName: [undefined, { scope: 'worker', option: true  }],
  __collectCoverage: [async ({ coverageName }, run, workerInfo) => {
    if (!coverageName) {
      await run();
      return;
    }

    const { coverage, uninstall } = installCoverageHooks(coverageName);
    await run();
    uninstall();
    const coveragePath = path.join(__dirname, '..', 'coverage-report', workerInfo.workerIndex + '.json');
    const coverageJSON = Array.from(coverage.keys()).filter(key => coverage.get(key));
    await fs.promises.mkdir(path.dirname(coveragePath), { recursive: true });
    await fs.promises.writeFile(coveragePath, JSON.stringify(coverageJSON, undefined, 2), 'utf8');
  }, { scope: 'worker', auto: true }],
});
