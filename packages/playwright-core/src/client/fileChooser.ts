import type { ElementHandle } from './elementHandle';
import type { Page } from './page';
import type { FilePayload } from './types';
import type * as channels from '@protocol/channels';
import type * as api from '../../types/types';

// imp 选择文件
export class FileChooser implements api.FileChooser {
  private _page: Page;
  private _elementHandle: ElementHandle<Node>;
  private _isMultiple: boolean;

  constructor(page: Page, elementHandle: ElementHandle, isMultiple: boolean) {
    this._page = page;
    this._elementHandle = elementHandle;
    this._isMultiple = isMultiple;
  }

  element(): ElementHandle {
    return this._elementHandle;
  }

  isMultiple(): boolean {
    return this._isMultiple;
  }

  page(): Page {
    return this._page;
  }

  async setFiles(files: string | FilePayload | string[] | FilePayload[], options?: channels.ElementHandleSetInputFilesOptions) {
    return this._elementHandle.setInputFiles(files, options);
  }
}
