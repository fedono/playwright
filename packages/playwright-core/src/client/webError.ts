import type * as api from '../../types/types';
import type { Page } from './page';

export class WebError implements api.WebError {
  private _page: Page | null;
  private _error: Error;

  constructor(page: Page | null, error: Error) {
    this._page = page;
    this._error = error;
  }

  page() {
    return this._page;
  }

  error() {
    return this._error;
  }
}
