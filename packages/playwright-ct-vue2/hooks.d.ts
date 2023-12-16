import { ComponentOptions } from 'vue';
import { CombinedVueInstance, Vue, VueConstructor } from 'vue/types/vue';
import type { JsonObject } from '@playwright/experimental-ct-core/types/component';

export declare function beforeMount<HooksConfig extends JsonObject>(
  callback: (params: {
    hooksConfig?: HooksConfig,
    Vue: VueConstructor<Vue>,
  }) => Promise<void | ComponentOptions<Vue> & Record<string, unknown>>
): void;
export declare function afterMount<HooksConfig extends JsonObject>(
  callback: (params: {
    hooksConfig?: HooksConfig;
    instance: CombinedVueInstance<
      Vue,
      object,
      object,
      object,
      Record<never, any>
    >;
  }) => Promise<void>
): void;
