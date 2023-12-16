import { evaluationScript } from './clientHelper';
import type * as channels from '@protocol/channels';
import { ChannelOwner } from './channelOwner';
import type { SelectorEngine } from './types';
import type * as api from '../../types/types';
import { setTestIdAttribute, testIdAttributeName } from './locator';

export class Selectors implements api.Selectors {
  private _channels = new Set<SelectorsOwner>();
  private _registrations: channels.SelectorsRegisterParams[] = [];

  async register(name: string, script: string | (() => SelectorEngine) | { path?: string, content?: string }, options: { contentScript?: boolean } = {}): Promise<void> {
    const source = await evaluationScript(script, undefined, false);
    const params = { ...options, name, source };
    for (const channel of this._channels)
      await channel._channel.register(params);
    this._registrations.push(params);
  }

  setTestIdAttribute(attributeName: string) {
    setTestIdAttribute(attributeName);
    for (const channel of this._channels)
      channel._channel.setTestIdAttributeName({ testIdAttributeName: attributeName }).catch(() => {});
  }

  _addChannel(channel: SelectorsOwner) {
    this._channels.add(channel);
    for (const params of this._registrations) {
      // This should not fail except for connection closure, but just in case we catch.
      channel._channel.register(params).catch(() => {});
      channel._channel.setTestIdAttributeName({ testIdAttributeName: testIdAttributeName() }).catch(() => {});
    }
  }

  _removeChannel(channel: SelectorsOwner) {
    this._channels.delete(channel);
  }
}

export class SelectorsOwner extends ChannelOwner<channels.SelectorsChannel> {
  static from(browser: channels.SelectorsChannel): SelectorsOwner {
    return (browser as any)._object;
  }
}
