import * as util from 'util';
import { JSHandle } from './jsHandle';
import type * as channels from '@protocol/channels';
import type * as api from '../../types/types';
import { Page } from './page';

type ConsoleMessageLocation = channels.BrowserContextConsoleEvent['location'];

export class ConsoleMessage implements api.ConsoleMessage {

  private _page: Page | null;
  private _event: channels.BrowserContextConsoleEvent;

  constructor(event: channels.BrowserContextConsoleEvent) {
    this._page = event.page ? Page.from(event.page) : null;
    this._event = event;
  }

  page() {
    return this._page;
  }

  type(): string {
    return this._event.type;
  }

  text(): string {
    return this._event.text;
  }

  args(): JSHandle[] {
    return this._event.args.map(JSHandle.from);
  }

  location(): ConsoleMessageLocation {
    return this._event.location;
  }

  [util.inspect.custom]() {
    return this.text();
  }
}
