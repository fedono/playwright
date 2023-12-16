import type { TestType } from '@playwright/test';
import type { PlatformWorkerFixtures } from '../config/platformFixtures';
import type { TestModeTestFixtures, TestModeWorkerFixtures, TestModeWorkerOptions } from '../config/testModeFixtures';
import { androidTest } from '../android/androidTest';
import { browserTest } from '../config/browserTest';
import { electronTest } from '../electron/electronTest';
import { webView2Test } from '../webview2/webView2Test';
import type { PageTestFixtures, PageWorkerFixtures } from './pageTestApi';
import type { ServerFixtures, ServerWorkerOptions } from '../config/serverFixtures';
export { expect } from '@playwright/test';

let impl: TestType<PageTestFixtures & ServerFixtures & TestModeTestFixtures, PageWorkerFixtures & PlatformWorkerFixtures & TestModeWorkerFixtures & TestModeWorkerOptions & ServerWorkerOptions> = browserTest;

if (process.env.PWPAGE_IMPL === 'android')
  impl = androidTest;
if (process.env.PWPAGE_IMPL === 'electron')
  impl = electronTest;
if (process.env.PWPAGE_IMPL === 'webview2')
  impl = webView2Test;

export const test = impl;
