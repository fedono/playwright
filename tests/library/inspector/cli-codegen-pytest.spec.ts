import fs from 'fs';
import path from 'path';
import { test, expect } from './inspectorTest';

const emptyHTML = new URL('file://' + path.join(__dirname, '..', '..', 'assets', 'empty.html')).toString();

test('should print the correct imports and context options', async ({ runCLI }) => {
  const cli = runCLI(['--target=python-pytest', emptyHTML]);
  const expectedResult = `from playwright.sync_api import Page, expect


def test_example(page: Page) -> None:`;
  await cli.waitFor(expectedResult);
});

test('should print the correct context options when using a device and lang', async ({ browserName, runCLI }, testInfo) => {
  test.skip(browserName !== 'webkit');

  const tmpFile = testInfo.outputPath('script.js');
  const cli = runCLI(['--target=python-pytest', '--device=iPhone 11', '--lang=en-US', '--output', tmpFile, emptyHTML], {
    autoExitWhen: 'page.goto',
  });
  await cli.waitForCleanExit();
  const content = fs.readFileSync(tmpFile);
  expect(content.toString()).toBe(`import pytest

from playwright.sync_api import Page, expect


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, playwright):
    return {**playwright.devices["iPhone 11"], "locale": "en-US"}


def test_example(page: Page) -> None:
    page.goto("${emptyHTML}")
`);
});

test('should save the codegen output to a file if specified', async ({ runCLI }, testInfo) => {
  const tmpFile = testInfo.outputPath('test_example.py');
  const cli = runCLI(['--target=python-pytest', '--output', tmpFile, emptyHTML], {
    autoExitWhen: 'page.goto',
  });
  await cli.waitForCleanExit();
  const content = fs.readFileSync(tmpFile);
  expect(content.toString()).toBe(`from playwright.sync_api import Page, expect


def test_example(page: Page) -> None:
    page.goto("${emptyHTML}")
`);
});
