import { yauzl } from '../zipBundle';
import type { UnzipFile, Entry } from '../zipBundle';

export class ZipFile {
  private _fileName: string;
  private _zipFile: UnzipFile | undefined;
  private _entries = new Map<string, Entry>();
  private _openedPromise: Promise<void>;

  constructor(fileName: string) {
    this._fileName = fileName;
    this._openedPromise = this._open();
  }

  private async _open() {
    await new Promise<UnzipFile>((fulfill, reject) => {
      yauzl.open(this._fileName, { autoClose: false }, (e, z) => {
        if (e) {
          reject(e);
          return;
        }
        this._zipFile = z;
        this._zipFile!.on('entry', (entry: Entry) => {
          this._entries.set(entry.fileName, entry);
        });
        this._zipFile!.on('end', fulfill);
      });
    });
  }

  async entries(): Promise<string[]> {
    await this._openedPromise;
    return [...this._entries.keys()];
  }

  async read(entryPath: string): Promise<Buffer> {
    await this._openedPromise;
    const entry = this._entries.get(entryPath)!;
    if (!entry)
      throw new Error(`${entryPath} not found in file ${this._fileName}`);

    return new Promise((resolve, reject) => {
      this._zipFile!.openReadStream(entry, (error, readStream) => {
        if (error || !readStream) {
          reject(error || 'Entry not found');
          return;
        }

        const buffers: Buffer[] = [];
        readStream.on('data', data => buffers.push(data));
        readStream.on('end', () => resolve(Buffer.concat(buffers)));
      });
    });
  }

  close() {
    this._zipFile?.close();
  }
}
