import type * as channels from '@protocol/channels';
import * as fs from 'fs';
import { Stream } from './stream';
import { mkdirIfNeeded } from '../utils/fileUtils';
import { ChannelOwner } from './channelOwner';
import type { Readable } from 'stream';

export class Artifact extends ChannelOwner<channels.ArtifactChannel> {
  static from(channel: channels.ArtifactChannel): Artifact {
    return (channel as any)._object;
  }

  async pathAfterFinished(): Promise<string> {
    if (this._connection.isRemote())
      throw new Error(`Path is not available when connecting remotely. Use saveAs() to save a local copy.`);
    return (await this._channel.pathAfterFinished()).value;
  }

  async saveAs(path: string): Promise<void> {
    if (!this._connection.isRemote()) {
      await this._channel.saveAs({ path });
      return;
    }

    const result = await this._channel.saveAsStream();
    const stream = Stream.from(result.stream);
    await mkdirIfNeeded(path);
    await new Promise((resolve, reject) => {
      stream.stream().pipe(fs.createWriteStream(path))
          .on('finish' as any, resolve)
          .on('error' as any, reject);
    });
  }

  async failure(): Promise<string | null> {
    return (await this._channel.failure()).error || null;
  }

  async createReadStream(): Promise<Readable> {
    const result = await this._channel.stream();
    const stream = Stream.from(result.stream);
    return stream.stream();
  }

  async readIntoBuffer(): Promise<Buffer> {
    const stream = (await this.createReadStream())!;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      stream.on('error', reject);
    });
  }

  async cancel(): Promise<void> {
    return this._channel.cancel();
  }

  async delete(): Promise<void> {
    return this._channel.delete();
  }
}
