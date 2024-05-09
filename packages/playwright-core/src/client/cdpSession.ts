import type * as channels from '@protocol/channels';
import { ChannelOwner } from './channelOwner';
import type { Protocol } from '../server/chromium/protocol';
import type * as api from '../../types/types';

/*
 imp cdp session 也是可以发送 cdp 指令的，和每个 page 一一对应
 每个 chrome 启动，都会建立一个 websocket，也可以使用这个端口和浏览器发送 CDP 指令
 websocket 只针对 chrome，session 接受发送消息是每一个浏览器想使用 CDP 的规范
 - https://github.com/aslushnikov/getting-started-with-cdp
*/
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
