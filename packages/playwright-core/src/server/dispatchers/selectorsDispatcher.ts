import type { RootDispatcher } from './dispatcher';
import { Dispatcher } from './dispatcher';
import type * as channels from '@protocol/channels';
import type { Selectors } from '../selectors';

export class SelectorsDispatcher extends Dispatcher<Selectors, channels.SelectorsChannel, RootDispatcher> implements channels.SelectorsChannel {
  _type_Selectors = true;

  constructor(scope: RootDispatcher, selectors: Selectors) {
    super(scope, selectors, 'Selectors', {});
  }

  async register(params: channels.SelectorsRegisterParams): Promise<void> {
    await this._object.register(params.name, params.source, params.contentScript);
  }

  async setTestIdAttributeName(params: channels.SelectorsSetTestIdAttributeNameParams): Promise<void> {
    this._object.setTestIdAttributeName(params.testIdAttributeName);
  }
}
