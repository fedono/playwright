import type * as channels from '@protocol/channels';
import { ChannelOwner } from './channelOwner';
import type { Protocol } from '../server/chromium/protocol';
import type * as api from '../../types/types';

//
export class CDPSession extends ChannelOwner<channels.CDPSessionChannel> implements api.CDPSession {
  static from(cdpSession: channels.CDPSessionChannel): CDPSession {
    return (cdpSession as any)._object;
  }

  constructor(parent: ChannelOwner, type: string, guid: string, initializer: channels.CDPSessionInitializer) {
    super(parent, type, guid, initializer);

    this._channel.on('event', ({ method, params }) => {
      this.emit(method, params);
    });

    this.on = super.on;
    this.addListener = super.addListener;
    this.off = super.removeListener;
    this.removeListener = super.removeListener;
    this.once = super.once;
  }

  async send<T extends keyof Protocol.CommandParameters>(
    method: T,
    params?: Protocol.CommandParameters[T]
  ): Promise<Protocol.CommandReturnValues[T]> {
    const result = await this._channel.send({ method, params });
    return result.result as Protocol.CommandReturnValues[T];
  }

  async detach() {
    return this._channel.detach();
  }
}
