import type { Dialog } from '../dialog';
import type * as channels from '@protocol/channels';
import { Dispatcher } from './dispatcher';
import { PageDispatcher } from './pageDispatcher';
import type { BrowserContextDispatcher } from './browserContextDispatcher';

export class DialogDispatcher extends Dispatcher<Dialog, channels.DialogChannel, BrowserContextDispatcher | PageDispatcher> implements channels.DialogChannel {
  _type_Dialog = true;

  constructor(scope: BrowserContextDispatcher, dialog: Dialog) {
    const page = PageDispatcher.fromNullable(scope, dialog.page().initializedOrUndefined());
    // Prefer scoping to the page, unless we don't have one.
    super(page || scope, dialog, 'Dialog', {
      page,
      type: dialog.type(),
      message: dialog.message(),
      defaultValue: dialog.defaultValue(),
    });
  }

  async accept(params: { promptText?: string }): Promise<void> {
    await this._object.accept(params.promptText);
  }

  async dismiss(): Promise<void> {
    await this._object.dismiss();
  }
}
