import { Writable } from 'stream';
import type * as channels from '@protocol/channels';
import { ChannelOwner } from './channelOwner';

export class WritableStream extends ChannelOwner<channels.WritableStreamChannel> {
  static from(Stream: channels.WritableStreamChannel): WritableStream {
    return (Stream as any)._object;
  }

  constructor(parent: ChannelOwner, type: string, guid: string, initializer: channels.WritableStreamInitializer) {
    super(parent, type, guid, initializer);
  }

  stream(): Writable {
    return new WritableStreamImpl(this._channel);
  }
}

class WritableStreamImpl extends Writable {
  private _channel: channels.WritableStreamChannel;

  constructor(channel: channels.WritableStreamChannel) {
    super();
    this._channel = channel;
  }

  override async _write(chunk: Buffer | string, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    const error = await this._channel.write({ binary: typeof chunk === 'string' ? Buffer.from(chunk) : chunk }).catch(e => e);
    callback(error || null);
  }

  override async _final(callback: (error?: Error | null) => void) {
    // Stream might be destroyed after the connection was closed.
    const error = await this._channel.close().catch(e => e);
    callback(error || null);
  }
}
