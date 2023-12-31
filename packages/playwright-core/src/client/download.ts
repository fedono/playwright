import type { Readable } from 'stream';
import type * as api from '../../types/types';
import type { Artifact } from './artifact';
import type { Page } from './page';

export class Download implements api.Download {
  private _page: Page;
  private _url: string;
  private _suggestedFilename: string;
  private _artifact: Artifact;

  constructor(page: Page, url: string, suggestedFilename: string, artifact: Artifact) {
    this._page = page;
    this._url = url;
    this._suggestedFilename = suggestedFilename;
    this._artifact = artifact;
  }

  page(): Page {
    return this._page;
  }

  url(): string {
    return this._url;
  }

  suggestedFilename(): string {
    return this._suggestedFilename;
  }

  async path(): Promise<string> {
    return this._artifact.pathAfterFinished();
  }

  async saveAs(path: string): Promise<void> {
    return this._artifact.saveAs(path);
  }

  async failure(): Promise<string | null> {
    return this._artifact.failure();
  }

  async createReadStream(): Promise<Readable> {
    return this._artifact.createReadStream();
  }

  async cancel(): Promise<void> {
    return this._artifact.cancel();
  }

  async delete(): Promise<void> {
    return this._artifact.delete();
  }
}
