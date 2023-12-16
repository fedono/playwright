import { start } from '../../packages/playwright-core/lib/outofprocess';
import type { Playwright } from '../../packages/playwright-core/lib/client/playwright';

export type TestModeName = 'default' | 'driver' | 'service' | 'service2';

interface TestMode {
  setup(): Promise<Playwright>;
  teardown(): Promise<void>;
}

export class DriverTestMode implements TestMode {
  private _impl: { playwright: Playwright; stop: () => Promise<void>; };

  async setup() {
    this._impl = await start({
      NODE_OPTIONS: undefined,  // Hide driver process while debugging.
    });
    return this._impl.playwright;
  }

  async teardown() {
    await this._impl.stop();
  }
}

export class DefaultTestMode implements TestMode {
  async setup() {
    return require('playwright-core');
  }

  async teardown() {
  }
}
