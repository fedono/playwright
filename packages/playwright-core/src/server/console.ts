import { SdkObject } from './instrumentation';
import type * as js from './javascript';
import type { ConsoleMessageLocation } from './types';
import type { Page } from './page';

export class ConsoleMessage extends SdkObject {
  private _type: string;
  private _text?: string;
  private _args: js.JSHandle[];
  private _location: ConsoleMessageLocation;
  private _page: Page;

  constructor(page: Page, type: string, text: string | undefined, args: js.JSHandle[], location?: ConsoleMessageLocation) {
    super(page, 'console-message');
    this._page = page;
    this._type = type;
    this._text = text;
    this._args = args;
    this._location = location || { url: '', lineNumber: 0, columnNumber: 0 };
  }

  page() {
    return this._page;
  }

  type(): string {
    return this._type;
  }

  text(): string {
    if (this._text === undefined)
      this._text = this._args.map(arg => arg.preview()).join(' ');
    return this._text;
  }

  args(): js.JSHandle[] {
    return this._args;
  }

  location(): ConsoleMessageLocation {
    return this._location;
  }
}
