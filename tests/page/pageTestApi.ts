import type { Page, ViewportSize } from 'playwright-core';
import type { PageScreenshotOptions, ScreenshotMode, VideoMode } from '@playwright/test';
export { expect } from '@playwright/test';

// Page test does not guarantee an isolated context, just a new page (because Android).
export type PageTestFixtures = {
  page: Page;
};

export type PageWorkerFixtures = {
  headless: boolean;
  channel: string;
  screenshot: ScreenshotMode | { mode: ScreenshotMode } & Pick<PageScreenshotOptions, 'fullPage' | 'omitBackground'>;
  trace: 'off' | 'on' | 'retain-on-failure' | 'on-first-retry' | 'on-all-retries' | /** deprecated */ 'retry-with-trace';
  video: VideoMode | { mode: VideoMode, size: ViewportSize };
  browserName: 'chromium' | 'firefox' | 'webkit';
  browserVersion: string;
  browserMajorVersion: number;
  isAndroid: boolean;
  isElectron: boolean;
  isWebView2: boolean;
};
