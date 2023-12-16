import { mergeTests } from '@playwright/test';
import { test } from '@playwright/test';
import type { CommonFixtures, CommonWorkerFixtures } from './commonFixtures';
import { commonFixtures } from './commonFixtures';
import type { ServerFixtures, ServerWorkerOptions } from './serverFixtures';
import { serverFixtures } from './serverFixtures';
import { coverageTest } from './coverageFixtures';
import { platformTest } from './platformFixtures';
import { testModeTest } from './testModeFixtures';

export const base = test;

export const baseTest = mergeTests(base, coverageTest, platformTest, testModeTest)
    .extend<CommonFixtures, CommonWorkerFixtures>(commonFixtures)
    .extend<ServerFixtures, ServerWorkerOptions>(serverFixtures);

export function step<This extends Object, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Promise<Return>,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>
) {
  function replacementMethod(this: This, ...args: Args): Promise<Return> {
    const name = this.constructor.name + '.' + (context.name as string) + '(' + args.map(a => JSON.stringify(a)).join(',') + ')';
    return test.step(name, async () => {
      return await target.call(this, ...args);
    });
  }
  return replacementMethod;
}
