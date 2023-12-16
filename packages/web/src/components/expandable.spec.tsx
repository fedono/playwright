import React from 'react';
import { expect, test } from '@playwright/experimental-ct-react';
import { Expandable } from './expandable';

test.use({ viewport: { width: 500, height: 500 } });

test('should render collapsed', async ({ mount }) => {
  const component = await mount(<Expandable expanded={false} setExpanded={() => {}} title='Title'>Details text</Expandable>);
  await expect(component.locator('text=Title')).toBeVisible();
  await expect(component.locator('text=Details')).toBeHidden();
  await expect(component.locator('.codicon-chevron-right')).toBeVisible();
});

test('should render expanded', async ({ mount }) => {
  const component = await mount(<Expandable expanded={true} setExpanded={() => {}} title='Title'>Details text</Expandable>);
  await expect(component.locator('text=Title')).toBeVisible();
  await expect(component.locator('text=Details')).toBeVisible();
  await expect(component.locator('.codicon-chevron-down')).toBeVisible();
});

test('click should expand', async ({ mount }) => {
  let expanded = false;
  const component = await mount(<Expandable expanded={false} setExpanded={e => expanded = e} title='Title'>Details text</Expandable>);
  await component.locator('.codicon-chevron-right').click();
  expect(expanded).toBeTruthy();
});
