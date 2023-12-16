import { assert } from '../utils';
import type { Page } from './page';
import { SdkObject } from './instrumentation';

type OnHandle = (accept: boolean, promptText?: string) => Promise<void>;

export type DialogType = 'alert' | 'beforeunload' | 'confirm' | 'prompt';

export class Dialog extends SdkObject {
  private _page: Page;
  private _type: DialogType;
  private _message: string;
  private _onHandle: OnHandle;
  private _handled = false;
  private _defaultValue: string;

  constructor(page: Page, type: DialogType, message: string, onHandle: OnHandle, defaultValue?: string) {
    super(page, 'dialog');
    this._page = page;
    this._type = type;
    this._message = message;
    this._onHandle = onHandle;
    this._defaultValue = defaultValue || '';
    this._page._frameManager.dialogDidOpen(this);
  }

  page() {
    return this._page;
  }

  type(): string {
    return this._type;
  }

  message(): string {
    return this._message;
  }

  defaultValue(): string {
    return this._defaultValue;
  }

  async accept(promptText?: string) {
    assert(!this._handled, 'Cannot accept dialog which is already handled!');
    this._handled = true;
    this._page._frameManager.dialogWillClose(this);
    await this._onHandle(true, promptText);
  }

  async dismiss() {
    assert(!this._handled, 'Cannot dismiss dialog which is already handled!');
    this._handled = true;
    this._page._frameManager.dialogWillClose(this);
    await this._onHandle(false);
  }

  async close() {
    if (this._type === 'beforeunload')
      await this.accept();
    else
      await this.dismiss();
  }
}
