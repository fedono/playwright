import { test, expect } from './playwright-test-fixtures';

test('should check types of fixtures', async ({ runTSC }) => {
  const result = await runTSC({
    'helper.ts': `
      import { test as base, expect } from '@playwright/test';
      export type MyOptions = { foo: string, bar: number };
      export const test = base.extend<{ foo: string }, { bar: number }>({
        foo: 'foo',
        bar: [ 42, { scope: 'worker', timeout: 123 } ],
      });

      const good1 = test.extend<{}>({ foo: async ({ bar }, run) => run('foo') });
      const good2 = test.extend<{}>({ bar: ({}, run) => run(42) });
      const good3 = test.extend<{}>({ bar: ({}, run) => run(42) });
      const good4 = test.extend<{}>({ bar: async ({ bar }, run) => run(42) });
      const good5 = test.extend<{}>({ foo: async ({ foo }, run) => run('foo') });
      const good6 = test.extend<{ baz: boolean }>({
        baz: false,
        foo: async ({ baz }, run) => run('foo')
      });
      const good7 = test.extend<{ baz: boolean }>({
        baz: [ false, { auto: true, timeout: 0 } ],
      });
      const good8 = test.extend<{ foo: string }>({
        foo: [ async ({}, use) => {
          await use('foo');
        }, { scope: 'test' } ],
      });
      const good9 = test.extend<{}, {}>({
        bar: [ async ({}, use) => {
          await use(42);
        }, { scope: 'worker' } ],
      });

      // @ts-expect-error
      const fail1 = test.extend<{}>({ foo: 42 });
      // @ts-expect-error
      const fail2 = test.extend<{}>({ bar: async ({ foo }, run) => run(42) });
      // @ts-expect-error
      const fail3 = test.extend<{}>({ baz: 42 });
      // @ts-expect-error
      const fail4 = test.extend<{}>({ foo: async ({ foo }, run) => run(42) });
      // @ts-expect-error
      const fail5 = test.extend<{}>({ bar: async ({}, run) => run('foo') });
      const fail6 = test.extend<{ baz: boolean }>({
        // @ts-expect-error
        baz: [ true, { scope: 'worker' } ],
      });
      const fail7 = test.extend<{}, { baz: boolean }>({
        // @ts-expect-error
        baz: [ true, { scope: 'test' } ],
      });
      const fail8 = test.extend<{}, { baz: boolean }>({
        // @ts-expect-error
        baz: true,
      });
      const fail9 = test.extend<{ foo: string }>({
        // @ts-expect-error
        foo: [ async ({}, use) => {
          await use('foo');
        }, { scope: 'test', auto: true } ],
      });
      const fail10 = test.extend<{}, {}>({
        // @ts-expect-error
        bar: [ async ({}, use) => {
          await use(42);
        }, { scope: 'test' } ],
      });
      const fail11 = test.extend<{ yay: string }>({
        // @ts-expect-error
        yay: [ async ({}, use) => {
          await use('foo');
        }, { scope: 'test', timeout: 'str' } ],
      });

      type AssertNotAny<S> = {notRealProperty: number} extends S ? false : true;
      type AssertType<T, S> = S extends T ? AssertNotAny<S> : false;
      const funcTest = base.extend<{ foo: (x: number, y: string) => Promise<string> }>({
        foo: async ({}, use) => {
          await use(async (x, y) => {
            const assertionX: AssertType<number, typeof x> = true;
            const assertionY: AssertType<string, typeof y> = true;
            return y;
          });
        },
      })
    `,
    'playwright.config.ts': `
      import { MyOptions } from './helper';
      import { Config } from '@playwright/test';
      const configs1: Config[] = [];
      configs1.push({ use: { foo: '42', bar: 42 } });
      configs1.push({ use: { foo: '42', bar: 42 }, timeout: 100 });

      const configs2: Config<MyOptions>[] = [];
      configs2.push({ use: { foo: '42', bar: 42 } });
      // @ts-expect-error
      configs2.push({ use: { bar: '42' } });
      // @ts-expect-error
      configs2.push(new Env2());
      // @ts-expect-error
      configs2.push({ use: { foo: 42, bar: 42 } });
      // @ts-expect-error
      configs2.push({ beforeAll: async () => { return {}; } });
      // TODO: next line should not compile.
      configs2.push({ timeout: 100 });
      // @ts-expect-error
      configs2.push('alias');
      // TODO: next line should not compile.
      configs2.push({});
    `,
    'a.spec.ts': `
      import { test } from './helper';
      test.use({ foo: 'foo' });
      test.use({});

      // @ts-expect-error
      test.use({ foo: 42 });
      // @ts-expect-error
      test.use({ baz: 'baz' });

      test('my test', async ({ foo, bar }) => {
        bar += parseInt(foo);
      });
      test('my test', ({ foo, bar }) => {
        bar += parseInt(foo);
      });
      test('my test', () => {});
      // @ts-expect-error
      test('my test', async ({ a }) => {
      });

      // @ts-expect-error
      test.beforeEach(async ({ a }) => {});
      test.beforeEach(async ({ foo, bar }) => {});
      test.beforeEach(() => {});

      // @ts-expect-error
      test.beforeAll(async ({ a }) => {});
      test.beforeAll(async ({ foo, bar }) => {});
      test.beforeAll(() => {});

      // @ts-expect-error
      test.afterEach(async ({ a }) => {});
      test.afterEach(async ({ foo, bar }) => {});
      test.afterEach(() => {});

      // @ts-expect-error
      test.afterAll(async ({ a }) => {});
      test.afterAll(async ({ foo, bar }) => {});
      test.afterAll(() => {});
    `,
    'playwright-props.config.ts': `
      import { PlaywrightTestConfig } from '@playwright/test';
      const config0: PlaywrightTestConfig = {
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
        },
      };

      const config1: PlaywrightTestConfig = {
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
          // @ts-expect-error
          hasTouch: 'foo',
        },
      };

      const config2: PlaywrightTestConfig = {
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
          // @ts-expect-error
          foo: true,
        },
      };

      const config3: PlaywrightTestConfig<{ foo: boolean }> = {
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
          foo: true,
        },
      };

      const config4: PlaywrightTestConfig<{ foo: boolean }> = {
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
          foo: true,
          // @ts-expect-error
          hasTouch: 'foo',
        },
      };
    `,

    'playwright-define.config.ts': `
      import { defineConfig } from '@playwright/test';
      const config0 = defineConfig({
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
        },
      });

      const config1 = defineConfig({
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
          // @ts-expect-error
          hasTouch: 'foo',
        },
      });

      const config2 = defineConfig({
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
          // @ts-expect-error
          foo: true,
        },
      });

      const config3 = defineConfig<{ foo: boolean }>({
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
          foo: true,
        },
      });

      const config4 = defineConfig<{ foo: boolean }>({
        use: {
          ignoreHTTPSErrors: undefined,
          isMobile: true,
          javaScriptEnabled: false,
          foo: true,
          // @ts-expect-error
          hasTouch: 'foo',
        },
      });
    `,
  });
  expect(result.exitCode).toBe(0);
});

test('config should allow void/empty options', async ({ runTSC }) => {
  const result = await runTSC({
    'playwright.config.ts': `
      import { Config } from '@playwright/test';
      const configs: Config[] = [];
      configs.push({});
      configs.push({ timeout: 100 });
      configs.push();
      configs.push({ use: { foo: 42 }});
    `,
    'a.spec.ts': `
      import { test, expect } from '@playwright/test';
      test('my test', async () => {
      });
    `
  });
  expect(result.exitCode).toBe(0);
});
