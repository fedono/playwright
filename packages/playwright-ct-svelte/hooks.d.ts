import type { ComponentConstructorOptions, SvelteComponent } from 'svelte';
import type { JsonObject } from '@playwright/experimental-ct-core/types/component';

export declare function beforeMount<HooksConfig extends JsonObject>(
  callback: (params: {
    hooksConfig?: HooksConfig,
    App: new (options: Partial<ComponentConstructorOptions>) => SvelteComponent
  }) => Promise<SvelteComponent | void>
): void;
export declare function afterMount<HooksConfig extends JsonObject>(
  callback: (params: {
    hooksConfig?: HooksConfig;
    svelteComponent: SvelteComponent;
  }) => Promise<void>
): void;
