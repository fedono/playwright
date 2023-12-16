import { test as baseTest, expect } from './playwright-test-fixtures';
import { RunServer } from '../config/remoteServer';
import type { PlaywrightServer } from '../config/remoteServer';

const test = baseTest.extend<{ runServer: () => Promise<PlaywrightServer> }>({
  runServer: async ({ childProcess }, use) => {
    let server: PlaywrightServer | undefined;
    await use(async () => {
      const runServer = new RunServer();
      await runServer.start(childProcess, 'extension');
      server = runServer;
      return server;
    });
    if (server) {
      await server.close();
      // Give any connected browsers a chance to disconnect to avoid
      // poisoning next test with quasy-alive browsers.
      await new Promise(f => setTimeout(f, 1000));
    }
  },
});

test('should reuse browser', async ({ runInlineTest, runServer }) => {
  const server = await runServer();
  const result = await runInlineTest({
    'src/a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('a', async ({ browser }) => {
        console.log('%%' + process.env.TEST_WORKER_INDEX + ':' + browser._guid);
      });
    `,
    'src/b.test.ts': `
      import { test, expect } from '@playwright/test';
      test('b', async ({ browser }) => {
        console.log('%%' + process.env.TEST_WORKER_INDEX + ':' + browser._guid);
      });
    `,
  }, { workers: 2 }, { PW_TEST_REUSE_CONTEXT: '1', PW_TEST_CONNECT_WS_ENDPOINT: server.wsEndpoint() });

  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(2);
  expect(result.outputLines).toHaveLength(2);
  const [workerIndex1, guid1] = result.outputLines[0].split(':');
  const [workerIndex2, guid2] = result.outputLines[1].split(':');
  expect(guid2).toBe(guid1);
  expect(workerIndex2).not.toBe(workerIndex1);
});

test('should reuse browser with special characters in the launch options', async ({ runInlineTest, runServer }) => {
  const server = await runServer();
  const result = await runInlineTest({
    'playwright.config.js': `
      module.exports = {
        use: {
          launchOptions: {
            env: {
              RANDOM_TEST_SPECIAL: 'Привет',
            }
          }
        }
      }
    `,
    'src/a.test.ts': `
      import { test, expect } from '@playwright/test';
      test('a', async ({ browser }) => {
        console.log('%%' + process.env.TEST_WORKER_INDEX + ':' + browser._guid);
      });
    `,
    'src/b.test.ts': `
      import { test, expect } from '@playwright/test';
      test('b', async ({ browser }) => {
        console.log('%%' + process.env.TEST_WORKER_INDEX + ':' + browser._guid);
      });
    `,
  }, { workers: 2 }, { PW_TEST_REUSE_CONTEXT: '1', PW_TEST_CONNECT_WS_ENDPOINT: server.wsEndpoint() });

  expect(result.exitCode).toBe(0);
  expect(result.passed).toBe(2);
  expect(result.outputLines).toHaveLength(2);
  const [workerIndex1, guid1] = result.outputLines[0].split(':');
  const [workerIndex2, guid2] = result.outputLines[1].split(':');
  expect(guid2).toBe(guid1);
  expect(workerIndex2).not.toBe(workerIndex1);
});
