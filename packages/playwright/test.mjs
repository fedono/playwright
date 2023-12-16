import playwright from './test.js';

export const chromium = playwright.chromium;
export const firefox = playwright.firefox;
export const webkit = playwright.webkit;
export const selectors = playwright.selectors;
export const devices = playwright.devices;
export const errors = playwright.errors;
export const request = playwright.request;
export const _electron = playwright._electron;
export const _android = playwright._android;
export const test = playwright.test;
export const expect = playwright.expect;
export const defineConfig = playwright.defineConfig;
export const mergeTests = playwright.mergeTests;
export const mergeExpects = playwright.mergeExpects;
export default playwright.test;
