import { JSXElement } from "solid-js";
import type { JsonObject } from '@playwright/experimental-ct-core/types/component';

export declare function beforeMount<HooksConfig extends JsonObject>(
  callback: (params: { hooksConfig?: HooksConfig, App: () => JSXElement }) => Promise<void | JSXElement>
): void;
export declare function afterMount<HooksConfig extends JsonObject>(
  callback: (params: { hooksConfig?: HooksConfig }) => Promise<void>
): void;
