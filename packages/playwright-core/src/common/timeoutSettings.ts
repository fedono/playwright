import { debugMode } from '../utils';

export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_LAUNCH_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export class TimeoutSettings {
  private _parent: TimeoutSettings | undefined;
  private _defaultTimeout: number | undefined;
  private _defaultNavigationTimeout: number | undefined;

  constructor(parent?: TimeoutSettings) {
    this._parent = parent;
  }

  setDefaultTimeout(timeout: number | undefined) {
    this._defaultTimeout = timeout;
  }

  setDefaultNavigationTimeout(timeout: number | undefined) {
    this._defaultNavigationTimeout = timeout;
  }

  defaultNavigationTimeout() {
    return this._defaultNavigationTimeout;
  }

  defaultTimeout() {
    return this._defaultTimeout;
  }

  navigationTimeout(options: { timeout?: number }): number {
    if (typeof options.timeout === 'number')
      return options.timeout;
    if (this._defaultNavigationTimeout !== undefined)
      return this._defaultNavigationTimeout;
    if (debugMode())
      return 0;
    if (this._defaultTimeout !== undefined)
      return this._defaultTimeout;
    if (this._parent)
      return this._parent.navigationTimeout(options);
    return DEFAULT_TIMEOUT;
  }

  timeout(options: { timeout?: number }): number {
    if (typeof options.timeout === 'number')
      return options.timeout;
    if (debugMode())
      return 0;
    if (this._defaultTimeout !== undefined)
      return this._defaultTimeout;
    if (this._parent)
      return this._parent.timeout(options);
    return DEFAULT_TIMEOUT;
  }

  static timeout(options: { timeout?: number }): number {
    if (typeof options.timeout === 'number')
      return options.timeout;
    if (debugMode())
      return 0;
    return DEFAULT_TIMEOUT;
  }

  static launchTimeout(options: { timeout?: number }): number {
    if (typeof options.timeout === 'number')
      return options.timeout;
    if (debugMode())
      return 0;
    return DEFAULT_LAUNCH_TIMEOUT;
  }
}
