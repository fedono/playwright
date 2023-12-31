import type { Playwright as PlaywrightAPI } from './client/playwright';
import { createPlaywright, DispatcherConnection, RootDispatcher, PlaywrightDispatcher } from './server';
import { Connection } from './client/connection';
import { BrowserServerLauncherImpl } from './browserServerImpl';
import { AndroidServerLauncherImpl } from './androidServerImpl';
import type { Language } from './utils/isomorphic/locatorGenerators';

// imp 这是 playwright-core 的入口
export function createInProcessPlaywright(): PlaywrightAPI {
  const playwright = createPlaywright({ sdkLanguage: (process.env.PW_LANG_NAME as Language | undefined) || 'javascript' });

  // imp 这个是 client 的，也就是这里和 client 连接上了？可这个只是个 message send 啊
  // qs 如果真的就只是这里来连接 client / server，那就真的有点不好来调试了
  const clientConnection = new Connection(undefined, undefined);
  const dispatcherConnection = new DispatcherConnection(true /* local */);

  // Dispatch synchronously at first.
  dispatcherConnection.onmessage = message => clientConnection.dispatch(message);
  clientConnection.onmessage = message => dispatcherConnection.dispatch(message);

  const rootScope = new RootDispatcher(dispatcherConnection);

  // Initialize Playwright channel.
  new PlaywrightDispatcher(rootScope, playwright);
  const playwrightAPI = clientConnection.getObjectWithKnownName('Playwright') as PlaywrightAPI;
  playwrightAPI.chromium._serverLauncher = new BrowserServerLauncherImpl('chromium');

  /* playwrightAPI.firefox._serverLauncher = new BrowserServerLauncherImpl('firefox');
  playwrightAPI.webkit._serverLauncher = new BrowserServerLauncherImpl('webkit');
  playwrightAPI._android._serverLauncher = new AndroidServerLauncherImpl(); */

  // Switch to async dispatch after we got Playwright object.
  dispatcherConnection.onmessage = message => setImmediate(() => clientConnection.dispatch(message));
  clientConnection.onmessage = message => setImmediate(() => dispatcherConnection.dispatch(message));

  clientConnection.toImpl = (x: any) => x ? dispatcherConnection._dispatchers.get(x._guid)!._object : dispatcherConnection._dispatchers.get('');
  (playwrightAPI as any)._toImpl = clientConnection.toImpl;
  return playwrightAPI;
}
