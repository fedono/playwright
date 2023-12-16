import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import { TestCaseView } from './testCaseView';
import type { TestCase, TestResult } from './types';

test.use({ viewport: { width: 800, height: 600 } });

const result: TestResult = {
  retry: 0,
  startTime: new Date(0).toUTCString(),
  duration: 100,
  errors: [],
  steps: [{
    title: 'Outer step',
    startTime: new Date(100).toUTCString(),
    duration: 10,
    location: { file: 'test.spec.ts', line: 62, column: 0 },
    count: 1,
    steps: [{
      title: 'Inner step',
      startTime: new Date(200).toUTCString(),
      duration: 10,
      location: { file: 'test.spec.ts', line: 82, column: 0 },
      steps: [],
      count: 1,
    }],
  }],
  attachments: [],
  status: 'passed',
};

const testCase: TestCase = {
  testId: 'testid',
  title: 'My test',
  path: [],
  projectName: 'chromium',
  location: { file: 'test.spec.ts', line: 42, column: 0 },
  annotations: [
    { type: 'annotation', description: 'Annotation text' },
    { type: 'annotation', description: 'Another annotation text' },
  ],
  outcome: 'expected',
  duration: 10,
  ok: true,
  results: [result]
};

test('should render test case', async ({ mount }) => {
  const component = await mount(<TestCaseView projectNames={['chromium', 'webkit']} test={testCase} run={0} anchor=''></TestCaseView>);
  await expect(component.getByText('Annotation text', { exact: false }).first()).toBeVisible();
  await component.getByText('Annotations').click();
  await expect(component.getByText('Annotation text')).not.toBeVisible();
  await expect(component.getByText('Outer step')).toBeVisible();
  await expect(component.getByText('Inner step')).not.toBeVisible();
  await component.getByText('Outer step').click();
  await expect(component.getByText('Inner step')).toBeVisible();
  await expect(component.getByText('test.spec.ts:42')).toBeVisible();
  await expect(component.getByText('My test')).toBeVisible();
});
