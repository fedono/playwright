import type * as channels from '@protocol/channels';
import { Dispatcher } from './dispatcher';
import type * as stream from 'stream';
import { ManualPromise, createGuid } from '../../utils';
import type { ArtifactDispatcher } from './artifactDispatcher';

export class StreamDispatcher extends Dispatcher<{ guid: string, stream: stream.Readable }, channels.StreamChannel, ArtifactDispatcher> implements channels.StreamChannel {
  _type_Stream = true;
  private _ended: boolean = false;

  constructor(scope: ArtifactDispatcher, stream: stream.Readable) {
    super(scope, { guid: 'stream@' + createGuid(), stream }, 'Stream', {});
    // In Node v12.9.0+ we can use readableEnded.
    stream.once('end', () => this._ended =  true);
    stream.once('error', () => this._ended =  true);
  }

  async read(params: channels.StreamReadParams): Promise<channels.StreamReadResult> {
    const stream = this._object.stream;
    if (this._ended)
      return { binary: Buffer.from('') };
    if (!stream.readableLength) {
      const readyPromise = new ManualPromise<void>();
      const done = () => readyPromise.resolve();
      stream.on('readable', done);
      stream.on('end', done);
      stream.on('error', done);
      await readyPromise;
      stream.off('readable', done);
      stream.off('end', done);
      stream.off('error', done);
    }
    const buffer = stream.read(Math.min(stream.readableLength, params.size || stream.readableLength));
    return { binary: buffer || Buffer.from('') };
  }

  async close() {
    this._object.stream.destroy();
  }
}
