import type * as channels from '@protocol/channels';
import { Dispatcher } from './dispatcher';
import { createGuid } from '../../utils';
import { serializeError } from '../errors';
import type { LocalUtilsDispatcher } from './localUtilsDispatcher';

export class JsonPipeDispatcher extends Dispatcher<{ guid: string }, channels.JsonPipeChannel, LocalUtilsDispatcher> implements channels.JsonPipeChannel {
  _type_JsonPipe = true;
  constructor(scope: LocalUtilsDispatcher) {
    super(scope, { guid: 'jsonPipe@' + createGuid() }, 'JsonPipe', {});
  }

  async send(params: channels.JsonPipeSendParams): Promise<channels.JsonPipeSendResult> {
    this.emit('message', params.message);
  }

  async close(): Promise<void> {
    this.emit('close');
    if (!this._disposed) {
      this._dispatchEvent('closed', {});
      this._dispose();
    }
  }

  dispatch(message: Object) {
    if (!this._disposed)
      this._dispatchEvent('message', { message });
  }

  wasClosed(error?: Error): void {
    if (!this._disposed) {
      const params = error ? { error: serializeError(error) } : {};
      this._dispatchEvent('closed', params);
      this._dispose();
    }
  }

  dispose() {
    this._dispose();
  }
}
