import type {
  TestType,
  PlaywrightTestArgs,
  PlaywrightTestConfig as BasePlaywrightTestConfig,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  Locator,
} from 'playwright/test';
import type { JsonObject } from '@playwright/experimental-ct-core/types/component';
import type { InlineConfig } from 'vite';
import type { SvelteComponent, ComponentProps } from 'svelte/types/runtime';

export type PlaywrightTestConfig<T = {}, W = {}> = Omit<BasePlaywrightTestConfig<T, W>, 'use'> & {
  use?: BasePlaywrightTestConfig<T, W>['use'] & {
    ctPort?: number;
    ctTemplateDir?: string;
    ctCacheDir?: string;
    ctViteConfig?: InlineConfig | (() => Promise<InlineConfig>);
  };
};

type ComponentSlot = string | string[];
type ComponentSlots = Record<string, ComponentSlot> & { default?: ComponentSlot };
type ComponentEvents = Record<string, Function>;

export interface MountOptions<HooksConfig extends JsonObject, Component extends SvelteComponent> {
  props?: ComponentProps<Component>;
  slots?: ComponentSlots;
  on?: ComponentEvents;
  hooksConfig?: HooksConfig;
}

interface MountResult<Component extends SvelteComponent> extends Locator {
  unmount(): Promise<void>;
  update(options: {
    props?: Partial<ComponentProps<Component>>;
    on?: Partial<ComponentEvents>;
  }): Promise<void>;
}

interface ComponentFixtures {
  mount<HooksConfig extends JsonObject, Component extends SvelteComponent = SvelteComponent>(
    component: new (...args: any[]) => Component,
    options?: MountOptions<HooksConfig, Component>
  ): Promise<MountResult<Component>>;
}

export const test: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions & ComponentFixtures,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

export function defineConfig(config: PlaywrightTestConfig): PlaywrightTestConfig;
export function defineConfig<T>(config: PlaywrightTestConfig<T>): PlaywrightTestConfig<T>;
export function defineConfig<T, W>(config: PlaywrightTestConfig<T, W>): PlaywrightTestConfig<T, W>;

export { expect, devices } from 'playwright/test';
