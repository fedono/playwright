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

// Copied from: https://github.com/vuejs/language-tools/blob/master/packages/vue-component-type-helpers/index.d.ts#L10-L13
type ComponentProps<T> =
	T extends new () => { $props: infer P; } ? NonNullable<P> :
	T extends (props: infer P, ...args: any) => any ? P :
	{};

export interface MountOptions<HooksConfig extends JsonObject, Component> {
  props?: ComponentProps<Component>;
  slots?: ComponentSlots;
  on?: ComponentEvents;
  hooksConfig?: HooksConfig;
}

export interface MountOptionsJsx<HooksConfig extends JsonObject> {
  hooksConfig?: HooksConfig;
}

interface MountResult<Component> extends Locator {
  unmount(): Promise<void>;
  update(options: {
    props?: Partial<ComponentProps<Component>>;
    slots?: Partial<ComponentSlots>;
    on?: Partial<ComponentEvents>;
  }): Promise<void>;
}

interface MountResultJsx extends Locator {
  unmount(): Promise<void>;
  update(component: JSX.Element): Promise<void>;
}

export interface ComponentFixtures {
  mount<HooksConfig extends JsonObject>(
    component: JSX.Element,
    options: MountOptionsJsx<HooksConfig>
  ): Promise<MountResultJsx>;
  mount<HooksConfig extends JsonObject, Component = unknown>(
    component: Component,
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
