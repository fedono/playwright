import type * as channels from '@protocol/channels';
import { Dispatcher } from './dispatcher';
import * as fs from 'fs';
import { createGuid } from '../../utils';
import type { BrowserContextDispatcher } from './browserContextDispatcher';

export class WritableStreamDispatcher extends Dispatcher<{ guid: string, stream: fs.WriteStream }, channels.WritableStreamChannel, BrowserContextDispatcher> implements channels.WritableStreamChannel {
  _type_WritableStream = true;
  private _lastModifiedMs: number | undefined;

  constructor(scope: BrowserContextDispatcher, stream: fs.WriteStream, lastModifiedMs?: number) {
    super(scope, { guid: 'writableStream@' + createGuid(), stream }, 'WritableStream', {});
    this._lastModifiedMs = lastModifiedMs;
  }

  async write(params: channels.WritableStreamWriteParams): Promise<channels.WritableStreamWriteResult> {
    const stream = this._object.stream;
    await new Promise<void>((fulfill, reject) => {
      stream.write(params.binary, error => {
        if (error)
          reject(error);
        else
          fulfill();
      });
    });
  }

  async close() {
    const stream = this._object.stream;
    await new Promise<void>(fulfill => stream.end(fulfill));
    if (this._lastModifiedMs)
      await fs.promises.utimes(this.path(), new Date(this._lastModifiedMs), new Date(this._lastModifiedMs));
  }

  path(): string {
    return this._object.stream.path as string;
  }
}
