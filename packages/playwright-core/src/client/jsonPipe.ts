import type * as channels from '@protocol/channels';
import { ChannelOwner } from './channelOwner';

export class JsonPipe extends ChannelOwner<channels.JsonPipeChannel> {
  static from(jsonPipe: channels.JsonPipeChannel): JsonPipe {
    return (jsonPipe as any)._object;
  }

  constructor(parent: ChannelOwner, type: string, guid: string, initializer: channels.JsonPipeInitializer) {
    super(parent, type, guid, initializer);
  }

  channel() {
    return this._channel;
  }
}
