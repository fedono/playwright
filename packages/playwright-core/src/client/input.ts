import type * as channels from '@protocol/channels';
import type * as api from '../../types/types';
import type { Page } from './page';

export class Keyboard implements api.Keyboard {
  private _page: Page;

  constructor(page: Page) {
    this._page = page;
  }

  async down(key: string) {
    await this._page._channel.keyboardDown({ key });
  }

  async up(key: string) {
    await this._page._channel.keyboardUp({ key });
  }

  async insertText(text: string) {
    await this._page._channel.keyboardInsertText({ text });
  }

  async type(text: string, options: channels.PageKeyboardTypeOptions = {}) {
    await this._page._channel.keyboardType({ text, ...options });
  }

  async press(key: string, options: channels.PageKeyboardPressOptions = {}) {
    await this._page._channel.keyboardPress({ key, ...options });
  }
}
// imp 用户行为 mouse 模拟 move / down / up / click / dblclick / wheel
export class Mouse implements api.Mouse {
  private _page: Page;

  constructor(page: Page) {
    this._page = page;
  }

  async move(x: number, y: number, options: { steps?: number } = {}) {
    await this._page._channel.mouseMove({ x, y, ...options });
  }

  async down(options: channels.PageMouseDownOptions = {}) {
    await this._page._channel.mouseDown({ ...options });
  }

  async up(options: channels.PageMouseUpOptions = {}) {
    await this._page._channel.mouseUp(options);
  }

  async click(x: number, y: number, options: channels.PageMouseClickOptions = {}) {
    await this._page._channel.mouseClick({ x, y, ...options });
  }

  async dblclick(x: number, y: number, options: Omit<channels.PageMouseClickOptions, 'clickCount'> = {}) {
    await this.click(x, y, { ...options, clickCount: 2 });
  }

  async wheel(deltaX: number, deltaY: number) {
    await this._page._channel.mouseWheel({ deltaX, deltaY });
  }
}

export class Touchscreen implements api.Touchscreen {
  private _page: Page;

  constructor(page: Page) {
    this._page = page;
  }

  async tap(x: number, y: number) {
    await this._page._channel.touchscreenTap({ x, y });
  }
}
