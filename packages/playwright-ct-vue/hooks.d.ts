import type { App, ComponentPublicInstance } from 'vue';
import type { JsonObject } from '@playwright/experimental-ct-core/types/component';

export declare function beforeMount<HooksConfig extends JsonObject>(
  callback: (params: { app: App; hooksConfig?: HooksConfig }) => Promise<void>
): void;
export declare function afterMount<HooksConfig extends JsonObject>(
  callback: (params: {
    app: App;
    hooksConfig?: HooksConfig;
    instance: ComponentPublicInstance;
  }) => Promise<void>
): void;
