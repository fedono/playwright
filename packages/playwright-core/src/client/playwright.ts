import type * as channels from '@protocol/channels';
import { TimeoutError } from './errors';
import { Android } from './android';
import { BrowserType } from './browserType';
import { ChannelOwner } from './channelOwner';
import { Electron } from './electron';
import { APIRequest } from './fetch';
import { Selectors, SelectorsOwner } from './selectors';

export class Playwright extends ChannelOwner<channels.PlaywrightChannel> {
  readonly chromium: BrowserType;
  /* readonly _android: Android;
  readonly _electron: Electron;
  readonly firefox: BrowserType;
  readonly webkit: BrowserType; */
  readonly devices: any;
  selectors: Selectors;
  // qs request 在这里创建了，但是没有使用？这么前的入口中，初始化 APIRequest 是为啥，为啥这个的优先级这么高？
  readonly request: APIRequest;
  readonly errors: { TimeoutError: typeof TimeoutError };

  constructor(parent: ChannelOwner, type: string, guid: string, initializer: channels.PlaywrightInitializer) {
    super(parent, type, guid, initializer);
    this.request = new APIRequest(this);
    this.chromium = BrowserType.from(initializer.chromium);
    this.chromium._playwright = this;
    /*
    this.firefox = BrowserType.from(initializer.firefox);
    this.firefox._playwright = this;
    this.webkit = BrowserType.from(initializer.webkit);
    this.webkit._playwright = this;
    this._android = Android.from(initializer.android);
    this._electron = Electron.from(initializer.electron); */

    this.devices = this._connection.localUtils()?.devices ?? {};
    this.selectors = new Selectors();
    this.errors = { TimeoutError };

    const selectorsOwner = SelectorsOwner.from(initializer.selectors);
    this.selectors._addChannel(selectorsOwner);
    this._connection.on('close', () => {
      this.selectors._removeChannel(selectorsOwner);
    });
    (global as any)._playwrightInstance = this;
  }

  _setSelectors(selectors: Selectors) {
    const selectorsOwner = SelectorsOwner.from(this._initializer.selectors);
    this.selectors._removeChannel(selectorsOwner);
    this.selectors = selectors;
    this.selectors._addChannel(selectorsOwner);
  }

  static from(channel: channels.PlaywrightChannel): Playwright {
    return (channel as any)._object;
  }
}
