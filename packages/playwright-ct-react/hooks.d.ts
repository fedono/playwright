import type { JsonObject } from '@playwright/experimental-ct-core/types/component';

export declare function beforeMount<HooksConfig extends JsonObject>(
  callback: (params: { hooksConfig?: HooksConfig; App: () => JSX.Element }) => Promise<void | JSX.Element>
): void;
export declare function afterMount<HooksConfig extends JsonObject>(
  callback: (params: { hooksConfig?: HooksConfig }) => Promise<void>
): void;
