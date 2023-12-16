import { CDPSession } from '../chromium/crConnection';
import type * as channels from '@protocol/channels';
import { Dispatcher } from './dispatcher';
import type { BrowserDispatcher } from './browserDispatcher';
import type { BrowserContextDispatcher } from './browserContextDispatcher';

export class CDPSessionDispatcher extends Dispatcher<CDPSession, channels.CDPSessionChannel, BrowserDispatcher | BrowserContextDispatcher> implements channels.CDPSessionChannel {
  _type_CDPSession = true;

  constructor(scope: BrowserDispatcher | BrowserContextDispatcher, cdpSession: CDPSession) {
    super(scope, cdpSession, 'CDPSession', {});
    this.addObjectListener(CDPSession.Events.Event, ({ method, params }) => this._dispatchEvent('event', { method, params }));
    this.addObjectListener(CDPSession.Events.Closed, () => this._dispose());
  }

  async send(params: channels.CDPSessionSendParams): Promise<channels.CDPSessionSendResult> {
    return { result: await this._object.send(params.method as any, params.params) };
  }

  async detach(): Promise<void> {
    return this._object.detach();
  }
}
