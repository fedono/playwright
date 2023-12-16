import type { BrowserType } from '../browserType';
import { BrowserDispatcher } from './browserDispatcher';
import type * as channels from '@protocol/channels';
import type { RootDispatcher } from './dispatcher';
import { Dispatcher } from './dispatcher';
import { BrowserContextDispatcher } from './browserContextDispatcher';
import type { CallMetadata } from '../instrumentation';

// imp browser type 就是 chromium / firefox / webkit 这些
export class BrowserTypeDispatcher extends Dispatcher<BrowserType, channels.BrowserTypeChannel, RootDispatcher> implements channels.BrowserTypeChannel {
  _type_BrowserType = true;
  constructor(scope: RootDispatcher, browserType: BrowserType) {
    super(scope, browserType, 'BrowserType', {
      executablePath: browserType.executablePath(),
      name: browserType.name()
    });
  }

  // fl dispatcher 003 | BrowserTypeDispatcher (browser type 就是每一种类型的浏览器) -> BrowserDispatcher
  async launch(params: channels.BrowserTypeLaunchParams, metadata: CallMetadata): Promise<channels.BrowserTypeLaunchResult> {
    // nt 这里的 _object 就是 chromium，为啥跳转到的是 browserType.launch，哦因为 Chromium 继承了 browserType
    const browser = await this._object.launch(metadata, params);
    // qs 怎么 dispatcher 是在 launch 里面
    return { browser: new BrowserDispatcher(this, browser) };
  }

  async launchPersistentContext(params: channels.BrowserTypeLaunchPersistentContextParams, metadata: CallMetadata): Promise<channels.BrowserTypeLaunchPersistentContextResult> {
    const browserContext = await this._object.launchPersistentContext(metadata, params.userDataDir, params);
    return { context: new BrowserContextDispatcher(this, browserContext) };
  }

  async connectOverCDP(params: channels.BrowserTypeConnectOverCDPParams, metadata: CallMetadata): Promise<channels.BrowserTypeConnectOverCDPResult> {
    const browser = await this._object.connectOverCDP(metadata, params.endpointURL, params, params.timeout);
    const browserDispatcher = new BrowserDispatcher(this, browser);
    return {
      browser: browserDispatcher,
      defaultContext: browser._defaultContext ? new BrowserContextDispatcher(browserDispatcher, browser._defaultContext) : undefined,
    };
  }
}
