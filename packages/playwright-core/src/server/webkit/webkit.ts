import { WKBrowser } from '../webkit/wkBrowser';
import type { Env } from '../../utils/processLauncher';
import path from 'path';
import { kBrowserCloseMessageId } from './wkConnection';
import { BrowserType, kNoXServerRunningError } from '../browserType';
import type { ConnectionTransport } from '../transport';
import type { BrowserOptions } from '../browser';
import type * as types from '../types';
import { wrapInASCIIBox } from '../../utils';
import type { SdkObject } from '../instrumentation';
import type { ProtocolError } from '../protocolError';

export class WebKit extends BrowserType {
  constructor(parent: SdkObject) {
    super(parent, 'webkit');
  }

  _connectToTransport(transport: ConnectionTransport, options: BrowserOptions): Promise<WKBrowser> {
    return WKBrowser.connect(this.attribution.playwright, transport, options);
  }

  _amendEnvironment(env: Env, userDataDir: string, executable: string, browserArguments: string[]): Env {
    return { ...env, CURL_COOKIE_JAR_PATH: path.join(userDataDir, 'cookiejar.db') };
  }

  _doRewriteStartupLog(error: ProtocolError): ProtocolError {
    if (!error.logs)
      return error;
    if (error.logs.includes('cannot open display'))
      error.logs = '\n' + wrapInASCIIBox(kNoXServerRunningError, 1);
    return error;
  }

  _attemptToGracefullyCloseBrowser(transport: ConnectionTransport): void {
    transport.send({ method: 'Playwright.close', params: {}, id: kBrowserCloseMessageId });
  }

  _defaultArgs(options: types.LaunchOptions, isPersistent: boolean, userDataDir: string): string[] {
    const { args = [], proxy, headless } = options;
    const userDataDirArg = args.find(arg => arg.startsWith('--user-data-dir'));
    if (userDataDirArg)
      throw this._createUserDataDirArgMisuseError('--user-data-dir');
    if (args.find(arg => !arg.startsWith('-')))
      throw new Error('Arguments can not specify page to be opened');
    const webkitArguments = ['--inspector-pipe'];
    if (process.platform === 'win32')
      webkitArguments.push('--disable-accelerated-compositing');
    if (headless)
      webkitArguments.push('--headless');
    if (isPersistent)
      webkitArguments.push(`--user-data-dir=${userDataDir}`);
    else
      webkitArguments.push(`--no-startup-window`);
    if (proxy) {
      if (process.platform === 'darwin') {
        webkitArguments.push(`--proxy=${proxy.server}`);
        if (proxy.bypass)
          webkitArguments.push(`--proxy-bypass-list=${proxy.bypass}`);
      } else if (process.platform === 'linux') {
        webkitArguments.push(`--proxy=${proxy.server}`);
        if (proxy.bypass)
          webkitArguments.push(...proxy.bypass.split(',').map(t => `--ignore-host=${t}`));
      } else if (process.platform === 'win32') {
        // Enable socks5 hostname resolution on Windows. Workaround can be removed once fixed upstream.
        // See https://github.com/microsoft/playwright/issues/20451
        webkitArguments.push(`--curl-proxy=${proxy.server.replace(/^socks5:\/\//, 'socks5h://')}`);
        if (proxy.bypass)
          webkitArguments.push(`--curl-noproxy=${proxy.bypass}`);
      }
    }
    webkitArguments.push(...args);
    if (isPersistent)
      webkitArguments.push('about:blank');
    return webkitArguments;
  }
}
