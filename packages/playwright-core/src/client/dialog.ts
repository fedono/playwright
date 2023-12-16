import type * as channels from '@protocol/channels';
import { ChannelOwner } from './channelOwner';
import type * as api from '../../types/types';
import { Page } from './page';

export class Dialog extends ChannelOwner<channels.DialogChannel> implements api.Dialog {
  static from(dialog: channels.DialogChannel): Dialog {
    return (dialog as any)._object;
  }

  private _page: Page | null;

  constructor(parent: ChannelOwner, type: string, guid: string, initializer: channels.DialogInitializer) {
    super(parent, type, guid, initializer);
    // Note: dialogs that open early during page initialization block it.
    // Therefore, we must report the dialog without a page to be able to handle it.
    this._page = Page.fromNullable(initializer.page);
  }

  page() {
    return this._page;
  }

  type(): string {
    return this._initializer.type;
  }

  message(): string {
    return this._initializer.message;
  }

  defaultValue(): string {
    return this._initializer.defaultValue;
  }

  async accept(promptText: string | undefined) {
    await this._channel.accept({ promptText });
  }

  async dismiss() {
    await this._channel.dismiss();
  }
}
